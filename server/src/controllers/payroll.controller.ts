import { Request, Response, NextFunction } from 'express';
import Payroll from '../models/payroll.model';
import Employee from '../models/employee.model';
import { ApiError } from '../utils/errorHandler';
import { NominaColombianaService } from '../services/nominaColombiana.service';
import NominaConfig from '../models/nominaConfig.model';

// Obtener nómina por período
export const getPayrollByPeriod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { periodo } = req.query as { periodo?: string };
    
    if (!periodo) {
      return next(new ApiError(400, 'El período es requerido (formato: YYYY-MM)'));
    }

    // Validar formato de período
    if (!/^\d{4}-\d{2}$/.test(periodo)) {
      return next(new ApiError(400, 'Formato de período inválido. Use YYYY-MM'));
    }

    let query: any = { periodo };
    
    // Filtro por empresa del usuario
    const user = (req as any).user;
    if (user?.empresa) {
      query.empresa = user.empresa;
    }
    
    const payroll = await Payroll.findOne(query)
      .populate('empleados.empleado', 'codigo nombre apellido cargo departamento')
      .select('-__v');
    
    if (!payroll) {
      // Si no existe nómina para el período, devolver estructura vacía
      return res.status(200).json({
        success: true,
        data: {
          periodo,
          empleados: [],
          totalNomina: 0,
          totalCostoEmpleador: 0,
          totalSeguridadSocial: 0,
          totalParafiscales: 0,
          totalPrestaciones: 0,
          estado: 'calculada',
          fechaCalculo: new Date(),
        },
      });
    }
    
    return res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

// Calcular nómina para un período
export const calculatePayroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { periodo } = req.body as { periodo: string };
    
    if (!periodo) {
      return next(new ApiError(400, 'El período es requerido (formato: YYYY-MM)'));
    }

    // Validar formato de período
    if (!/^\d{4}-\d{2}$/.test(periodo)) {
      return next(new ApiError(400, 'Formato de período inválido. Use YYYY-MM'));
    }

    // Determinar rango del período
    const [yearStr, monthStr] = periodo.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // JS: meses 0-11
    const periodStart = new Date(year, month, 1);
    const periodEnd = new Date(year, month + 1, 0); // último día del mes
    const diasDelMes = periodEnd.getDate();

    // Obtener empleados con vínculo activo durante el período (incluye quienes se inactivaron dentro del mes)
    const user = (req as any).user;
    let employeeQuery: any = {};
    if (user?.empresa) {
      employeeQuery.empresa = user.empresa;
    }

    const employees = await Employee.find({
      ...employeeQuery,
      fechaIngreso: { $lte: periodEnd },
      $or: [
        { fechaTerminacion: { $exists: false } },
        { fechaTerminacion: { $gte: periodStart } },
      ],
    });
    
    if (employees.length === 0) {
      return next(new ApiError(404, 'No hay empleados activos para calcular la nómina'));
    }

    // Utilidad para contar días entre fechas (incluyente)
    const diasEntre = (inicio: Date, fin: Date) => {
      const start = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
      const end = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());
      const ms = end.getTime() - start.getTime();
      return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)) + 1);
    };

    // Calcular valores para cada empleado según legislación colombiana
    // Obtener configuración de nómina vigente PARA EL PERÍODO
    const nominaConfig = await NominaConfig.findOne({
      ...(user?.empresa ? { empresa: user.empresa } : {}),
      fechaInicioVigencia: { $lte: periodEnd },
    }).sort({ fechaInicioVigencia: -1 });

    const configValores = nominaConfig ? {
      salarioMinimoMensual: nominaConfig.salarioMinimoMensual,
      auxilioTransporteMensual: nominaConfig.auxilioTransporteMensual,
      topeAuxilioMultiplo: nominaConfig.topeAuxilioMultiplo,
    } : undefined;

    // Snapshot de configuración aplicada para garantizar inmutabilidad histórica
    const appliedConfig = {
      fuente: nominaConfig ? 'config' as const : 'default' as const,
      nominaConfigId: nominaConfig?._id,
      anioVigente: nominaConfig?.anioVigente,
      fechaInicioVigencia: nominaConfig?.fechaInicioVigencia,
      salarioMinimoMensual: configValores?.salarioMinimoMensual ?? NominaColombianaService.SALARIO_MINIMO_2024,
      auxilioTransporteMensual: configValores?.auxilioTransporteMensual ?? NominaColombianaService.AUXILIO_TRANSPORTE_2024,
      topeAuxilioMultiplo: configValores?.topeAuxilioMultiplo ?? 2,
    };

    const payrollItems = employees.map(employee => {
      // Validar salario mínimo
      const salarioParaValidar = (employee as any).usaSalarioMinimo && configValores ? configValores.salarioMinimoMensual : employee.salarioBase;
      if (!NominaColombianaService.validarSalarioMinimo(salarioParaValidar, configValores)) {
        const smmlv = configValores?.salarioMinimoMensual ?? NominaColombianaService.SALARIO_MINIMO_2024;
        throw new ApiError(400, `El salario del empleado ${employee.nombre} ${employee.apellido} (${salarioParaValidar}) está por debajo del salario mínimo legal (${smmlv})`);
      }
      
      // Calcular días trabajados en el período
      const inicio = employee.fechaIngreso > periodStart ? employee.fechaIngreso : periodStart;
      let fin = periodEnd;
      if (employee.estado === 'inactivo' && employee.fechaTerminacion) {
        fin = employee.fechaTerminacion < periodEnd ? employee.fechaTerminacion : periodEnd;
      }
      const diasTrabajados = diasEntre(inicio, fin);

      // Calcular nómina prorrateada en el período
      const calculoNomina = NominaColombianaService.calcularNominaPeriodo(employee as any, diasTrabajados, diasDelMes, configValores);
      
      return {
        empleado: employee._id,
        salarioBase: calculoNomina.salarioBase,
        auxilioTransporte: calculoNomina.auxilioTransporte,
        seguridadSocial: {
          salud: {
            empresa: calculoNomina.seguridadSocial.salud.empresa,
            empleado: calculoNomina.seguridadSocial.salud.empleado,
            total: calculoNomina.seguridadSocial.salud.total
          },
          pension: {
            empresa: calculoNomina.seguridadSocial.pension.empresa,
            empleado: calculoNomina.seguridadSocial.pension.empleado,
            total: calculoNomina.seguridadSocial.pension.total
          },
          arl: {
            empresa: calculoNomina.seguridadSocial.arl.empresa,
            empleado: calculoNomina.seguridadSocial.arl.empleado,
            total: calculoNomina.seguridadSocial.arl.total
          }
        },
        parafiscales: {
          sena: calculoNomina.parafiscales.sena,
          icbf: calculoNomina.parafiscales.icbf,
          cajaCompensacion: calculoNomina.parafiscales.cajaCompensacion,
          total: calculoNomina.parafiscales.total
        },
        prestacionesSociales: {
          cesantias: calculoNomina.prestacionesSociales.cesantias,
          interesesCesantias: calculoNomina.prestacionesSociales.interesesCesantias,
          primaServicios: calculoNomina.prestacionesSociales.primaServicios,
          total: calculoNomina.prestacionesSociales.total
        },
        deduccionesEmpleado: calculoNomina.deducciones.total,
        netoAPagar: calculoNomina.netoAPagar,
        costoTotalEmpleador: calculoNomina.costoTotalEmpleador
      };
    });

    // Calcular totales
    const totalNomina = payrollItems.reduce((total, item) => total + item.netoAPagar, 0);
    const totalCostoEmpleador = payrollItems.reduce((total, item) => total + item.costoTotalEmpleador, 0);
    const totalSeguridadSocial = payrollItems.reduce((total, item) => total + item.seguridadSocial.salud.total + item.seguridadSocial.pension.total + item.seguridadSocial.arl.total, 0);
    const totalParafiscales = payrollItems.reduce((total, item) => total + item.parafiscales.total, 0);
    const totalPrestaciones = payrollItems.reduce((total, item) => total + item.prestacionesSociales.total, 0);

    // Verificar si ya existe nómina para este período
    let existingPayroll = await Payroll.findOne({ 
      periodo, 
      empresa: user?.empresa 
    });

    if (existingPayroll) {
      // Actualizar nómina existente
      existingPayroll.empleados = payrollItems;
      existingPayroll.totalNomina = totalNomina;
      existingPayroll.totalCostoEmpleador = totalCostoEmpleador;
      existingPayroll.totalSeguridadSocial = totalSeguridadSocial;
      existingPayroll.totalParafiscales = totalParafiscales;
      existingPayroll.totalPrestaciones = totalPrestaciones;
      existingPayroll.configAplicada = appliedConfig as any;
      existingPayroll.fechaCalculo = new Date();
      await existingPayroll.save();
      
      return res.status(200).json({
        success: true,
        message: 'Nómina actualizada exitosamente',
        data: existingPayroll,
        resumen: {
          totalNomina,
          totalCostoEmpleador,
          totalSeguridadSocial,
          totalParafiscales,
          totalPrestaciones,
          numeroEmpleados: payrollItems.length
        }
      });
    } else {
      // Crear nueva nómina
      const payroll = await Payroll.create({
        periodo,
        empleados: payrollItems,
        totalNomina,
        totalCostoEmpleador,
        totalSeguridadSocial,
        totalParafiscales,
        totalPrestaciones,
        configAplicada: appliedConfig,
        empresa: user?.empresa,
      });
      
      return res.status(201).json({
        success: true,
        message: 'Nómina calculada exitosamente',
        data: payroll,
        resumen: {
          totalNomina,
          totalCostoEmpleador,
          totalSeguridadSocial,
          totalParafiscales,
          totalPrestaciones,
          numeroEmpleados: payrollItems.length
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Marcar nómina como pagada
export const markPayrollAsPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fechaPago } = req.body;
    
    const payroll = await Payroll.findById(id);
    
    if (!payroll) {
      return next(new ApiError(404, 'Nómina no encontrada'));
    }

    // Verificar que la nómina pertenezca a la empresa del usuario
    const user = (req as any).user;
    if (user?.empresa && payroll.empresa !== user.empresa) {
      return next(new ApiError(403, 'No tiene acceso a esta nómina'));
    }
    
    if (payroll.estado === 'pagada') {
      return next(new ApiError(400, 'La nómina ya está marcada como pagada'));
    }
    
    payroll.estado = 'pagada';
    payroll.fechaPago = fechaPago ? new Date(fechaPago) : new Date();
    await payroll.save();
    
    return res.status(200).json({
      success: true,
      message: 'Nómina marcada como pagada exitosamente',
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};
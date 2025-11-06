import { Request, Response, NextFunction } from 'express';
import Payroll from '../models/payroll.model';
import Employee from '../models/employee.model';
import { ApiError } from '../utils/errorHandler';

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

    // Obtener empleados activos
    const user = (req as any).user;
    let employeeQuery: any = { estado: 'activo' };
    if (user?.empresa) {
      employeeQuery.empresa = user.empresa;
    }
    
    const employees = await Employee.find(employeeQuery);
    
    if (employees.length === 0) {
      return next(new ApiError(404, 'No hay empleados activos para calcular la nómina'));
    }

    // Calcular valores para cada empleado (simplificado)
    const payrollItems = employees.map(employee => {
      const transporte = 140000; // Auxilio de transporte fijo por ahora
      const otrosEarnings = 0; // Se pueden agregar más conceptos
      const deducciones = employee.salarioBase * 0.08; // 8% de deducciones simplificado
      const netoAPagar = employee.salarioBase + transporte + otrosEarnings - deducciones;
      
      return {
        empleado: employee._id,
        salarioBase: employee.salarioBase,
        transporte,
        otrosEarnings,
        deducciones,
        netoAPagar: Math.round(netoAPagar),
      };
    });

    const totalNomina = payrollItems.reduce((total, item) => total + item.netoAPagar, 0);

    // Verificar si ya existe nómina para este período
    let existingPayroll = await Payroll.findOne({ 
      periodo, 
      empresa: user?.empresa 
    });

    if (existingPayroll) {
      // Actualizar nómina existente
      existingPayroll.empleados = payrollItems;
      existingPayroll.totalNomina = totalNomina;
      existingPayroll.fechaCalculo = new Date();
      await existingPayroll.save();
      
      return res.status(200).json({
        success: true,
        message: 'Nómina actualizada exitosamente',
        data: existingPayroll,
      });
    } else {
      // Crear nueva nómina
      const payroll = await Payroll.create({
        periodo,
        empleados: payrollItems,
        totalNomina,
        empresa: user?.empresa,
      });
      
      return res.status(201).json({
        success: true,
        message: 'Nómina calculada exitosamente',
        data: payroll,
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
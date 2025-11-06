import { IEmployee } from '../models/employee.model';

export class NominaColombianaService {
  // --- Constantes de Nómina para 2024 ---
  public static readonly SALARIO_MINIMO_2024 = 1300000;
  public static readonly AUXILIO_TRANSPORTE_2024 = 162000;
  public static readonly TOPE_AUXILIO_TRANSPORTE = 2 * this.SALARIO_MINIMO_2024;
  
  // Tipo de valores configurables
  public static buildValoresConfigurados(config?: { salarioMinimoMensual: number; auxilioTransporteMensual: number; topeAuxilioMultiplo?: number }) {
    const smmlv = config?.salarioMinimoMensual ?? this.SALARIO_MINIMO_2024;
    const auxTrans = config?.auxilioTransporteMensual ?? this.AUXILIO_TRANSPORTE_2024;
    const topeAuxMult = config?.topeAuxilioMultiplo ?? 2;
    return { smmlv, auxTrans, topeAuxMult };
  }

  // --- Porcentajes de Seguridad Social (Empleado) ---
  private static readonly PORCENTAJE_SALUD_EMPLEADO = 0.04;
  private static readonly PORCENTAJE_PENSION_EMPLEADO = 0.04;

  // --- Porcentajes de Seguridad Social (Empresa) ---
  private static readonly PORCENTAJE_SALUD_EMPRESA = 0.085;
  private static readonly PORCENTAJE_PENSION_EMPRESA = 0.12;
  private static readonly PORCENTAJE_ARL_NIVEL_1 = 0.00522; // Nivel de riesgo 1 (mínimo)

  // --- Porcentajes de Parafiscales (Empresa) ---
  private static readonly PORCENTAJE_SENA = 0.02;
  private static readonly PORCENTAJE_ICBF = 0.03;
  private static readonly PORCENTAJE_CAJA_COMPENSACION = 0.04;
  
  // --- Porcentajes de Prestaciones Sociales (Empresa) ---
  private static readonly PORCENTAJE_CESANTIAS = 0.0833; // Equivale a 1/12 del salario
  private static readonly PORCENTAJE_INTERESES_CESANTIAS = 0.01; // 1% mensual sobre cesantías acumuladas
  private static readonly PORCENTAJE_PRIMA = 0.0833; // Equivale a 1/12 del salario

  /**
   * Valida si el salario base de un empleado es igual o superior al mínimo legal.
   * @param salarioBase Salario a validar.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  public static validarSalarioMinimo(salarioBase: number, config?: { salarioMinimoMensual: number }): boolean {
    const smmlv = config?.salarioMinimoMensual ?? this.SALARIO_MINIMO_2024;
    return salarioBase >= smmlv;
  }

  /**
   * Calcula la nómina completa de un empleado según la legislación colombiana.
   * @param employee Objeto del empleado con sus datos.
   * @returns Un objeto con todos los valores de la nómina calculados.
   */
  public static calcularNominaCompleta(employee: IEmployee) {
    const { salarioBase } = employee;

    // 1. Ingreso Base de Cotización (IBC)
    const recibeAuxilioTransporte = salarioBase <= this.TOPE_AUXILIO_TRANSPORTE;
    const auxilioTransporte = recibeAuxilioTransporte ? this.AUXILIO_TRANSPORTE_2024 : 0;
    const ibc = salarioBase + (recibeAuxilioTransporte ? 0 : auxilioTransporte); // El auxilio no suma para IBC

    // 2. Deducciones del Empleado
    const saludEmpleado = ibc * this.PORCENTAJE_SALUD_EMPLEADO;
    const pensionEmpleado = ibc * this.PORCENTAJE_PENSION_EMPLEADO;
    const deduccionesEmpleado = {
      salud: saludEmpleado,
      pension: pensionEmpleado,
      total: saludEmpleado + pensionEmpleado,
    };

    // 3. Aportes de la Empresa (Seguridad Social)
    const saludEmpresa = ibc * this.PORCENTAJE_SALUD_EMPRESA;
    const pensionEmpresa = ibc * this.PORCENTAJE_PENSION_EMPRESA;
    const arlEmpresa = ibc * this.PORCENTAJE_ARL_NIVEL_1;
    const seguridadSocial = {
      salud: { empresa: saludEmpresa, empleado: saludEmpleado, total: saludEmpresa + saludEmpleado },
      pension: { empresa: pensionEmpresa, empleado: pensionEmpleado, total: pensionEmpresa + pensionEmpleado },
      arl: { empresa: arlEmpresa, empleado: 0, total: arlEmpresa },
    };

    // 4. Aportes de la Empresa (Parafiscales)
    // Exoneración para salarios inferiores a 10 SMMLV (Ley 1607 de 2012)
    const baseParafiscales = salarioBase > 10 * this.SALARIO_MINIMO_2024 ? ibc : 0;
    const sena = baseParafiscales * this.PORCENTAJE_SENA;
    const icbf = baseParafiscales * this.PORCENTAJE_ICBF;
    const cajaCompensacion = ibc * this.PORCENTAJE_CAJA_COMPENSACION; // La caja no está exonerada
    const parafiscales = {
      sena,
      icbf,
      cajaCompensacion,
      total: sena + icbf + cajaCompensacion,
    };

    // 5. Provisiones de la Empresa (Prestaciones Sociales)
    const basePrestaciones = salarioBase + auxilioTransporte;
    const cesantias = basePrestaciones * this.PORCENTAJE_CESANTIAS;
    const interesesCesantias = cesantias * this.PORCENTAJE_INTERESES_CESANTIAS;
    const primaServicios = basePrestaciones * this.PORCENTAJE_PRIMA;
    const prestacionesSociales = {
      cesantias,
      interesesCesantias,
      primaServicios,
      total: cesantias + interesesCesantias + primaServicios,
    };

    // 6. Totales
    const netoAPagar = salarioBase + auxilioTransporte - deduccionesEmpleado.total;
    const costoTotalEmpleador =
      salarioBase +
      auxilioTransporte +
      seguridadSocial.salud.empresa +
      seguridadSocial.pension.empresa +
      seguridadSocial.arl.empresa +
      parafiscales.total +
      prestacionesSociales.total;

    return {
      salarioBase,
      auxilioTransporte,
      ibc,
      deducciones: deduccionesEmpleado,
      seguridadSocial,
      parafiscales,
      prestacionesSociales,
      netoAPagar,
      costoTotalEmpleador,
    };
  }

  /**
   * Calcula la nómina prorrateada por días trabajados dentro de un mes.
   * @param employee Empleado
   * @param diasTrabajados Días trabajados dentro del mes seleccionado
   * @param diasDelMes Total de días del mes
   */
  public static calcularNominaPeriodo(
    employee: IEmployee,
    diasTrabajados: number,
    diasDelMes: number,
    config?: { salarioMinimoMensual: number; auxilioTransporteMensual: number; topeAuxilioMultiplo?: number }
  ) {
    const dias = Math.max(0, Math.min(diasTrabajados, diasDelMes));
    const proporcion = diasDelMes > 0 ? dias / diasDelMes : 0;
    const valores = this.buildValoresConfigurados(config);
    const salarioBaseMensual = (employee as any).usaSalarioMinimo ? valores.smmlv : (employee.salarioBase || 0);
    const salarioProrrateado = salarioBaseMensual * proporcion;
    const recibeAuxilioTransporte = salarioBaseMensual <= valores.topeAuxMult * valores.smmlv;
    const auxilioTransporteMensual = recibeAuxilioTransporte ? valores.auxTrans : 0;
    const auxilioTransporteProrr = auxilioTransporteMensual * proporcion;

    // El auxilio de transporte no suma para el IBC
    const ibc = salarioProrrateado;

    // Deducciones del empleado
    const saludEmpleado = ibc * this.PORCENTAJE_SALUD_EMPLEADO;
    const pensionEmpleado = ibc * this.PORCENTAJE_PENSION_EMPLEADO;
    const deduccionesEmpleado = {
      salud: saludEmpleado,
      pension: pensionEmpleado,
      total: saludEmpleado + pensionEmpleado,
    };

    // Aportes empresa - seguridad social
    const saludEmpresa = ibc * this.PORCENTAJE_SALUD_EMPRESA;
    const pensionEmpresa = ibc * this.PORCENTAJE_PENSION_EMPRESA;
    const arlEmpresa = ibc * this.PORCENTAJE_ARL_NIVEL_1;
    const seguridadSocial = {
      salud: { empresa: saludEmpresa, empleado: saludEmpleado, total: saludEmpresa + saludEmpleado },
      pension: { empresa: pensionEmpresa, empleado: pensionEmpleado, total: pensionEmpresa + pensionEmpleado },
      arl: { empresa: arlEmpresa, empleado: 0, total: arlEmpresa },
    };

    // Parafiscales (mismo criterio de exoneración que cálculo mensual)
    const baseParafiscales = salarioBaseMensual > 10 * valores.smmlv ? ibc : 0;
    const sena = baseParafiscales * this.PORCENTAJE_SENA;
    const icbf = baseParafiscales * this.PORCENTAJE_ICBF;
    const cajaCompensacion = ibc * this.PORCENTAJE_CAJA_COMPENSACION;
    const parafiscales = {
      sena,
      icbf,
      cajaCompensacion,
      total: sena + icbf + cajaCompensacion,
    };

    // Prestaciones sociales sobre devengado prorrateado
    const basePrestaciones = salarioProrrateado + auxilioTransporteProrr;
    const cesantias = basePrestaciones * this.PORCENTAJE_CESANTIAS;
    // Intereses de cesantías proporcional a días del año (aprox.)
    const interesesCesantias = cesantias * 0.12 * (dias / 360);
    const primaServicios = basePrestaciones * this.PORCENTAJE_PRIMA;
    const prestacionesSociales = {
      cesantias,
      interesesCesantias,
      primaServicios,
      total: cesantias + interesesCesantias + primaServicios,
    };

    // Totales
    const devengado = salarioProrrateado + auxilioTransporteProrr;
    const netoAPagar = devengado - deduccionesEmpleado.total;
    const costoSeguridadSocialEmpleador = saludEmpresa + pensionEmpresa + arlEmpresa;
    const costoTotalEmpleador = devengado + costoSeguridadSocialEmpleador + parafiscales.total + prestacionesSociales.total;

    return {
      salarioBase: salarioProrrateado,
      auxilioTransporte: auxilioTransporteProrr,
      ibc,
      deducciones: deduccionesEmpleado,
      seguridadSocial,
      parafiscales,
      prestacionesSociales,
      netoAPagar,
      costoTotalEmpleador,
    };
  }
}
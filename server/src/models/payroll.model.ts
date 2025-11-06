import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayrollItem {
  empleado: mongoose.Types.ObjectId;
  salarioBase: number;
  auxilioTransporte: number;
  seguridadSocial: {
    salud: {
      empresa: number;
      empleado: number;
      total: number;
    };
    pension: {
      empresa: number;
      empleado: number;
      total: number;
    };
    arl: {
      empresa: number;
      empleado: number;
      total: number;
    };
  };
  parafiscales: {
    sena: number;
    icbf: number;
    cajaCompensacion: number;
    total: number;
  };
  prestacionesSociales: {
    cesantias: number;
    interesesCesantias: number;
    primaServicios: number;
    total: number;
  };
  deduccionesEmpleado: number;
  netoAPagar: number;
  costoTotalEmpleador: number;
  // Campos antiguos para compatibilidad
  transporte?: number;
  otrosEarnings?: number;
  deducciones?: number;
  estado?: 'calculada' | 'pagada';
}

export interface IPayrollModel extends Model<IPayroll> {
  generatePeriod(): string;
}

export interface IPayroll extends Document {
  periodo: string; // Formato YYYY-MM
  empleados: IPayrollItem[];
  totalNomina: number;
  totalCostoEmpleador: number;
  totalSeguridadSocial: number;
  totalParafiscales: number;
  totalPrestaciones: number;
  configAplicada?: {
    fuente: 'config' | 'default';
    nominaConfigId?: mongoose.Types.ObjectId;
    anioVigente?: number;
    fechaInicioVigencia?: Date;
    salarioMinimoMensual: number;
    auxilioTransporteMensual: number;
    topeAuxilioMultiplo: number;
  };
  estado: 'calculada' | 'pagada' | 'anulada';
  fechaCalculo: Date;
  fechaPago?: Date;
  empresa?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const PayrollItemSchema: Schema = new Schema(
  {
    empleado: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    salarioBase: { type: Number, required: true, min: 0 },
    auxilioTransporte: { type: Number, default: 0, min: 0 },
    seguridadSocial: {
      salud: {
        empresa: { type: Number, default: 0, min: 0 },
        empleado: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      pension: {
        empresa: { type: Number, default: 0, min: 0 },
        empleado: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      arl: {
        empresa: { type: Number, default: 0, min: 0 },
        empleado: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      }
    },
    parafiscales: {
      sena: { type: Number, default: 0, min: 0 },
      icbf: { type: Number, default: 0, min: 0 },
      cajaCompensacion: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 }
    },
    prestacionesSociales: {
      cesantias: { type: Number, default: 0, min: 0 },
      interesesCesantias: { type: Number, default: 0, min: 0 },
      primaServicios: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 }
    },
    deduccionesEmpleado: { type: Number, default: 0, min: 0 },
    netoAPagar: { type: Number, required: true, min: 0 },
    costoTotalEmpleador: { type: Number, default: 0, min: 0 },
    // Campos antiguos para compatibilidad
    transporte: { type: Number, min: 0 },
    otrosEarnings: { type: Number, min: 0 },
    deducciones: { type: Number, min: 0 }
  },
  { _id: false }
);

const PayrollSchema: Schema = new Schema(
  {
    periodo: { type: String, required: true, match: /^\d{4}-\d{2}$/ }, // YYYY-MM
    empleados: { type: [PayrollItemSchema], required: true },
    totalNomina: { type: Number, required: true, min: 0 },
    totalCostoEmpleador: { type: Number, default: 0, min: 0 },
    totalSeguridadSocial: { type: Number, default: 0, min: 0 },
    totalParafiscales: { type: Number, default: 0, min: 0 },
    totalPrestaciones: { type: Number, default: 0, min: 0 },
    configAplicada: {
      fuente: { type: String, enum: ['config', 'default'] },
      nominaConfigId: { type: Schema.Types.ObjectId, ref: 'NominaConfig' },
      anioVigente: { type: Number },
      fechaInicioVigencia: { type: Date },
      salarioMinimoMensual: { type: Number, required: true, min: 0 },
      auxilioTransporteMensual: { type: Number, required: true, min: 0 },
      topeAuxilioMultiplo: { type: Number, required: true, min: 0 },
    },
    estado: { type: String, enum: ['calculada', 'pagada', 'anulada'], default: 'calculada' },
    fechaCalculo: { type: Date, default: Date.now },
    fechaPago: { type: Date },
    empresa: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  }
);

// Índice compuesto para evitar duplicados por período y empresa
PayrollSchema.index({ periodo: 1, empresa: 1 }, { unique: true });

const Payroll: IPayrollModel = mongoose.models.Payroll as IPayrollModel || mongoose.model<IPayroll, IPayrollModel>('Payroll', PayrollSchema);

export default Payroll;
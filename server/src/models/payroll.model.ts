import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayrollItem {
  empleado: mongoose.Types.ObjectId;
  salarioBase: number;
  transporte: number;
  otrosEarnings: number;
  deducciones: number;
  netoAPagar: number;
}

export interface IPayrollModel extends Model<IPayroll> {
  generatePeriod(): string;
}

export interface IPayroll extends Document {
  periodo: string; // Formato YYYY-MM
  empleados: IPayrollItem[];
  totalNomina: number;
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
    transporte: { type: Number, default: 0, min: 0 },
    otrosEarnings: { type: Number, default: 0, min: 0 },
    deducciones: { type: Number, default: 0, min: 0 },
    netoAPagar: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PayrollSchema: Schema = new Schema(
  {
    periodo: { type: String, required: true, match: /^\d{4}-\d{2}$/ }, // YYYY-MM
    empleados: { type: [PayrollItemSchema], required: true },
    totalNomina: { type: Number, required: true, min: 0 },
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
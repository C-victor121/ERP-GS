import mongoose, { Schema, Document, model } from 'mongoose';

export type VariableTipo = 'number' | 'string' | 'boolean';

export interface INominaVariable extends Document {
  nombre: string;
  clave: string; // identificador único por empresa
  tipo: VariableTipo;
  valorNumero?: number;
  valorTexto?: string;
  valorBooleano?: boolean;
  descripcion?: string;
  anioVigente?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  empresa?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NominaVariableSchema = new Schema<INominaVariable>({
  nombre: { type: String, required: true, trim: true },
  clave: { type: String, required: true, trim: true },
  tipo: { type: String, enum: ['number', 'string', 'boolean'], required: true },
  valorNumero: { type: Number },
  valorTexto: { type: String },
  valorBooleano: { type: Boolean },
  descripcion: { type: String },
  anioVigente: { type: Number },
  fechaInicio: { type: Date },
  fechaFin: { type: Date },
  empresa: { type: String },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

NominaVariableSchema.index({ clave: 1, empresa: 1 }, { unique: true });

const NominaVariable = model<INominaVariable>('NominaVariable', NominaVariableSchema);

export default NominaVariable;
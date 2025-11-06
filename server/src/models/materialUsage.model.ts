import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface MaterialUsageDocument extends Document {
  project: Types.ObjectId;
  task?: Types.ObjectId;
  nombre: string; // material
  cantidad: number;
  unidad?: string; // ej. 'unidad', 'kg', 'm'
  costoUnitario?: number;
  costoTotal?: number;
  empresa?: string;
  fecha?: Date;
  nota?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialUsageSchema = new Schema<MaterialUsageDocument>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    task: { type: Schema.Types.ObjectId, ref: 'ProjectTask' },
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 0 },
    unidad: { type: String, default: 'unidad' },
    costoUnitario: { type: Number, default: 0 },
    costoTotal: { type: Number, default: 0 },
    empresa: { type: String, index: true },
    fecha: { type: Date, default: () => new Date() },
    nota: { type: String, default: '' },
  },
  { timestamps: true }
);

MaterialUsageSchema.pre('save', function (next) {
  if (this.isModified('cantidad') || this.isModified('costoUnitario') || this.isNew) {
    (this as any).costoTotal = (this as any).cantidad * (this as any).costoUnitario;
  }
  next();
});

export const MaterialUsage: Model<MaterialUsageDocument> = mongoose.models.MaterialUsage || mongoose.model<MaterialUsageDocument>('MaterialUsage', MaterialUsageSchema);
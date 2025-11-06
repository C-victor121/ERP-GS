import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface TimeEntryDocument extends Document {
  project: Types.ObjectId;
  task?: Types.ObjectId;
  empleado?: Types.ObjectId; // ref Employee
  fecha: Date;
  horas: number;
  costoHora?: number;
  nota?: string;
  empresa?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimeEntrySchema = new Schema<TimeEntryDocument>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    task: { type: Schema.Types.ObjectId, ref: 'ProjectTask' },
    empleado: { type: Schema.Types.ObjectId, ref: 'Employee' },
    fecha: { type: Date, required: true },
    horas: { type: Number, required: true, min: 0 },
    costoHora: { type: Number, default: 0 },
    nota: { type: String, default: '' },
    empresa: { type: String, index: true },
  },
  { timestamps: true }
);

export const TimeEntry: Model<TimeEntryDocument> = mongoose.models.TimeEntry || mongoose.model<TimeEntryDocument>('TimeEntry', TimeEntrySchema);
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ProjectTaskDocument extends Document {
  project: Types.ObjectId;
  titulo: string;
  descripcion?: string;
  estado: 'backlog' | 'todo' | 'in_progress' | 'done';
  prioridad?: 'baja' | 'media' | 'alta';
  responsable?: Types.ObjectId; // referencia a Employee si existe
  estimacionHoras?: number;
  horasConsumidas?: number;
  empresa?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectTaskSchema = new Schema<ProjectTaskDocument>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    estado: { type: String, enum: ['backlog', 'todo', 'in_progress', 'done'], default: 'backlog', index: true },
    prioridad: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
    responsable: { type: Schema.Types.ObjectId, ref: 'Employee' },
    estimacionHoras: { type: Number, default: 0 },
    horasConsumidas: { type: Number, default: 0 },
    empresa: { type: String, index: true },
  },
  { timestamps: true }
);

export const ProjectTask: Model<ProjectTaskDocument> = mongoose.models.ProjectTask || mongoose.model<ProjectTaskDocument>('ProjectTask', ProjectTaskSchema);
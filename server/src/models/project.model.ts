import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ProjectDocument extends Document {
  nombre: string;
  codigo?: string;
  descripcion?: string;
  metodologia?: string;
  estado?: 'planeado' | 'en_progreso' | 'pausado' | 'completado' | 'cancelado';
  fechaInicio?: Date;
  fechaFin?: Date;
  empresa?: string;
  presupuesto?: number;
  costos?: {
    materiales?: number;
    manoObra?: number;
    otros?: number;
  };
  progreso?: number; // porcentaje 0-100
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    nombre: { type: String, required: true, trim: true },
    codigo: { type: String, unique: true, sparse: true, trim: true },
    descripcion: { type: String, default: '' },
    metodologia: { type: String, trim: true, default: 'kanban' },
    estado: { type: String, enum: ['planeado', 'en_progreso', 'pausado', 'completado', 'cancelado'], default: 'planeado' },
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
    empresa: { type: String, index: true },
    presupuesto: { type: Number, default: 0 },
    costos: {
      materiales: { type: Number, default: 0 },
      manoObra: { type: Number, default: 0 },
      otros: { type: Number, default: 0 },
    },
    progreso: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const Project: Model<ProjectDocument> = mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);
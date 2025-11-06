import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INominaConfig extends Document {
  anioVigente: number;
  salarioMinimoMensual: number;
  auxilioTransporteMensual: number;
  topeAuxilioMultiplo?: number; // Multiplo del SMMLV para recibir auxilio (ej: 2)
  fechaInicioVigencia: Date;
  empresa?: string; // opcional por empresa
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const NominaConfigSchema: Schema = new Schema(
  {
    anioVigente: { type: Number, required: true },
    salarioMinimoMensual: { type: Number, required: true, min: 0 },
    auxilioTransporteMensual: { type: Number, required: true, min: 0 },
    topeAuxilioMultiplo: { type: Number, default: 2 },
    fechaInicioVigencia: { type: Date, required: true },
    empresa: { type: String, trim: true },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion',
    },
  }
);

const NominaConfig = mongoose.models.NominaConfig || mongoose.model<INominaConfig>('NominaConfig', NominaConfigSchema);

export default NominaConfig;
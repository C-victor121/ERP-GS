import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplierModel extends Model<ISupplier> {
  generateCode(): Promise<string>;
}

export interface ISupplier extends Document {
  codigo: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  rfc: string;
  productos?: string[];
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
  empresa?: string;
}

const SupplierSchema: Schema = new Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código es obligatorio'],
      unique: true,
      trim: true,
      match: [/^GS-PROV-\d{4}$/, 'El formato del código debe ser GS-PROV-XXXX'],
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    contacto: {
      type: String,
      required: [true, 'El nombre de contacto es obligatorio'],
      trim: true,
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
      match: [/^\d{10}$/, 'El teléfono debe tener 10 dígitos'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'El formato del email es inválido'],
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true,
    },
    rfc: {
      type: String,
      required: [true, 'El RFC es obligatorio'],
      trim: true,
      match: [/^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/, 'El formato del RFC es inválido'],
    },
    productos: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    activo: {
      type: Boolean,
      default: true,
    },
    empresa: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion',
    },
  }
);

// Método para generar un nuevo código de proveedor
SupplierSchema.statics.generateCode = async function (): Promise<string> {
  const lastSupplier = await this.findOne()
    .sort({ codigo: -1 })
    .exec();

  let newNumber = 1;
  if (lastSupplier) {
    const lastNumber = parseInt(lastSupplier.codigo.split('-')[2]);
    newNumber = lastNumber + 1;
  }

  return `GS-PROV-${newNumber.toString().padStart(4, '0')}`;
};

export default mongoose.model<ISupplier, ISupplierModel>('Supplier', SupplierSchema);
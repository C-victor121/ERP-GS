import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductModel extends Model<IProduct> {
  generateSKU(): Promise<string>;
}

export interface IProduct extends Document {
  sku: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  ubicacion: string;
  proveedor?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
  empresa?: string;
  fechaCompra?: Date;
  fichaTecnicaUrl?: string;
}

const ProductSchema: Schema = new Schema(
  {
    sku: {
      type: String,
      required: [true, 'El SKU es obligatorio'],
      unique: true,
      trim: true,
      match: [/^GS-INV-\d{4}-\d{3}$/, 'El formato del SKU debe ser GS-INV-YYYY-XXX'],
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: ['paneles', 'inversores', 'baterías', 'cables', 'estructuras', 'otros'],
      default: 'otros',
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    costo: {
      type: Number,
      required: [true, 'El costo es obligatorio'],
      min: [0, 'El costo no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },
    stockMinimo: {
      type: Number,
      required: [true, 'El stock mínimo es obligatorio'],
      default: 5,
      min: [0, 'El stock mínimo no puede ser negativo'],
    },
    ubicacion: {
      type: String,
      required: [true, 'La ubicación es obligatoria'],
      trim: true,
    },
    proveedor: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    activo: {
      type: Boolean,
      default: true,
    },
    empresa: {
      type: String,
      trim: true,
    },
    fechaCompra: {
      type: Date,
    },
    fichaTecnicaUrl: {
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

// Método para generar un nuevo SKU
ProductSchema.statics.generateSKU = async function (): Promise<string> {
  const year = new Date().getFullYear();
  const lastProduct = await this.findOne({ sku: new RegExp(`^GS-INV-${year}`) })
    .sort({ sku: -1 })
    .exec();

  let newNumber = 1;
  if (lastProduct) {
    const lastNumber = parseInt(lastProduct.sku.split('-')[3]);
    newNumber = lastNumber + 1;
  }

  return `GS-INV-${year}-${newNumber.toString().padStart(3, '0')}`;
};

export default mongoose.model<IProduct, IProductModel>('Product', ProductSchema);
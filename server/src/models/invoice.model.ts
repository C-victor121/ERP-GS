import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoiceItem extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface IInvoiceModel extends Model<IInvoice> {
  generateNumber(): Promise<string>;
}

export interface IInvoice extends Document {
  numero: string;
  clienteNombre: string;
  fecha: Date;
  items: IInvoiceItem[];
  subTotal: number;
  taxRate: number; // IVA (%)
  taxAmount: number;
  total: number;
  estado: 'emitida' | 'anulada';
  vendedor?: mongoose.Types.ObjectId;
  empresa?: string;
  observaciones?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const InvoiceItemSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true, min: [1, 'La cantidad debe ser al menos 1'] },
    precioUnitario: { type: Number, required: true, min: [0, 'El precio unitario no puede ser negativo'] },
    subtotal: { type: Number, required: true, min: [0, 'El subtotal no puede ser negativo'] },
  },
  { _id: false }
);

const InvoiceSchema: Schema = new Schema(
  {
    numero: { type: String, required: true, unique: true, trim: true },
    clienteNombre: { type: String, required: true, trim: true },
    fecha: { type: Date, default: Date.now },
    items: { type: [InvoiceItemSchema], required: true },
    subTotal: { type: Number, required: true, min: [0, 'El subtotal no puede ser negativo'] },
    taxRate: { type: Number, required: true, min: [0, 'El impuesto no puede ser negativo'], default: 0 },
    taxAmount: { type: Number, required: true, min: [0, 'El impuesto no puede ser negativo'], default: 0 },
    total: { type: Number, required: true, min: [0, 'El total no puede ser negativo'] },
    estado: { type: String, enum: ['emitida', 'anulada'], default: 'emitida' },
    vendedor: { type: Schema.Types.ObjectId, ref: 'User' },
    empresa: { type: String, trim: true },
    observaciones: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  }
);

// Método para generar un número de factura secuencial: GS-FACT-YYYY-XXXX
InvoiceSchema.statics.generateNumber = async function (): Promise<string> {
  const year = new Date().getFullYear();
  const lastInvoice = await this.findOne({ numero: new RegExp(`^GS-FACT-${year}`) })
    .sort({ numero: -1 })
    .exec();

  let newNumber = 1;
  if (lastInvoice) {
    const parts = (lastInvoice.numero as string).split('-');
    const lastSeq = parseInt(parts[3], 10);
    if (!isNaN(lastSeq)) newNumber = lastSeq + 1;
  }

  return `GS-FACT-${year}-${newNumber.toString().padStart(4, '0')}`;
};

const Invoice: IInvoiceModel = mongoose.models.Invoice as IInvoiceModel || mongoose.model<IInvoice, IInvoiceModel>('Invoice', InvoiceSchema);

export default Invoice;
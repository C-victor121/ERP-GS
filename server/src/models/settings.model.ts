import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AccountsConfig {
  inventoryAccount: string; // PUC cuenta de inventarios
  cogsAccount: string;      // PUC costo de ventas
  purchasesAccount: string; // PUC compras
  adjustmentsAccount: string; // PUC ajustes de inventario
}

export interface InventorySettingsDocument extends Document {
  valuationMethod: 'FIFO' | 'LIFO' | 'PROMEDIO_PONDERADO';
  defaultWarehouse: string;
  defaultLocation: string;
  defaultStockMinimo: number;
  skuPrefix: string;
  allowNegativeStock: boolean;
  units: string[];
  accounts: AccountsConfig;
  taxRate: number; // IVA (%)
  updatedAt: Date;
  // Campos nuevos
  categories: string[]; // Lista de categorías de producto
  accountsByCategory?: Record<string, AccountsConfig>; // Mapa: categoría -> cuentas PUC
}

const AccountsSchema = new Schema<AccountsConfig>({
  inventoryAccount: { type: String, required: true, default: '1435' },
  cogsAccount: { type: String, required: true, default: '6135' },
  purchasesAccount: { type: String, required: true, default: '6130' },
  adjustmentsAccount: { type: String, required: true, default: '6199' },
}, { _id: false });

const InventorySettingsSchema = new Schema<InventorySettingsDocument>({
  valuationMethod: { type: String, enum: ['FIFO', 'LIFO', 'PROMEDIO_PONDERADO'], default: 'PROMEDIO_PONDERADO' },
  defaultWarehouse: { type: String, default: 'Principal' },
  defaultLocation: { type: String, default: 'General' },
  defaultStockMinimo: { type: Number, default: 1 },
  skuPrefix: { type: String, default: 'GS-INV' },
  allowNegativeStock: { type: Boolean, default: false },
  units: { type: [String], default: ['unidad', 'kit', 'caja'] },
  accounts: { type: AccountsSchema, required: true, default: () => ({}) },
  taxRate: { type: Number, default: 0 },
  // Nuevos campos
  categories: { type: [String], default: ['paneles', 'inversores', 'baterías', 'cables', 'estructuras', 'otros'] },
  accountsByCategory: { type: Map, of: AccountsSchema, default: {} },
}, { timestamps: { createdAt: true, updatedAt: true } });

const InventorySettings: Model<InventorySettingsDocument> = mongoose.models.InventorySettings || mongoose.model<InventorySettingsDocument>('InventorySettings', InventorySettingsSchema);

export default InventorySettings;
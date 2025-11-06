import { Request, Response, NextFunction } from 'express';
import InventorySettings from '../models/settings.model';
import { ApiError } from '../utils/errorHandler';

export const getInventorySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await InventorySettings.findOne();
    if (!settings) {
      settings = await InventorySettings.create({});
    }

    // Asegurar accountsByCategory para todas las categorías de forma segura (evitar spread de Map)
    const categories = settings.categories || ['paneles', 'inversores', 'baterías', 'cables', 'estructuras', 'otros'];
    // Convertir cuentas globales a objeto plano para evitar claves internas de Mongoose
    const globalAccountsDoc: any = (settings as any).accounts;
    const globalAccounts = typeof globalAccountsDoc?.toObject === 'function' ? globalAccountsDoc.toObject() : globalAccountsDoc;

    // Normalizar el mapa actual a una instancia de Map
    const rawMap: any = (settings as any).accountsByCategory ?? {};
    const entries: [string, any][] = rawMap instanceof Map
      ? Array.from((rawMap as Map<string, any>).entries())
      : Object.entries(rawMap);
    const ensured = new Map<string, any>(entries);

    let updatedNeeded = false;
    categories.forEach((cat) => {
      if (!ensured.has(cat)) {
        ensured.set(cat, { ...globalAccounts });
        updatedNeeded = true;
      }
    });

    if (updatedNeeded) {
      const ensuredObj = Object.fromEntries(ensured);
      settings = await InventorySettings.findOneAndUpdate({}, { accountsByCategory: ensuredObj }, { new: true });
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateInventorySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;

    const updated = await InventorySettings.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, data: updated, message: 'Configuración de inventario actualizada' });
  } catch (error) {
    next(error);
  }
};
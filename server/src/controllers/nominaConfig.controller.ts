import { Request, Response, NextFunction } from 'express';
import NominaConfig, { INominaConfig } from '../models/nominaConfig.model';
import { ApiError } from '../utils/errorHandler';

// Obtener configuración vigente (por empresa si aplica)
export const getNominaConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const filter: any = {};
    if (user?.empresa) filter.empresa = user.empresa;

    const config = await NominaConfig.findOne(filter).sort({ fechaInicioVigencia: -1 });

    if (!config) {
      // Fallback a valores actuales en servicio (2024) si no hay config
      return res.status(200).json({
        success: true,
        data: {
          anioVigente: new Date().getFullYear(),
          salarioMinimoMensual: 1300000,
          auxilioTransporteMensual: 162000,
          topeAuxilioMultiplo: 2,
          fechaInicioVigencia: new Date(new Date().getFullYear(), 0, 1),
          empresa: user?.empresa,
        },
      });
    }

    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

// Crear/Actualizar configuración de nómina
export const upsertNominaConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { anioVigente, salarioMinimoMensual, auxilioTransporteMensual, topeAuxilioMultiplo, fechaInicioVigencia } = req.body as Partial<INominaConfig>;
    const user = (req as any).user;

    if (!anioVigente || !salarioMinimoMensual || !auxilioTransporteMensual || !fechaInicioVigencia) {
      return next(new ApiError(400, 'anioVigente, salarioMinimoMensual, auxilioTransporteMensual y fechaInicioVigencia son requeridos'));
    }

    const filter: any = {};
    if (user?.empresa) filter.empresa = user.empresa;

    let config = await NominaConfig.findOne(filter).sort({ fechaInicioVigencia: -1 });
    if (config) {
      config.anioVigente = anioVigente;
      config.salarioMinimoMensual = salarioMinimoMensual;
      config.auxilioTransporteMensual = auxilioTransporteMensual;
      config.topeAuxilioMultiplo = topeAuxilioMultiplo ?? config.topeAuxilioMultiplo;
      config.fechaInicioVigencia = new Date(fechaInicioVigencia);
      await config.save();
    } else {
      config = await NominaConfig.create({
        anioVigente,
        salarioMinimoMensual,
        auxilioTransporteMensual,
        topeAuxilioMultiplo: topeAuxilioMultiplo ?? 2,
        fechaInicioVigencia: new Date(fechaInicioVigencia),
        empresa: user?.empresa,
      } as any);
    }

    return res.status(200).json({ success: true, message: 'Configuración de nómina actualizada', data: config });
  } catch (error) {
    next(error);
  }
};
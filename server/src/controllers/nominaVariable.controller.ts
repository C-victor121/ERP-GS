import { Request, Response, NextFunction } from 'express';
import NominaVariable, { INominaVariable } from '../models/nominaVariable.model';
import { ApiError } from '../utils/errorHandler';

// Listar variables
export const listVariables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const filter: any = {};
    if (user?.empresa) filter.empresa = user.empresa;
    const variables = await NominaVariable.find(filter).sort({ fechaInicio: -1, nombre: 1 });
    return res.status(200).json({ success: true, data: variables });
  } catch (error) {
    next(error);
  }
};

// Crear variable
export const createVariable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const payload = req.body as Partial<INominaVariable>;
    if (!payload.nombre || !payload.clave || !payload.tipo) {
      return next(new ApiError(400, 'nombre, clave y tipo son requeridos'));
    }
    const variable = await NominaVariable.create({
      nombre: payload.nombre,
      clave: payload.clave,
      tipo: payload.tipo,
      valorNumero: payload.valorNumero,
      valorTexto: payload.valorTexto,
      valorBooleano: payload.valorBooleano,
      descripcion: payload.descripcion,
      anioVigente: payload.anioVigente,
      fechaInicio: payload.fechaInicio ? new Date(payload.fechaInicio) : undefined,
      fechaFin: payload.fechaFin ? new Date(payload.fechaFin) : undefined,
      empresa: user?.empresa,
      activo: payload.activo ?? true,
    } as any);
    return res.status(201).json({ success: true, message: 'Variable creada', data: variable });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'La clave ya existe para esta empresa'));
    }
    next(error);
  }
};

// Actualizar variable
export const updateVariable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const variable = await NominaVariable.findById(req.params.id);
    if (!variable) return next(new ApiError(404, 'Variable no encontrada'));
    if (user?.empresa && variable.empresa !== user.empresa) {
      return next(new ApiError(403, 'No tiene acceso a esta variable'));
    }
    const payload = req.body as Partial<INominaVariable>;
    variable.nombre = payload.nombre ?? variable.nombre;
    variable.tipo = payload.tipo ?? variable.tipo;
    variable.valorNumero = payload.valorNumero ?? variable.valorNumero;
    variable.valorTexto = payload.valorTexto ?? variable.valorTexto;
    variable.valorBooleano = payload.valorBooleano ?? variable.valorBooleano;
    variable.descripcion = payload.descripcion ?? variable.descripcion;
    variable.anioVigente = payload.anioVigente ?? variable.anioVigente;
    variable.fechaInicio = payload.fechaInicio ? new Date(payload.fechaInicio) : variable.fechaInicio;
    variable.fechaFin = payload.fechaFin ? new Date(payload.fechaFin) : variable.fechaFin;
    variable.activo = payload.activo ?? variable.activo;
    await variable.save();
    return res.status(200).json({ success: true, message: 'Variable actualizada', data: variable });
  } catch (error) {
    next(error);
  }
};

// Eliminar variable
export const deleteVariable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const variable = await NominaVariable.findById(req.params.id);
    if (!variable) return next(new ApiError(404, 'Variable no encontrada'));
    if (user?.empresa && variable.empresa !== user.empresa) {
      return next(new ApiError(403, 'No tiene acceso a esta variable'));
    }
    await NominaVariable.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Variable eliminada' });
  } catch (error) {
    next(error);
  }
};

// Obtener variable por clave
export const getVariableByKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { clave } = req.params as { clave: string };
    const filter: any = { clave };
    if (user?.empresa) filter.empresa = user.empresa;
    const variable = await NominaVariable.findOne(filter).sort({ fechaInicio: -1 });
    if (!variable) return next(new ApiError(404, 'Variable no encontrada'));
    return res.status(200).json({ success: true, data: variable });
  } catch (error) {
    next(error);
  }
};
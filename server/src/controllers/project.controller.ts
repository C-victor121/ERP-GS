import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errorHandler';
import { Project } from '../models/project.model';
import { ProjectTask } from '../models/projectTask.model';
import { TimeEntry } from '../models/timeEntry.model';
import { MaterialUsage } from '../models/materialUsage.model';

// --- Proyectos ---
export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { empresa, estado } = req.query as any;
    const user = (req as any).user;
    const query: any = {};
    if (estado) query.estado = estado;
    if (empresa) query.empresa = empresa; else if (user?.empresa) query.empresa = user.empresa;
    const projects = await Project.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) { next(error); }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    return res.status(200).json({ success: true, data: project });
  } catch (error) { next(error); }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const empresa = user?.empresa || req.body.empresa;
    const payload = { ...req.body, empresa };
    const project = await Project.create(payload);
    return res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return next(ApiError.badRequest(`El ${field} ya está registrado`));
    }
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    // No permitir cambiar empresa
    if (req.body.empresa) delete req.body.empresa;
    const updated = await Project.findByIdAndUpdate(req.params.id as any, req.body, { new: true, runValidators: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    await Project.findByIdAndDelete(req.params.id as any);
    return res.status(200).json({ success: true, data: {}, message: 'Proyecto eliminado' });
  } catch (error) { next(error); }
};

// --- Tareas ---
export const getProjectTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const tasks = await ProjectTask.find({ project: project._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) { next(error); }
};

export const createProjectTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const task = await ProjectTask.create({ ...req.body, project: project._id, empresa: project.empresa });
    return res.status(201).json({ success: true, data: task });
  } catch (error) { next(error); }
};

export const updateProjectTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const updated = await ProjectTask.findOneAndUpdate({ _id: req.params.taskId as any, project: project._id }, req.body, { new: true, runValidators: true });
    if (!updated) return next(ApiError.notFound('Tarea no encontrada'));
    return res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const moveProjectTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estado } = req.body as any;
    if (!estado) return next(ApiError.badRequest('Estado destino requerido'));
    const allowed = ['backlog', 'todo', 'in_progress', 'done'];
    if (!allowed.includes(estado)) return next(ApiError.badRequest('Estado inválido'));
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const task = await ProjectTask.findOneAndUpdate({ _id: req.params.taskId as any, project: project._id }, { estado }, { new: true });
    if (!task) return next(ApiError.notFound('Tarea no encontrada'));
    return res.status(200).json({ success: true, data: task });
  } catch (error) { next(error); }
};

export const deleteProjectTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const deleted = await ProjectTask.findOneAndDelete({ _id: req.params.taskId as any, project: project._id });
    if (!deleted) return next(ApiError.notFound('Tarea no encontrada'));
    return res.status(200).json({ success: true, data: {}, message: 'Tarea eliminada' });
  } catch (error) { next(error); }
};

// --- Tiempos ---
export const getProjectTimes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const times = await TimeEntry.find({ project: project._id }).sort({ fecha: -1 });
    return res.status(200).json({ success: true, count: times.length, data: times });
  } catch (error) { next(error); }
};

export const createProjectTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const entry = await TimeEntry.create({ ...req.body, project: project._id, empresa: project.empresa });
    return res.status(201).json({ success: true, data: entry });
  } catch (error) { next(error); }
};

// --- Materiales ---
export const getProjectMaterials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const mats = await MaterialUsage.find({ project: project._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: mats.length, data: mats });
  } catch (error) { next(error); }
};

export const createProjectMaterial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const mat = await MaterialUsage.create({ ...req.body, project: project._id, empresa: project.empresa });
    return res.status(201).json({ success: true, data: mat });
  } catch (error) { next(error); }
};

// --- Costos y métricas ---
export const getProjectCosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const [times, mats] = await Promise.all([
      TimeEntry.find({ project: project._id }),
      MaterialUsage.find({ project: project._id }),
    ]);
    const manoObra = times.reduce((acc, t) => acc + (t.horas * (t.costoHora || 0)), 0);
    const materiales = mats.reduce((acc, m) => acc + (m.costoTotal || (m.cantidad * (m.costoUnitario || 0))), 0);
    const otros = (project.costos?.otros || 0);
    const total = manoObra + materiales + otros;
    return res.status(200).json({ success: true, data: { manoObra, materiales, otros, total, presupuesto: project.presupuesto || 0 } });
  } catch (error) { next(error); }
};

export const getProjectMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(ApiError.notFound('Proyecto no encontrado'));
    const user = (req as any).user;
    if (user?.empresa && project.empresa !== user.empresa) return next(ApiError.forbidden('No tiene acceso a este proyecto'));
    const tasks = await ProjectTask.find({ project: project._id });
    const total = tasks.length;
    const done = tasks.filter(t => t.estado === 'done').length;
    const avance = total > 0 ? Math.round((done / total) * 100) : 0;
    const costs = await getProjectCosts(req, res, (() => {}) as any) as any;
    // Cuando getProjectCosts responde, no retorna valor; si lo llamamos como función, mejor recalcular aquí
    const [times, mats] = await Promise.all([
      TimeEntry.find({ project: project._id }),
      MaterialUsage.find({ project: project._id }),
    ]);
    const manoObra = times.reduce((acc, t) => acc + (t.horas * (t.costoHora || 0)), 0);
    const materiales = mats.reduce((acc, m) => acc + (m.costoTotal || (m.cantidad * (m.costoUnitario || 0))), 0);
    const otros = (project.costos?.otros || 0);
    const totalCostos = manoObra + materiales + otros;
    const presupuesto = project.presupuesto || 0;
    const rentabilidad = presupuesto > 0 ? Math.round(((presupuesto - totalCostos) / presupuesto) * 100) : undefined;
    return res.status(200).json({ success: true, data: { avance, totalTareas: total, tareasCompletadas: done, costos: { manoObra, materiales, otros, total: totalCostos }, presupuesto, rentabilidad } });
  } catch (error) { next(error); }
};
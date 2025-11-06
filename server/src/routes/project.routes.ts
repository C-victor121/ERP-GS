import { Router } from 'express';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  moveProjectTask,
  deleteProjectTask,
  getProjectTimes,
  createProjectTime,
  getProjectMaterials,
  createProjectMaterial,
  getProjectCosts,
  getProjectMetrics,
} from '../controllers/project.controller';

const router = Router();

// Protegemos todas las rutas de proyectos
router.use(authMiddleware);

// Proyectos
router.get('/', getAllProjects);
router.post('/', checkRole(['admin', 'gerente']), createProject);
router.get('/:id', getProjectById);
router.put('/:id', checkRole(['admin', 'gerente']), updateProject);
router.delete('/:id', checkRole(['admin', 'gerente']), deleteProject);

// Tareas del proyecto
router.get('/:id/tasks', getProjectTasks);
router.post('/:id/tasks', checkRole(['admin', 'gerente']), createProjectTask);
router.put('/:id/tasks/:taskId', checkRole(['admin', 'gerente']), updateProjectTask);
router.patch('/:id/tasks/:taskId/move', checkRole(['admin', 'gerente']), moveProjectTask);
router.delete('/:id/tasks/:taskId', checkRole(['admin', 'gerente']), deleteProjectTask);

// Tiempos
router.get('/:id/times', getProjectTimes);
router.post('/:id/times', checkRole(['admin', 'gerente']), createProjectTime);

// Materiales
router.get('/:id/materials', getProjectMaterials);
router.post('/:id/materials', checkRole(['admin', 'gerente']), createProjectMaterial);

// Costos y métricas
router.get('/:id/costs', getProjectCosts);
router.get('/:id/metrics', getProjectMetrics);

export default router;
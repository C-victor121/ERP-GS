import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getActiveEmployees,
  createEmployeeFolder,
} from '../controllers/employee.controller';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de empleados
router.get('/', getAllEmployees);
router.get('/activos', getActiveEmployees);
router.get('/:id', getEmployeeById);
router.post('/', checkRole(['admin', 'gerente', 'rrhh']), createEmployee);
router.put('/:id', checkRole(['admin', 'gerente', 'rrhh']), updateEmployee);
router.delete('/:id', checkRole(['admin', 'gerente', 'rrhh']), deleteEmployee);
router.post('/:id/folder', checkRole(['admin', 'gerente', 'rrhh']), createEmployeeFolder);

export default router;
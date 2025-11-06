import { Router } from 'express';
import {
  getPayrollByPeriod,
  calculatePayroll,
  markPayrollAsPaid,
} from '../controllers/payroll.controller';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de nómina
router.get('/', getPayrollByPeriod);
router.post('/calculate', checkRole(['admin', 'gerente', 'rrhh']), calculatePayroll);
router.put('/:id/pay', checkRole(['admin', 'gerente', 'rrhh']), markPayrollAsPaid);

export default router;
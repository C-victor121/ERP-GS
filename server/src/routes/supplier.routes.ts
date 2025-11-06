import express, { Router } from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  permanentDeleteSupplier
} from '../controllers/supplier.controller';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware';
import { validateSupplier } from '../middlewares/validation.middleware';

const router = Router();

// Rutas públicas
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);

// Rutas protegidas
router.post('/', authMiddleware, checkRole(['admin', 'gerente']), validateSupplier as express.RequestHandler[], createSupplier);
router.put('/:id', authMiddleware, checkRole(['admin', 'gerente']), validateSupplier as express.RequestHandler[], updateSupplier);
router.delete('/:id', authMiddleware, checkRole(['admin', 'gerente']), deleteSupplier);

// Ruta para eliminación permanente (solo admin)
router.delete('/:id/permanent', authMiddleware, checkRole(['admin']), permanentDeleteSupplier);

export default router;
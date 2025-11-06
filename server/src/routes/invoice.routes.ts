import express, { Router } from 'express';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware';
import { getAllInvoices, getInvoiceById, createInvoice, annulInvoice } from '../controllers/invoice.controller';

const router = Router();

// Rutas protegidas (ventas generalmente restringidas a vendedores, gerentes y admin)
router.get('/', authMiddleware, checkRole(['admin', 'gerente', 'vendedor']), getAllInvoices);
router.get('/:id', authMiddleware, checkRole(['admin', 'gerente', 'vendedor']), getInvoiceById);
router.post('/', authMiddleware, checkRole(['admin', 'gerente', 'vendedor']), createInvoice);
router.patch('/:id/anular', authMiddleware, checkRole(['admin', 'gerente']), annulInvoice);

export default router;
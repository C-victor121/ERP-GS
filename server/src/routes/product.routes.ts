import express, { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  uploadProductFichaTecnica,
} from '../controllers/product.controller';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware';
import { validateProduct, validateStockUpdate } from '../middlewares/validation.middleware';

const router = Router();

// Configuración de multer para PDF de ficha técnica
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params as any;
    const dest = path.resolve(__dirname, '../../uploads/products', id);
    try {
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (err) {
      cb(err as any, dest);
    }
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `ficha-${unique}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Solo se permiten archivos PDF'));
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Rutas públicas
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rutas protegidas
router.post('/', authMiddleware, checkRole(['admin', 'gerente', 'almacen']), validateProduct as express.RequestHandler[], createProduct);
router.put('/:id', authMiddleware, checkRole(['admin', 'gerente', 'almacen']), validateProduct as express.RequestHandler[], updateProduct);
router.delete('/:id', authMiddleware, checkRole(['admin', 'gerente']), deleteProduct);

// Ruta para actualizar stock
router.patch('/:id/stock', authMiddleware, checkRole(['admin', 'gerente', 'almacen']), validateStockUpdate as express.RequestHandler[], updateStock);

// Ruta para subir ficha técnica (PDF)
router.post(
  '/:id/ficha-tecnica',
  authMiddleware,
  checkRole(['admin', 'gerente', 'almacen']),
  upload.single('ficha') as unknown as express.RequestHandler,
  uploadProductFichaTecnica
);

export default router;
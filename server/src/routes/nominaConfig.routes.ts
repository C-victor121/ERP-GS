import { Router } from 'express';
import { getNominaConfig, upsertNominaConfig } from '../controllers/nominaConfig.controller';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener configuración vigente
router.get('/', getNominaConfig);

// Actualizar/crear configuración (solo admin/gerente/RRHH)
router.put('/', checkRole(['admin', 'gerente', 'rrhh']), upsertNominaConfig);

export default router;
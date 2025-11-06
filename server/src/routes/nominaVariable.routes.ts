import { Router } from 'express';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware';
import { listVariables, createVariable, updateVariable, deleteVariable, getVariableByKey } from '../controllers/nominaVariable.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar variables
router.get('/', listVariables);

// Obtener variable por clave
router.get('/clave/:clave', getVariableByKey);

// Crear variable (admin/gerente/RRHH)
router.post('/', checkRole(['admin', 'gerente', 'rrhh']), createVariable);

// Actualizar variable (admin/gerente/RRHH)
router.put('/:id', checkRole(['admin', 'gerente', 'rrhh']), updateVariable);

// Eliminar variable (admin/gerente/RRHH)
router.delete('/:id', checkRole(['admin', 'gerente', 'rrhh']), deleteVariable);

export default router;
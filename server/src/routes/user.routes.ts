import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, changePassword, createUser, updateUserStatus } from '../controllers/user.controller';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para administradores y gerentes
router.post('/', checkRole(['admin', 'gerente']), createUser);
router.get('/', checkRole(['admin', 'gerente']), getAllUsers);
router.get('/:id', checkRole(['admin', 'gerente']), getUserById);
router.put('/:id', checkRole(['admin', 'gerente']), updateUser);
router.patch('/:id/status', checkRole(['admin', 'gerente']), updateUserStatus);
router.delete('/:id', checkRole(['admin']), deleteUser);

// Ruta para cambiar contraseña (cualquier usuario autenticado puede cambiar su propia contraseña)
router.post('/change-password', changePassword);

export default router;
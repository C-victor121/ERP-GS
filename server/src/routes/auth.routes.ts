import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRegister, validateLogin } from '../middlewares/validation.middleware';

const router = Router();

// Ruta para registro de usuarios
router.post('/register', validateRegister, register);

// Ruta para inicio de sesión
router.post('/login', validateLogin, login);

// Ruta para obtener perfil (protegida)
router.get('/profile', authMiddleware, getProfile);

export default router;
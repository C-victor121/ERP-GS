import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import User from '../models/user.model';

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// Middleware para verificar el token JWT
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No hay token, autorización denegada',
      });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];

    // Verificar el token
    const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;

    // Verificar si el usuario existe
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido, usuario no encontrado',
      });
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado, acceso denegado',
      });
    }

    // Añadir datos del usuario a la solicitud para uso posterior
    (req as any).userId = decoded.id;
    (req as any).user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }
};

// Middleware para verificar roles
export const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = (req as any).userId;
      const userFromReq = (req as any).user;

      // Usar usuario del req si está disponible para evitar consulta redundante
      const user = userFromReq ? userFromReq : await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // Verificar si el rol del usuario está en la lista de roles permitidos
      if (!roles.includes(user.rol)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado, no tiene los permisos necesarios',
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar rol',
        error: error.message,
      });
    }
  };
};
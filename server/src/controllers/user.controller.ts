import { Request, Response } from 'express';
import User from '../models/user.model';

// Obtener todos los usuarios
export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message,
    });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message,
    });
  }
};

// Actualizar un usuario
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { nombre, apellido, email, rol, activo } = req.body;

    // Verificar si el usuario existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Actualizar campos
    if (nombre) user.nombre = nombre;
    if (apellido) user.apellido = apellido;
    if (email) user.email = email;
    if (rol !== undefined) user.rol = rol;
    if (activo !== undefined) user.activo = activo;

    // Guardar cambios
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message,
    });
  }
};

// Eliminar un usuario
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message,
    });
  }
};

// Cambiar contraseña
export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).userId;

    // Buscar usuario por ID y seleccionar el campo password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta',
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message,
    });
  }
};

// Actualizar perfil del propio usuario (campos de facturación)
export const updateMe = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const { nit, direccion, telefono, correos } = req.body as {
      nit?: string;
      direccion?: string;
      telefono?: string;
      correos?: string[] | string;
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (nit !== undefined) user.nit = nit;
    if (direccion !== undefined) user.direccion = direccion;
    if (telefono !== undefined) user.telefono = telefono;
    if (correos !== undefined) {
      const emailsArray = Array.isArray(correos)
        ? correos
        : String(correos)
            .split(',')
            .map((e) => e.trim())
            .filter((e) => !!e);
      user.correos = emailsArray;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        empresa: (user as any).empresa,
        nit: (user as any).nit,
        direccion: (user as any).direccion,
        telefono: (user as any).telefono,
        correos: (user as any).correos,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al actualizar perfil', error: error.message });
  }
};
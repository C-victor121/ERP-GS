import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from '../models/user.model';
import config from '../config/config';

// Controlador para el registro de usuarios
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe con ese email',
      });
    }

    // Crear nuevo usuario
    const user = new User({
      nombre,
      apellido,
      email,
      password,
      rol,
    });

    // Guardar usuario en la base de datos
    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id },
      config.jwtSecret as Secret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
    );

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
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
    return res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

// Controlador para el inicio de sesión
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email y seleccionar el campo password
    const user = await User.findOne({ email }).select('+password');

    // Verificar si el usuario existe
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar si la contraseña es correcta
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Actualizar último acceso
    user.ultimoAcceso = new Date();
    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id },
      config.jwtSecret as Secret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
    );

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
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
    return res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

// Controlador para obtener el perfil del usuario
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    // El middleware de autenticación ya ha verificado el token y añadido el userId a la solicitud
    const userId = (req as any).userId;

    // Buscar usuario por ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        empresa: (user as any).empresa,
        fechaCreacion: user.fechaCreacion,
        ultimoAcceso: user.ultimoAcceso,
        nit: (user as any).nit,
        direccion: (user as any).direccion,
        telefono: (user as any).telefono,
        correos: (user as any).correos,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message,
    });
  }
};
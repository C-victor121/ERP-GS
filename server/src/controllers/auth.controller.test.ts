import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { register, login, getProfile } from './auth.controller';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

// Mock de los modelos y dependencias
jest.mock('../models/user.model');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      // Configurar mocks
      const userData = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        password: 'password123',
        rol: 'vendedor',
      };

      req.body = userData;

      // Mock de User.findOne para que devuelva null (usuario no existe)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Mock de User constructor y save
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        ...userData,
        save: jest.fn().mockResolvedValue(true),
      };
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);

      // Mock de jwt.sign
      const mockToken = 'test-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Ejecutar el controlador
      await register(req as Request, res as Response);

      // Verificar resultados
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockUser.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Usuario registrado exitosamente',
          token: mockToken,
        })
      );
    });

    it('debería devolver error si el usuario ya existe', async () => {
      // Configurar mocks
      req.body = {
        email: 'existing@example.com',
      };

      // Mock de User.findOne para que devuelva un usuario existente
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });

      // Ejecutar el controlador
      await register(req as Request, res as Response);

      // Verificar resultados
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'El usuario ya existe con ese email',
        })
      );
    });
  });

  // Más pruebas para login y getProfile se pueden agregar siguiendo el mismo patrón
});
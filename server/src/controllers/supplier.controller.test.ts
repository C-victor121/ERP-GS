import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, permanentDeleteSupplier } from './supplier.controller';
import Supplier from '../models/supplier.model';
import Product from '../models/product.model';
import { ApiError } from '../utils/errorHandler';

// Mock de Supplier y Product y sus métodos
jest.mock('../models/supplier.model', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  generateCode: jest.fn(),
}));

jest.mock('../models/product.model', () => ({
  countDocuments: jest.fn(),
}));

// Mock de next function
const mockNext = jest.fn();

describe('Supplier Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getAllSuppliers', () => {
    it('debería obtener todos los proveedores', async () => {
      const mockSuppliers = [
        { _id: '1', nombre: 'Proveedor 1', email: 'proveedor1@example.com' },
        { _id: '2', nombre: 'Proveedor 2', email: 'proveedor2@example.com' },
      ];

      mockRequest.query = {};
      (Supplier.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSuppliers),
      });

      await getAllSuppliers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Supplier.find).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockSuppliers,
      });
    });

    it('debería filtrar proveedores activos', async () => {
      const mockSuppliers = [
        { _id: '1', nombre: 'Proveedor 1', email: 'proveedor1@example.com', activo: true },
      ];

      mockRequest.query = { activo: 'true' };
      (Supplier.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSuppliers),
      });

      await getAllSuppliers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Supplier.find).toHaveBeenCalledWith({ activo: true });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockSuppliers,
      });
    });
  });

  describe('getSupplierById', () => {
    it('debería obtener un proveedor por ID', async () => {
      const mockSupplier = { _id: '1', nombre: 'Proveedor 1', email: 'proveedor1@example.com' };
      mockRequest.params = { id: '1' };

      (Supplier.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSupplier),
      });

      await getSupplierById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Supplier.findById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSupplier,
      });
    });

    it('debería llamar a next con error si el proveedor no existe', async () => {
      mockRequest.params = { id: '999' };

      (Supplier.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getSupplierById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('createSupplier', () => {
    it('debería crear un nuevo proveedor con código generado', async () => {
      const mockSupplier = { 
        _id: '1', 
        nombre: 'Nuevo Proveedor', 
        email: 'nuevo@example.com',
        codigo: 'GS-PROV-0001'
      };
      
      mockRequest.body = { 
        nombre: 'Nuevo Proveedor', 
        email: 'nuevo@example.com',
        contacto: 'Juan Pérez',
        telefono: '1234567890',
        direccion: 'Calle Principal 123',
        rfc: 'ABC123456XYZ'
      };

      (Supplier.findOne as jest.Mock).mockResolvedValue(null);
      (Supplier.generateCode as jest.Mock).mockResolvedValue('GS-PROV-0001');
      (Supplier.create as jest.Mock).mockResolvedValue(mockSupplier);

      await createSupplier(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Supplier.findOne).toHaveBeenCalledWith({ email: 'nuevo@example.com' });
      expect(Supplier.generateCode).toHaveBeenCalled();
      expect(Supplier.create).toHaveBeenCalledWith({
        ...mockRequest.body,
        codigo: 'GS-PROV-0001'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSupplier,
      });
    });

    it('debería devolver error si ya existe un proveedor con el mismo email', async () => {
      mockRequest.body = { 
        nombre: 'Nuevo Proveedor', 
        email: 'existente@example.com' 
      };

      (Supplier.findOne as jest.Mock).mockResolvedValue({ _id: '2', email: 'existente@example.com' });

      await createSupplier(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
      expect(mockNext.mock.calls[0][0].message).toBe('Ya existe un proveedor con este email');
    });
  });

  describe('deleteSupplier', () => {
    it('debería desactivar un proveedor', async () => {
      const mockSupplier = { 
        _id: '1', 
        nombre: 'Proveedor a desactivar', 
        activo: false 
      };
      
      mockRequest.params = { id: '1' };

      (Product.countDocuments as jest.Mock).mockResolvedValue(0);
      (Supplier.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockSupplier);

      await deleteSupplier(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Product.countDocuments).toHaveBeenCalledWith({ proveedor: '1' });
      expect(Supplier.findByIdAndUpdate).toHaveBeenCalledWith('1', { activo: false }, expect.any(Object));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSupplier,
        message: 'Proveedor desactivado correctamente',
      });
    });

    it('debería devolver error si el proveedor tiene productos asociados', async () => {
      mockRequest.params = { id: '1' };

      (Product.countDocuments as jest.Mock).mockResolvedValue(5);

      await deleteSupplier(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
      expect(mockNext.mock.calls[0][0].message).toContain('tiene 5 productos asociados');
    });
  });
});
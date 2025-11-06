import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock } from './product.controller';
import Product from '../models/product.model';
import { ApiError } from '../utils/errorHandler';

// Mock de Product y sus métodos
jest.mock('../models/product.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  generateSKU: jest.fn(),
}));

// Mock de next function
const mockNext = jest.fn();

describe('Product Controller', () => {
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

  describe('getAllProducts', () => {
    it('debería obtener todos los productos', async () => {
      const mockProducts = [
        { _id: '1', nombre: 'Panel Solar 100W', categoria: 'paneles' },
        { _id: '2', nombre: 'Inversor 1000W', categoria: 'inversores' },
      ];

      mockRequest.query = {};
      (Product.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockProducts),
        }),
      });

      await getAllProducts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Product.find).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockProducts,
      });
    });

    it('debería filtrar productos por categoría', async () => {
      const mockProducts = [
        { _id: '1', nombre: 'Panel Solar 100W', categoria: 'paneles' },
      ];

      mockRequest.query = { categoria: 'paneles' };
      (Product.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockProducts),
        }),
      });

      await getAllProducts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Product.find).toHaveBeenCalledWith({ categoria: 'paneles' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockProducts,
      });
    });
  });

  describe('getProductById', () => {
    it('debería obtener un producto por ID', async () => {
      const mockProduct = { _id: '1', nombre: 'Panel Solar 100W' };
      mockRequest.params = { id: '1' };

      (Product.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct),
      });

      await getProductById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Product.findById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });

    it('debería llamar a next con error si el producto no existe', async () => {
      mockRequest.params = { id: '999' };

      (Product.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getProductById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('createProduct', () => {
    it('debería crear un nuevo producto con SKU generado', async () => {
      const mockProduct = { _id: '1', nombre: 'Panel Solar 100W', sku: 'GS-INV-2023-001' };
      mockRequest.body = { nombre: 'Panel Solar 100W' };

      (Product.generateSKU as jest.Mock).mockResolvedValue('GS-INV-2023-001');
      (Product.create as jest.Mock).mockResolvedValue(mockProduct);

      await createProduct(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Product.generateSKU).toHaveBeenCalled();
      expect(Product.create).toHaveBeenCalledWith({ nombre: 'Panel Solar 100W', sku: 'GS-INV-2023-001' });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });
  });

  describe('updateStock', () => {
    it('debería incrementar el stock de un producto', async () => {
      const mockProduct = { _id: '1', nombre: 'Panel Solar 100W', stock: 10 };
      const updatedProduct = { _id: '1', nombre: 'Panel Solar 100W', stock: 15 };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = { cantidad: 5, tipo: 'entrada' };

      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedProduct);

      await updateStock(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Product.findById).toHaveBeenCalledWith('1');
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('1', { stock: 15 }, expect.any(Object));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedProduct,
        message: 'Stock incrementado correctamente',
      });
    });

    it('debería devolver error si el stock es insuficiente para una salida', async () => {
      const mockProduct = { _id: '1', nombre: 'Panel Solar 100W', stock: 3 };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = { cantidad: 5, tipo: 'salida' };

      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);

      await updateStock(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
      expect(mockNext.mock.calls[0][0].message).toBe('Stock insuficiente');
    });
  });
});
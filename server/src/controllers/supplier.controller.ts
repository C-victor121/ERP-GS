import { Request, Response, NextFunction } from 'express';
import Supplier from '../models/supplier.model';
import Product from '../models/product.model';
import { ApiError } from '../utils/errorHandler';

// Obtener todos los proveedores
export const getAllSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activo, empresa } = req.query as any;
    let query: any = {};
    
    if (activo !== undefined) {
      query.activo = activo === 'true';
    }

    // Filtro opcional por empresa desde query
    if (empresa) {
      query.empresa = empresa;
    }

    // Si no viene en query, usar empresa del usuario autenticado si existe
    const user = (req as any).user;
    if (!empresa && user?.empresa) {
      query.empresa = user.empresa;
    }
    
    const suppliers = await Supplier.find(query).sort({ nombre: 1 });
    
    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un proveedor por ID
export const getSupplierById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('productos');
    
    if (!supplier) {
      return next(new ApiError(404, 'Proveedor no encontrado'));
    }
    
    return res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo proveedor
export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar si ya existe un proveedor con el mismo email
    const existingSupplier = await Supplier.findOne({ email: req.body.email });
    
    if (existingSupplier) {
      return next(new ApiError(400, 'Ya existe un proveedor con este email'));
    }
    
    // Generar código automáticamente si no se proporciona
    if (!req.body.codigo) {
      req.body.codigo = await (Supplier as any).generateCode();
    }

    // Asignar empresa desde usuario autenticado si existe y no viene en el body
    const user = (req as any).user;
    if (user && !req.body.empresa) {
      req.body.empresa = user.empresa;
    }
    
    const supplier = await Supplier.create(req.body);
    
    return res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un proveedor
export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // No permitir actualizar el código
    if (req.body.codigo) {
      delete req.body.codigo;
    }

    // No permitir actualizar el campo empresa (multi-tenant)
    if (req.body.empresa) {
      delete req.body.empresa;
    }
    
    // Verificar si ya existe otro proveedor con el mismo email
    if (req.body.email) {
      const existingSupplier = await Supplier.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id as any }
      });
      
      if (existingSupplier) {
        return next(new ApiError(400, 'Ya existe otro proveedor con este email'));
      }
    }
    
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id as any,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!supplier) {
      return next(new ApiError(404, 'Proveedor no encontrado'));
    }
    
    return res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un proveedor (desactivar)
export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar si el proveedor tiene productos asociados
    const productsCount = await Product.countDocuments({ proveedor: req.params.id as any });
    
    if (productsCount > 0) {
      return next(
        new ApiError(
          400,
          `No se puede eliminar el proveedor porque tiene ${productsCount} productos asociados`
        )
      );
    }
    
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id as any,
      { activo: false },
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!supplier) {
      return next(new ApiError(404, 'Proveedor no encontrado'));
    }
    
    return res.status(200).json({
      success: true,
      data: supplier,
      message: 'Proveedor desactivado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un proveedor permanentemente (solo para administradores)
export const permanentDeleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar si el proveedor tiene productos asociados
    const productsCount = await Product.countDocuments({ proveedor: req.params.id as any });
    
    if (productsCount > 0) {
      return next(
        new ApiError(
          400,
          `No se puede eliminar el proveedor porque tiene ${productsCount} productos asociados`
        )
      );
    }
    
    const supplier = await Supplier.findByIdAndDelete(req.params.id as any);
    
    if (!supplier) {
      return next(new ApiError(404, 'Proveedor no encontrado'));
    }
    
    return res.status(200).json({
      success: true,
      data: {},
      message: 'Proveedor eliminado permanentemente',
    });
  } catch (error) {
    next(error);
  }
};
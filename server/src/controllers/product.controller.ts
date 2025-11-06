import { Request, Response, NextFunction } from 'express';
import Product from '../models/product.model';
import { ApiError } from '../utils/errorHandler';
import InventorySettings from '../models/settings.model';

// Obtener todos los productos
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoria, activo, minStock, empresa } = req.query as any;
    let query: any = {};
    
    // Filtros opcionales
    if (categoria) {
      query.categoria = categoria;
    }
    
    if (activo !== undefined) {
      query.activo = activo === 'true';
    }
    
    if (minStock === 'true') {
      query.stock = { $lte: '$stockMinimo' };
    }

    // Filtro opcional por empresa (multi-tenant)
    if (empresa) {
      query.empresa = empresa;
    }
    
    const products = await Product.find(query)
      .populate('proveedor', 'nombre contacto telefono')
      .sort({ nombre: 1 });
    
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un producto por ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).populate('proveedor');
    
    if (!product) {
      return next(new ApiError(404, 'Producto no encontrado'));
    }
    
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo producto
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Generar SKU automáticamente si no se proporciona
    if (!req.body.sku) {
      req.body.sku = await (Product as any).generateSKU();
    }

    // Asignar empresa desde usuario autenticado si existe y no viene en el body
    const user = (req as any).user;
    if (user && !req.body.empresa) {
      req.body.empresa = user.empresa;
    }
    
    const product = await Product.create(req.body);
    
    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un producto
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // No permitir actualizar el SKU
    if (req.body.sku) {
      delete req.body.sku;
    }

    // No permitir actualizar el campo empresa (multi-tenant)
    if (req.body.empresa) {
      delete req.body.empresa;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id as any,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!product) {
      return next(new ApiError(404, 'Producto no encontrado'));
    }
    
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un producto (desactivar)
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id as any,
      { activo: false },
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!product) {
      return next(new ApiError(404, 'Producto no encontrado'));
    }
    
    return res.status(200).json({
      success: true,
      data: product,
      message: 'Producto desactivado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar stock de un producto
export const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cantidad, tipo, origen, costoUnitario } = req.body;
    
    if (!cantidad || !tipo) {
      return next(new ApiError(400, 'Cantidad y tipo son obligatorios'));
    }
    
    const product = await Product.findById(req.params.id as any);
    
    if (!product) {
      return next(new ApiError(404, 'Producto no encontrado'));
    }

    // Obtener configuración de inventario para política de stock y cuentas PUC por categoría
    let settings = await InventorySettings.findOne();
    if (!settings) {
      settings = await InventorySettings.create({});
    }
    const category = (product as any).categoria || 'otros';
    const globalAccounts = settings.accounts;
    const accountsByCategory = (settings as any).accountsByCategory || {};
    const accountsUsed = accountsByCategory[category] || globalAccounts;
    
    let newStock = product.stock;
    
    if (tipo === 'entrada') {
      newStock += cantidad;
    } else if (tipo === 'salida') {
      // Respetar la política de stock negativo desde configuración
      if (!settings.allowNegativeStock && product.stock < cantidad) {
        return next(new ApiError(400, 'Stock insuficiente según política de inventario'));
      }
      newStock -= cantidad;
    } else {
      return next(new ApiError(400, 'Tipo debe ser entrada o salida'));
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id as any,
      { stock: newStock },
      {
        new: true,
        runValidators: true,
      }
    );

    // Composición de asiento contable (preview) según tipo de movimiento
    const unitCost = (typeof costoUnitario === 'number' && costoUnitario >= 0) ? costoUnitario : (product.costo || 0);
    const amount = cantidad * unitCost;
    const journalPreview = (() => {
      if (tipo === 'entrada') {
        // Por defecto, usar ajustes de inventario como contrapartida en entradas manuales
        const creditAccount = origen === 'compra' ? accountsUsed.purchasesAccount : accountsUsed.adjustmentsAccount;
        return [
          {
            account: accountsUsed.inventoryAccount,
            debit: amount,
            credit: 0,
            description: `Entrada de inventario categoría ${category} (SKU ${product.sku})`,
          },
          {
            account: creditAccount,
            debit: 0,
            credit: amount,
            description: `Contrapartida ${origen === 'compra' ? 'compras' : 'ajustes'} por entrada de inventario (SKU ${product.sku})`,
          },
        ];
      } else {
        // salida
        return [
          {
            account: accountsUsed.cogsAccount,
            debit: amount,
            credit: 0,
            description: `Costo de ventas por salida de inventario categoría ${category} (SKU ${product.sku})`,
          },
          {
            account: accountsUsed.inventoryAccount,
            debit: 0,
            credit: amount,
            description: `Contrapartida inventario por salida (SKU ${product.sku})`,
          },
        ];
      }
    })();
    
    return res.status(200).json({
      success: true,
      data: updatedProduct,
      accountsUsed,
      movement: { tipo, cantidad, categoria: category, origen: origen || 'ajuste' },
      journalPreview,
      message: `Stock ${tipo === 'entrada' ? 'incrementado' : 'decrementado'} correctamente`,
    });
  } catch (error) {
    next(error);
  }
};

// Subir ficha técnica (PDF) del producto
export const uploadProductFichaTecnica = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as any;
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      return next(new ApiError(400, 'No se recibió archivo para la ficha técnica'));
    }

    const product = await Product.findById(id);
    if (!product) {
      return next(new ApiError(404, 'Producto no encontrado'));
    }

    const relativeUrl = `/uploads/products/${id}/${file.filename}`;
    (product as any).fichaTecnicaUrl = relativeUrl;
    await product.save();

    return res.status(200).json({
      success: true,
      data: product,
      url: relativeUrl,
      message: 'Ficha técnica subida correctamente',
    });
  } catch (error) {
    next(error);
  }
};
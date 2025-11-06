import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

// Validación para el registro de usuarios
export const validateRegister: (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[] = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isString()
    .withMessage('El nombre debe ser un texto')
    .trim(),
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isString()
    .withMessage('El apellido debe ser un texto')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .isIn(['admin', 'gerente', 'contador', 'vendedor', 'almacen', 'rrhh'])
    .withMessage('Rol no válido'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validación para el inicio de sesión
export const validateLogin: (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[] = [
  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validación para proveedores
export const validateSupplier: (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[] = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isString()
    .withMessage('El nombre debe ser un texto')
    .trim(),
  body('contacto')
    .notEmpty()
    .withMessage('El nombre de contacto es obligatorio')
    .isString()
    .withMessage('El contacto debe ser un texto')
    .trim(),
  body('telefono')
    .notEmpty()
    .withMessage('El teléfono es obligatorio')
    .matches(/^\d{10}$/)
    .withMessage('El teléfono debe tener 10 dígitos')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('direccion')
    .notEmpty()
    .withMessage('La dirección es obligatoria')
    .isString()
    .withMessage('La dirección debe ser un texto')
    .trim(),
  body('rfc')
    .notEmpty()
    .withMessage('El RFC es obligatorio')
    .matches(/^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/)
    .withMessage('El formato del RFC es inválido')
    .trim(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validación para productos
export const validateProduct: (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[] = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isString()
    .withMessage('El nombre debe ser un texto')
    .trim(),
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .isString()
    .withMessage('La descripción debe ser un texto')
    .trim(),
  body('categoria')
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isIn(['paneles', 'inversores', 'baterías', 'cables', 'estructuras', 'otros'])
    .withMessage('Categoría no válida'),
  body('precio')
    .notEmpty()
    .withMessage('El precio es obligatorio')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('costo')
    .notEmpty()
    .withMessage('El costo es obligatorio')
    .isFloat({ min: 0 })
    .withMessage('El costo debe ser un número positivo'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo'),
  body('stockMinimo')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock mínimo debe ser un número entero positivo'),
  body('ubicacion')
    .notEmpty()
    .withMessage('La ubicación es obligatoria')
    .isString()
    .withMessage('La ubicación debe ser un texto')
    .trim(),
  body('proveedor')
    .optional()
    .isMongoId()
    .withMessage('ID de proveedor no válido'),
  body('fechaCompra')
    .optional()
    .isISO8601()
    .withMessage('La fecha de compra debe ser una fecha válida'),
  body('fichaTecnicaUrl')
    .optional()
    .isURL()
    .withMessage('La URL de la ficha técnica debe ser válida'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validación para actualización de stock
export const validateStockUpdate: (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[] = [
  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  body('tipo')
    .notEmpty()
    .withMessage('El tipo es obligatorio')
    .isIn(['entrada', 'salida'])
    .withMessage('El tipo debe ser entrada o salida'),
  // Campos adicionales para flujo contable y valoración
  body('origen')
    .optional()
    .isIn(['compra', 'ajuste'])
    .withMessage('El origen debe ser compra o ajuste'),
  body('costoUnitario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo unitario debe ser un número positivo'),
  body('fechaCompra')
    .optional()
    .isISO8601()
    .withMessage('La fecha de compra debe ser una fecha válida'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];
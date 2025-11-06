/**
 * Clase personalizada para manejar errores de la API
 */
export class ApiError extends Error {
  statusCode: number;
  errors: any[];

  constructor(statusCode: number, message: string, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors: any[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = 'No autorizado'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Acceso prohibido'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Recurso no encontrado'): ApiError {
    return new ApiError(404, message);
  }

  static internal(message: string = 'Error interno del servidor'): ApiError {
    return new ApiError(500, message);
  }
}

/**
 * Middleware para manejar errores globalmente
 */
export const errorHandler = (err: any, req: any, res: any, next: any): void => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
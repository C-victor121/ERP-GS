import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import Employee, { IEmployeeModel } from '../models/employee.model';
import { ApiError } from '../utils/errorHandler';

// Obtener todos los empleados
export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estado, empresa } = req.query as { estado?: string; empresa?: string };
    let query: any = {};
    
    if (estado) {
      query.estado = estado;
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
    
    const employees = await Employee.find(query)
      .sort({ fechaIngreso: -1 })
      .select('-__v');
    
    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un empleado por ID
export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-__v');
    
    if (!employee) {
      return next(new ApiError(404, 'Empleado no encontrado'));
    }

    // Verificar que el empleado pertenezca a la empresa del usuario
    const user = (req as any).user;
    if (user?.empresa && employee.empresa !== user.empresa) {
      return next(new ApiError(403, 'No tiene acceso a este empleado'));
    }
    
    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo empleado
export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Generar código automáticamente
    const codigo = await (Employee as IEmployeeModel).generateCode();
    
    // Agregar empresa del usuario autenticado
    const user = (req as any).user;
    const empresa = user?.empresa || req.body.empresa;
    
    const employeeData = {
      ...req.body,
      codigo,
      empresa,
    };
    
    const employee = await Employee.create(employeeData);
    
    return res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Error de duplicado
      const field = Object.keys(error.keyPattern)[0];
      return next(new ApiError(400, `El ${field} ya está registrado`));
    }
    next(error);
  }
};

// Actualizar un empleado
export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return next(new ApiError(404, 'Empleado no encontrado'));
    }

    // Verificar que el empleado pertenezca a la empresa del usuario
    const user = (req as any).user;
    if (user?.empresa && employee.empresa !== user.empresa) {
      return next(new ApiError(403, 'No tiene acceso a este empleado'));
    }
    
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select('-__v');
    
    return res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Error de duplicado
      const field = Object.keys(error.keyPattern)[0];
      return next(new ApiError(400, `El ${field} ya está registrado`));
    }
    next(error);
  }
};

// Eliminar un empleado (cambiar estado a inactivo)
export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return next(new ApiError(404, 'Empleado no encontrado'));
    }

    // Verificar que el empleado pertenezca a la empresa del usuario
    const user = (req as any).user;
    if (user?.empresa && employee.empresa !== user.empresa) {
      return next(new ApiError(403, 'No tiene acceso a este empleado'));
    }
    
    // En lugar de eliminar, cambiar el estado a inactivo y registrar fecha de terminación
    employee.estado = 'inactivo';
    employee.fechaTerminacion = new Date();
    await employee.save();
    
    return res.status(200).json({
      success: true,
      message: 'Empleado dado de baja exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

// Obtener empleados activos para nómina
export const getActiveEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { periodo } = req.query as { periodo?: string };
    let query: any = {};
    
    // Filtro por empresa del usuario
    const user = (req as any).user;
    if (user?.empresa) {
      query.empresa = user.empresa;
    }

    let employees;
    if (periodo) {
      // Formato esperado YYYY-MM
      const [yearStr, monthStr] = periodo.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // JS: 0-11
      const periodStart = new Date(year, month, 1);
      const periodEnd = new Date(year, month + 1, 0); // último día del mes

      // Empleados cuyo vínculo laboral se solapa con el mes: ingreso <= fin y (sin terminación o terminación >= inicio)
      employees = await Employee.find({
        ...query,
        fechaIngreso: { $lte: periodEnd },
        $or: [
          { fechaTerminacion: { $exists: false } },
          { fechaTerminacion: { $gte: periodStart } },
        ],
      })
        .select('codigo nombre apellido cargo departamento salarioBase fechaIngreso fechaTerminacion estado')
        .sort({ nombre: 1 });
    } else {
      // Por defecto: activos actualmente
      employees = await Employee.find({
        ...query,
        estado: 'activo',
      })
        .select('codigo nombre apellido cargo departamento salarioBase fechaIngreso fechaTerminacion estado')
        .sort({ nombre: 1 });
    }
    
    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// Crear carpeta virtual del empleado (directorio en /uploads/employees/:id)
export const createEmployeeFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).select('_id empresa');

    if (!employee) {
      return next(new ApiError(404, 'Empleado no encontrado'));
    }

    // Verificar que el empleado pertenezca a la empresa del usuario
    const user = (req as any).user;
    if (user?.empresa && employee.empresa !== user.empresa) {
      return next(new ApiError(403, 'No tiene acceso a este empleado'));
    }

    const uploadsRoot = path.resolve(__dirname, '../../uploads');
    const employeeFolder = path.join(uploadsRoot, 'employees', String(employee._id));

    await fs.promises.mkdir(employeeFolder, { recursive: true });

    const url = `/uploads/employees/${employee._id}/`;
    return res.status(201).json({
      success: true,
      message: 'Carpeta virtual creada/existente para el empleado',
      data: {
        path: employeeFolder,
        url,
      },
    });
  } catch (error) {
    next(error);
  }
};
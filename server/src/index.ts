import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database';
import config from './config/config';
import { errorHandler } from './utils/errorHandler';
import path from 'path';

// Importar rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import supplierRoutes from './routes/supplier.routes';
import settingsRoutes from './routes/settings.routes';
import employeeRoutes from './routes/employee.routes';
import payrollRoutes from './routes/payroll.routes';
import nominaConfigRoutes from './routes/nominaConfig.routes';
import nominaVariableRoutes from './routes/nominaVariable.routes';
import invoiceRoutes from './routes/invoice.routes';
import projectRoutes from './routes/project.routes';
import { createEmployee, getAllEmployees } from './controllers/employee.controller';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app: Express = express();
const PORT = config.port;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de diagnóstico de todas las solicitudes
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});


// Servir archivos estáticos subidos (PDFs, etc.)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// Alias de diagnóstico: montar userRoutes en /api/employees-alias
app.use('/api/employees-alias', userRoutes);
console.log('Alias diagnóstico montado en /api/employees-alias (userRoutes)');
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/settings', settingsRoutes);
// Diagnóstico: verificar coincidencia del prefijo /api/employees
app.use('/api/employees', (req: Request, _res: Response, next: NextFunction) => {
  console.log(`[DIAG] Prefijo /api/employees coincidió con path interno: ${req.path}`);
  next();
});
app.use('/api/employees', employeeRoutes);
console.log('Rutas de empleados montadas en /api/employees');
// Montaje alternativo de diagnóstico
app.use('/api/hr/employees', employeeRoutes);
console.log('Rutas de empleados montadas en /api/hr/employees');
// Alias funcional temporal para evitar 404 en rutas con "employees"
app.use('/api/staff', employeeRoutes);
console.log('Rutas de empleados montadas en alias /api/staff');
app.use('/api/payroll', payrollRoutes);
console.log('Rutas de nómina montadas en /api/payroll');
app.use('/api/nomina/config', nominaConfigRoutes);
console.log('Rutas de configuración de nómina montadas en /api/nomina/config');
app.use('/api/nomina/variables', nominaVariableRoutes);
console.log('Rutas de variables de nómina montadas en /api/nomina/variables');
app.use('/api/invoices', invoiceRoutes);
console.log('Rutas de facturas montadas en /api/invoices');
app.use('/api/projects', projectRoutes);
console.log('Rutas de proyectos montadas en /api/projects');
// Montaje fuera de /api para aislar el problema del prefijo
app.use('/rrhh', employeeRoutes);
console.log('Rutas de empleados montadas en /rrhh (alias fuera de /api)');


// Router inline de diagnóstico montado bajo /api
// Eliminar diagnóstico inline: dejar que employeeRoutes gestione /api/employees

// Diagnóstico: listar rutas registradas en Express
const printRoutes = () => {
  // @ts-ignore
  const stack = app._router?.stack || [];
  console.log('--- ROUTE STACK ---');
  for (const layer of stack) {
    // layer.route for direct routes
    // layer.name === 'router' for mounted routers with layer.regexp
    const isRoute = !!layer.route;
    const isRouter = layer.name === 'router';
    if (isRoute) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      console.log(`[ROUTE] ${methods} ${layer.route.path}`);
    } else if (isRouter) {
      // Mounted router: extract regex and path
      const match = layer.regexp && layer.regexp.toString();
      console.log(`[MOUNT] ${match}`);
    }
  }
  console.log('--- END ROUTE STACK ---');
};
printRoutes();

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('API del ERP de Global Solar funcionando correctamente');
});

// Ping de diagnóstico para confirmar montaje de prefijo /api/employees
app.get('/api/employees/ping-index', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'employees index mount OK' });
});


// Ruta para verificar estado de la API
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    environment: config.environment,
    timestamp: new Date(),
  });
});

// Diagnóstico: middleware para prefijo /api
app.use('/api', (req: Request, _res: Response, next: NextFunction) => {
  console.log(`[API-PREFIX] ${req.method} ${req.originalUrl} -> internal path ${req.path}`);
  next();
});

// Middleware para manejar rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Middleware para manejar errores
app.use(errorHandler);

// Función para iniciar el servidor
const startServer = async (): Promise<void> => {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT} en modo ${config.environment}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

// Manejar señales de terminación
process.on('SIGINT', async () => {
  try {
    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error al cerrar la conexión a MongoDB:', error);
    process.exit(1);
  }
});
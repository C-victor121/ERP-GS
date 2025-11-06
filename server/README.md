# Backend del ERP de Global Solar

Este es el backend para el sistema ERP de Global Solar, desarrollado con Express.js, TypeScript y MongoDB.

## Estructura del Proyecto

```
server/
├── src/
│   ├── config/         # Configuraciones
│   ├── controllers/    # Controladores
│   ├── middlewares/    # Middlewares
│   ├── models/         # Modelos de datos
│   ├── routes/         # Rutas de la API
│   ├── services/       # Servicios
│   ├── utils/          # Utilidades
│   └── index.ts        # Punto de entrada
├── .env                # Variables de entorno
├── package.json        # Dependencias
└── tsconfig.json       # Configuración de TypeScript
```

## Requisitos Previos

- Node.js (v18 o superior)
- MongoDB

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:

```bash
cd server
npm install
```

3. Configurar variables de entorno:

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/erp-global-solar
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

## Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## Pruebas

```bash
npm test
```

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado

### Usuarios

- `GET /api/users` - Obtener todos los usuarios (admin, gerente)
- `GET /api/users/:id` - Obtener un usuario por ID (admin, gerente)
- `PUT /api/users/:id` - Actualizar un usuario (admin, gerente)
- `DELETE /api/users/:id` - Eliminar un usuario (admin)
- `POST /api/users/change-password` - Cambiar contraseña (usuario autenticado)

### Productos

- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto por ID
- `POST /api/products` - Crear un nuevo producto (admin, gerente, almacen)
- `PUT /api/products/:id` - Actualizar un producto (admin, gerente, almacen)
- `DELETE /api/products/:id` - Desactivar un producto (admin, gerente)
- `PATCH /api/products/:id/stock` - Actualizar stock de un producto (admin, gerente, almacen)

### Proveedores

- `GET /api/suppliers` - Obtener todos los proveedores
- `GET /api/suppliers/:id` - Obtener un proveedor por ID
- `POST /api/suppliers` - Crear un nuevo proveedor (admin, gerente)
- `PUT /api/suppliers/:id` - Actualizar un proveedor (admin, gerente)
- `DELETE /api/suppliers/:id` - Desactivar un proveedor (admin, gerente)
- `DELETE /api/suppliers/:id/permanent` - Eliminar permanentemente un proveedor (admin)

## Roles y Permisos

- **admin**: Acceso completo a todas las funcionalidades
- **gerente**: Acceso a la mayoría de las funcionalidades excepto eliminar usuarios
- **contador**: Acceso a módulos financieros y contables
- **vendedor**: Acceso a módulos de ventas y clientes
- **almacen**: Acceso a módulos de inventario y productos
- **rrhh**: Acceso a módulos de recursos humanos y nómina
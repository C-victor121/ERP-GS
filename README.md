# Global Solar - ERP

Sistema ERP para operaciones y contabilidad de Global Solar, una empresa agrovoltaica dedicada a la instalación de energías renovables, importación, asociación con cultivos y minería de bitcoin.

## Stack Tecnológico

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript
- **Base de datos**: MongoDB
- **Moneda por defecto**: COP (almacenado como enteros, mostrado con formato)

## Estructura del Proyecto

```
global-solar/
├── client/                # Frontend (Next.js)
│   ├── src/
│   │   ├── app/           # Páginas y rutas de Next.js
│   │   ├── components/    # Componentes reutilizables
│   │   └── styles/        # Estilos globales y configuración de Tailwind
│   ├── public/            # Archivos estáticos
│   ├── package.json       # Dependencias del frontend
│   └── tsconfig.json      # Configuración de TypeScript
│
└── server/                # Backend (Express.js)
    ├── src/
    │   ├── config/        # Configuraciones
    │   ├── controllers/   # Controladores
    │   ├── middlewares/   # Middlewares
    │   ├── models/        # Modelos de datos
    │   ├── routes/        # Rutas de la API
    │   ├── services/      # Servicios
    │   ├── utils/         # Utilidades
    │   └── index.ts       # Punto de entrada
    ├── .env               # Variables de entorno
    ├── package.json       # Dependencias del backend
    └── tsconfig.json      # Configuración de TypeScript
```

## Configuración Local

```bash
# Clonar el repositorio
git clone <repo>
cd global-solar

# Configurar variables de entorno
cp server/.env.example server/.env

# Instalar dependencias del backend
cd server
npm install

# Instalar dependencias del frontend
cd ../client
npm install

# Iniciar el servidor de desarrollo

# Backend
cd server
npm run build  # Compilar TypeScript
npm start      # Iniciar servidor en modo producción
# o
npm run dev    # Iniciar servidor en modo desarrollo con hot-reload

# Frontend
cd ../client
npm run dev    # Iniciar servidor de desarrollo de Next.js

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000

# Ejecutar pruebas
npm run test      # Jest + supertest

# Ejecutar linting
npm run lint      # ESLint + Prettier
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

## Módulos del Sistema

1. **Autenticación y Gestión de Usuarios**
   - Roles: admin, contador, gerente, usuario

2. **Productos e Inventario**
   - Gestión de SKUs (GS-INV-YYYY-XXX)
   - Control de stock y ubicaciones
   - Categorías: paneles, inversores, baterías, cables, estructuras, otros
   - Alertas de stock mínimo
   - Registro de entradas y salidas de inventario

3. **Proveedores**
   - Código único de proveedor (GS-PROV-XXXX)
   - Datos de contacto y fiscales
   - Asociación con productos
   - Gestión de proveedores activos/inactivos

4. **Facturación**
   - Generación de facturas
   - Seguimiento de pagos

5. **Compras**
   - Seguimiento de órdenes de compra
   - Integración con módulo de proveedores

6. **Activos Fijos**
   - Registro de activos (GS-ACT-YYYY-XXX)
   - Cálculo de depreciación

7. **Nómina**
   - Gestión de empleados
   - Cálculo de salarios y deducciones

8. **Contabilidad**
   - Registro de asientos contables
   - Generación de informes financieros

## Reglas de Desarrollo

- **Iteraciones**: Sprints ≤ 8 horas, PRs < 500 líneas, tests incluidos
- **Flujo de trabajo**: Plan → Aprobación → Diseño → Código → PR → QA → Merge
- **Commits**: feat(modulo): breve, fix(issue), chore(tarea)
- **Ramas**: feature/<modulo>-<breve>, fix/<issue>, chore/<tarea>
- **Producción**: Nunca modificar sin snapshot/rollback documentado
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  nombre: string;
  apellido: string;
  rol: string;
}

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isVentasOpen, setIsVentasOpen] = useState(true);
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', access: ['admin', 'gerente', 'almacen', 'vendedor'] },
    { name: 'Productos', path: '/productos', access: ['admin', 'gerente', 'almacen', 'vendedor'] },
    // { name: 'Nuevo Producto', path: '/productos/nuevo', access: ['admin', 'gerente', 'almacen'] }, // redundante, ya existe botón en la página
    { name: 'Proveedores', path: '/proveedores', access: ['admin', 'gerente', 'almacen', 'vendedor'] },
    { name: 'Proyectos', path: '/proyectos', access: ['admin', 'gerente'] },
    { name: 'Nuevo Proyecto', path: '/proyectos/nuevo', access: ['admin', 'gerente'] },
    { name: 'Nuevo Proveedor', path: '/proveedores/nuevo', access: ['admin', 'gerente'] },
    { name: 'Inventario', path: '/inventario/parametrizacion', access: ['admin', 'gerente', 'almacen'] },
    { name: 'Compras', path: '/compras', access: ['admin', 'gerente'] },
    // Ventas se renderiza como grupo con sub-enlaces
    { name: 'Contabilidad', path: '/contabilidad', access: ['admin', 'gerente'] },
    { name: 'Usuarios', path: '/usuarios', access: ['admin', 'gerente'] },
  ];

  if (!user) {
    return null; // No renderizar la barra lateral si no hay usuario (ej. login/register)
  }

  const canAccessVentas = ['admin', 'gerente', 'vendedor'].includes(user.rol);
  const canAccessPersonal = ['admin', 'gerente', 'rrhh'].includes(user.rol);

  return (
    <aside className="hidden md:block w-64 bg-gray-100 border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-gray-700 font-semibold mb-4">Menú</h2>
        <nav className="flex flex-col space-y-1">
          {navLinks
            .filter(link => link.access.includes(user.rol))
            .map(link => (
              <Link
                key={link.path}
                href={link.path}
                className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
              >
                {link.name}
              </Link>
            ))}

          {/* Grupo Ventas */}
          {canAccessVentas && (
            <div className="mt-2">
              <button
                onClick={() => setIsVentasOpen(!isVentasOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                  ['/ventas', '/facturas', '/facturas/nueva'].includes(pathname)
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>Ventas</span>
                <svg
                  className={`w-4 h-4 transform ${isVentasOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {isVentasOpen && (
                <div className="ml-2 mt-1 space-y-1">
                  <Link
                    href="/ventas"
                    className={`block px-3 py-2 rounded-md text-sm ${
                      isActive('/ventas') ? 'bg-green-200 text-green-800' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Panel de Ventas
                  </Link>
                  <Link
                    href="/facturas"
                    className={`block px-3 py-2 rounded-md text-sm ${
                      isActive('/facturas') ? 'bg-green-200 text-green-800' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Facturas
                  </Link>
                  <Link
                    href="/facturas/nueva"
                    className={`block px-3 py-2 rounded-md text-sm ${
                      isActive('/facturas/nueva') ? 'bg-green-200 text-green-800' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Nueva Factura
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Grupo Personal */}
          {canAccessPersonal && (
            <div className="mt-2">
              <button
                onClick={() => setIsPersonalOpen(!isPersonalOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                  ['/personal/empleados', '/personal/nomina'].includes(pathname)
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>Personal</span>
                <svg
                  className={`w-4 h-4 transform ${isPersonalOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {isPersonalOpen && (
                <div className="ml-2 mt-1 space-y-1">
                  <Link
                    href="/personal/empleados"
                    className={`block px-3 py-2 rounded-md text-sm ${
                      isActive('/personal/empleados') ? 'bg-green-200 text-green-800' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Empleados
                  </Link>
                  <Link
                    href="/personal/nomina"
                    className={`block px-3 py-2 rounded-md text-sm ${
                      isActive('/personal/nomina') ? 'bg-green-200 text-green-800' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Nómina
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
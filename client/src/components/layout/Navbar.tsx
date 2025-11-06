'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  nombre: string;
  apellido: string;
  rol: string;
}

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Eliminar cookie de sesión utilizada por el middleware
    try {
      document.cookie = 'token=; path=/; max-age=0; samesite=lax';
    } catch (e) {
      console.warn('No se pudo eliminar la cookie de sesión:', e);
    }
    setUser(null);
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', access: ['admin', 'gerente', 'almacen', 'vendedor'] },
    { name: 'Productos', path: '/productos', access: ['admin', 'gerente', 'almacen', 'vendedor'] },
    { name: 'Proveedores', path: '/proveedores', access: ['admin', 'gerente', 'almacen', 'vendedor'] },
    // { name: 'Ventas', path: '/ventas', access: ['admin', 'gerente', 'vendedor'] }, // ahora en Sidebar como grupo
    // { name: 'Facturas', path: '/facturas', access: ['admin', 'gerente', 'vendedor'] }, // ahora agrupado en Sidebar
  ];

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Global Solar ERP
            </Link>
          </div>

          {/* Menú de navegación para pantallas grandes */}
          <div className="hidden md:flex space-x-4">
            {user && navLinks
              .filter(link => link.access.includes(user.rol))
              .map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
          </div>

          {/* Perfil de usuario */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
                    {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                  </div>
                  <span>{user.nombre} {user.apellido}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link 
                      href="/perfil" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Link 
                  href="/login" 
                  className="nav-link"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/register" 
                  className="px-3 py-2 rounded-md text-sm font-medium bg-white text-green-700 hover:bg-gray-100"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón de menú móvil */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-green-600 focus:outline-none"
            >
              <svg 
                className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pb-3`}>
          <div className="flex flex-col space-y-2">
            {user && navLinks
              .filter(link => link.access.includes(user.rol))
              .map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(link.path) ? 'bg-green-800' : 'hover:bg-green-600'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            
            {user ? (
              <>
                <Link 
                  href="/perfil" 
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mi Perfil
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-left hover:bg-green-100 hover:text-green-800"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/register" 
                  className="px-3 py-2 rounded-md text-sm font-medium bg-white text-green-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
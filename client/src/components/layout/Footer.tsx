import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Global Solar ERP</h3>
            <p className="text-gray-400 text-sm mt-1">Sistema integral para la gestión de operaciones y contabilidad</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
            <div>
              <h4 className="text-lg font-semibold mb-2">Enlaces rápidos</h4>
              <ul className="space-y-2">
                <li><a href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</a></li>
                <li><a href="/productos" className="text-gray-400 hover:text-white">Productos</a></li>
                <li><a href="/proveedores" className="text-gray-400 hover:text-white">Proveedores</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Soporte</h4>
              <ul className="space-y-2">
                <li><a href="/ayuda" className="text-gray-400 hover:text-white">Centro de ayuda</a></li>
                <li><a href="/contacto" className="text-gray-400 hover:text-white">Contacto</a></li>
                <li><a href="/documentacion" className="text-gray-400 hover:text-white">Documentación</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-center md:text-left">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Global Solar. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
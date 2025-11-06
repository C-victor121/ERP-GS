import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Bienvenido al ERP de Global Solar</h2>
        <p className="text-gray-600">
          Sistema integral para la gestión de operaciones y contabilidad de Global Solar,
          empresa agrovoltaica dedicada a la instalación de energías renovables, importación,
          asociación con cultivos y minería de bitcoin.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Proyectos Agrovoltaicos</h3>
          <p className="text-gray-600 mb-4">Gestión de proyectos de instalación de energías renovables.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Ver Proyectos
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Importaciones</h3>
          <p className="text-gray-600 mb-4">Control de importaciones y logística internacional.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Ver Importaciones
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Cultivos Asociados</h3>
          <p className="text-gray-600 mb-4">Seguimiento de cultivos y producción agrícola.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Ver Cultivos
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Minería de Bitcoin</h3>
          <p className="text-gray-600 mb-4">Monitoreo de operaciones de minería de criptomonedas.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Ver Minería
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Inventario</h3>
          <p className="text-gray-600 mb-4">Gestión de productos y control de stock.</p>
          <Link href="/inventario/parametrizacion" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Ver Inventario
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Contabilidad</h3>
          <p className="text-gray-600 mb-4">Registro contable y generación de informes financieros.</p>
          <Link href="/contabilidad" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Ver Contabilidad
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Compras</h3>
          <p className="text-gray-600 mb-4">Flujo de compras y abastecimiento.</p>
          <Link href="/compras" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Ir a Compras
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Ventas</h3>
          <p className="text-gray-600 mb-4">Gestión de ventas y salidas de inventario.</p>
          <Link href="/ventas" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Ir a Ventas
          </Link>
        </div>
      </div>
    </div>
  );
}
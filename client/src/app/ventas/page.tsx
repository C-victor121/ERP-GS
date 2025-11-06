"use client";

import React from "react";
import Link from "next/link";

export default function VentasPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Ventas</h1>
      <p className="text-gray-700 mb-6">
        Módulo de ventas en preparación. Usa estos accesos para validar la 
        parametrización y flujo operativo mientras integramos las cuentas PUC por categoría.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/productos" className="block bg-white border rounded p-4 hover:shadow">
          <h2 className="font-semibold">Productos</h2>
          <p className="text-sm text-gray-600">Consulta productos disponibles y categorías.</p>
        </Link>
        <Link href="/inventario/parametrizacion" className="block bg-white border rounded p-4 hover:shadow">
          <h2 className="font-semibold">Parametrización de Inventario</h2>
          <p className="text-sm text-gray-600">Configura cuentas PUC por categoría para ventas.</p>
        </Link>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
        <p className="text-sm text-blue-800">
          Próximamente: registro de facturas de venta, salidas de stock por categoría y 
          asiento contable automático usando PUC por categoría.
        </p>
      </div>
    </div>
  );
}
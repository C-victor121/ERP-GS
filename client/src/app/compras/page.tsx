"use client";

import React from "react";
import Link from "next/link";

export default function ComprasPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Compras</h1>
      <p className="text-gray-700 mb-6">
        Módulo de compras en preparación. Usa estos accesos para validar la 
        parametrización y flujo operativo mientras integramos las cuentas PUC por categoría.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/proveedores" className="block bg-white border rounded p-4 hover:shadow">
          <h2 className="font-semibold">Proveedores</h2>
          <p className="text-sm text-gray-600">Gestiona proveedores para tus compras.</p>
        </Link>
        <Link href="/productos" className="block bg-white border rounded p-4 hover:shadow">
          <h2 className="font-semibold">Productos</h2>
          <p className="text-sm text-gray-600">Consulta y crea productos por categoría.</p>
        </Link>
        <Link href="/inventario/parametrizacion" className="block bg-white border rounded p-4 hover:shadow">
          <h2 className="font-semibold">Parametrización de Inventario</h2>
          <p className="text-sm text-gray-600">Configura cuentas PUC por categoría.</p>
        </Link>
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
        <p className="text-sm text-green-800">
          Nota: las cuentas generales actúan como valores por defecto y pueden ser
          sobreescritas por categoría en la parametrización. En el flujo de compras se usarán
          estas cuentas para registrar las transacciones contables correspondientes.
        </p>
      </div>
    </div>
  );
}
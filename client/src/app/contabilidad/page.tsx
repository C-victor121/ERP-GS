"use client";

import React from "react";
import Link from "next/link";

export default function ContabilidadPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Contabilidad</h1>
      <p className="text-gray-700 mb-6">
        Centro de revisión contable. En esta sección se integrarán reportes y asientos
        generados a partir de compras, ventas y ajustes de inventario.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/inventario/parametrizacion" className="block bg-white border rounded p-4 hover:shadow">
          <h2 className="font-semibold">Parametrización de Inventario</h2>
          <p className="text-sm text-gray-600">Revisa y ajusta cuentas PUC por categoría.</p>
        </Link>
        <Link href="/dashboard" className="block bg-white border rounded p-4 hover:shadow">
          <h2 className="font-semibold">Dashboard</h2>
          <p className="text-sm text-gray-600">Indicadores y atajos generales.</p>
        </Link>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-sm text-yellow-800">
          Próximamente: libro auxiliar por categoría, mayores contables y 
          reconciliación automática según PUC configurado.
        </p>
      </div>
    </div>
  );
}
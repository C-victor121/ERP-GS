"use client";

import React from "react";
import Link from "next/link";

export default function UsuariosPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Usuarios</h1>
      <p className="text-gray-700 mb-6">
        Administración de usuarios y roles. Esta sección estará disponible para administradores.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/register" className="block bg-white border rounded p-4 hover:shadow">
          <h2 className="font-semibold">Registrar Usuario</h2>
          <p className="text-sm text-gray-600">Crea un nuevo usuario en el sistema.</p>
        </Link>
        <Link href="/login" className="block bg-white border rounded p-4 hover:shadow">
          <h2 className="font-semibold">Login</h2>
          <p className="text-sm text-gray-600">Accede con una cuenta existente.</p>
        </Link>
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded p-4">
        <p className="text-sm text-gray-800">
          Próximamente: listado de usuarios, asignación de roles y permisos.
        </p>
      </div>
    </div>
  );
}
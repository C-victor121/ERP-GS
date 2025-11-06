"use client";

import React from "react";
import Link from "next/link";

export default function PersonalPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Gestión de Personal</h1>
      <p className="text-gray-700 mb-6">
        Administración completa del personal y nómina de la empresa.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/personal/empleados" 
          className="block bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Empleados</h2>
          <p className="text-sm text-gray-600">
            Gestiona la información de todos los empleados de la empresa, incluyendo datos personales, cargos y salarios.
          </p>
        </Link>

        <Link 
          href="/personal/nomina" 
          className="block bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Nómina</h2>
          <p className="text-sm text-gray-600">
            Calcula y gestiona los pagos de nómina, incluyendo salarios, deducciones y beneficios.
          </p>
        </Link>

        <div className="block bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Reportes</h2>
          <p className="text-sm text-gray-600">
            Genera reportes detallados de personal, nómina y estadísticas laborales.
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Empleados</h3>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-600 mt-1">Activos</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Nómina Mensual</h3>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-600 mt-1">COP</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Promedio Salarial</h3>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-600 mt-1">COP</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Próxima Nómina</h3>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-600 mt-1">Días</p>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/utils/api";

interface Empleado {
  _id: string;
  codigo: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  salarioBase: number;
  fechaIngreso: string;
  estado: 'activo' | 'inactivo';
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [folderMsg, setFolderMsg] = useState<string>("");
  const [folderErr, setFolderErr] = useState<string>("");

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      const response = await apiFetch('/api/employees');
      const lista = Array.isArray((response as any)?.data)
        ? (response as any).data
        : Array.isArray(response as any)
          ? (response as any)
          : [];
      setEmpleados(lista);
      setLoading(false);
    } catch (err: any) {
      // Si el backend devuelve 404 por ruta no encontrada, mostrar lista vacía
      // para permitir registrar el primer empleado sin bloquear la vista.
      const msg = err?.message || '';
      if (msg.includes('Ruta no encontrada') || msg.includes('404')) {
        setEmpleados([]);
        setError('');
      } else {
        setError(err.message || 'Error al cargar empleados');
      }
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const crearCarpeta = async (id: string) => {
    setFolderMsg("");
    setFolderErr("");
    try {
      const res: any = await apiFetch(`/api/employees/${id}/folder`, { method: 'POST' });
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = res?.data?.url ? `${apiBase}${res.data.url}` : '';
      setFolderMsg(url ? `Carpeta lista: ${url}` : 'Carpeta creada exitosamente');
    } catch (e: any) {
      setFolderErr(e?.message || 'Error al crear carpeta virtual');
    }
  };

  const crearCarpetasMasivo = async () => {
    setFolderMsg("");
    setFolderErr("");
    if (!empleados.length) {
      setFolderErr('No hay empleados para crear carpetas.');
      return;
    }
    try {
      const results = await Promise.allSettled(
        empleados.map((e) => apiFetch(`/api/employees/${e._id}/folder`, { method: 'POST' }))
      );
      const okCount = results.filter((r) => r.status === 'fulfilled').length;
      setFolderMsg(`Carpetas listas para ${okCount}/${empleados.length} empleados`);
    } catch (e: any) {
      setFolderErr(e?.message || 'Error creando carpetas');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gestión de Empleados</h1>
          <p className="text-gray-700">
            Administración del personal de la empresa.
          </p>
        </div>
        <div className="flex items-center">
          <Link
            href="/personal/empleados/nuevo"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Nuevo Empleado
          </Link>
          <button
            onClick={crearCarpetasMasivo}
            className="ml-3 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Crear Carpetas
          </button>
        </div>
      </div>

      {(folderMsg || folderErr) && (
        <div className={`mb-4 rounded-md border p-4 ${folderErr ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className={folderErr ? 'text-red-800' : 'text-green-800'}>
            {folderErr || folderMsg}
            {folderMsg && folderMsg.startsWith('http') && (
              <>
                {' '}•{' '}
                <a href={folderMsg} target="_blank" rel="noopener noreferrer" className="underline">
                  Ver carpeta
                </a>
              </>
            )}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salario Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Ingreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empleados.map((empleado) => (
                <tr key={empleado._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {empleado.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {empleado.nombre} {empleado.apellido}
                    </div>
                    <div className="text-sm text-gray-500">
                      {empleado.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {empleado.cargo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {empleado.departamento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(empleado.salarioBase)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(empleado.fechaIngreso)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      empleado.estado === 'activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {empleado.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/personal/empleados/${empleado._id}`}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/personal/empleados/${empleado._id}/editar`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => crearCarpeta(empleado._id)}
                      className="ml-3 text-purple-600 hover:text-purple-900"
                    >
                      Carpeta
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {empleados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay empleados registrados</p>
              <Link
                href="/personal/empleados/nuevo"
                className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Registrar Primer Empleado
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
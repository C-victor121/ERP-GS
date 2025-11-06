"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";

interface NominaItem {
  _id: string;
  empleado: {
    _id: string;
    nombre: string;
    apellido: string;
    cargo: string;
  };
  periodo: string;
  salarioBase: number;
  transporte: number;
  otrosEarnings: number;
  deducciones: number;
  netoAPagar: number;
  estado: 'calculada' | 'pagada';
}

export default function NominaPage() {
  const [nomina, setNomina] = useState<NominaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");

  useEffect(() => {
    // Establecer período actual (formato YYYY-MM)
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    setPeriodoSeleccionado(`${año}-${mes}`);
    fetchNomina(`${año}-${mes}`);
  }, []);

  const fetchNomina = async (periodo: string) => {
    try {
      const response = await apiFetch(`/api/payroll?periodo=${periodo}`);
      setNomina(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar nómina');
      setLoading(false);
    }
  };

  const handlePeriodoChange = (periodo: string) => {
    setPeriodoSeleccionado(periodo);
    fetchNomina(periodo);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calcularTotal = () => {
    return nomina.reduce((total, item) => total + item.netoAPagar, 0);
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
          <h1 className="text-2xl font-bold mb-2">Gestión de Nómina</h1>
          <p className="text-gray-700">
            Administración de pagos de nómina del personal.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={periodoSeleccionado}
            onChange={(e) => handlePeriodoChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="2024-12">Diciembre 2024</option>
            <option value="2024-11">Noviembre 2024</option>
            <option value="2024-10">Octubre 2024</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Calcular Nómina
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Empleados</h3>
          <p className="text-3xl font-bold text-green-600">{nomina.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Nómina</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(calcularTotal())}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Período</h3>
          <p className="text-lg text-gray-600">{periodoSeleccionado}</p>
        </div>
      </div>

      {/* Tabla de nómina */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salario Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Otros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deducciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Neto a Pagar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nomina.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.empleado.nombre} {item.empleado.apellido}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.empleado.cargo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.salarioBase)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.transporte)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.otrosEarnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    -{formatCurrency(item.deducciones)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(item.netoAPagar)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.estado === 'pagada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.estado === 'pagada' ? 'Pagada' : 'Calculada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {nomina.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay nómina calculada para este período</p>
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Generar Nómina
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      {nomina.length > 0 && (
        <div className="mt-6 flex justify-end space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Exportar PDF
          </button>
          <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
            Marcar como Pagada
          </button>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Protected from '../../components/auth/Protected';
import { apiFetch } from '../../utils/api';

interface InvoiceItem {
  product: string;
  sku: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Invoice {
  _id: string;
  numero: string;
  clienteNombre: string;
  fecha: string;
  items: InvoiceItem[];
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  estado: 'emitida' | 'anulada';
}

export default function FacturasPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/invoices');
        if (res.success) setInvoices(res.data || []);
      } catch (e: any) {
        setError(e?.message || 'Error cargando facturas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const anular = async (id: string) => {
    try {
      const res = await apiFetch(`/api/invoices/${id}/anular`, { method: 'PATCH' });
      if (res.success) {
        setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, estado: 'anulada' } : inv));
      }
    } catch (e: any) {
      setError(e?.message || 'No se pudo anular la factura');
    }
  };

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Facturas</h1>
          <Link href="/facturas/nueva" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            + Nueva Factura
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No hay facturas registradas. Comience creando una nueva factura.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.numero}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.clienteNombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(inv.fecha).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inv.estado === 'emitida' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {inv.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(inv.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-red-600 hover:text-red-800 mr-3" onClick={() => anular(inv._id)} disabled={inv.estado === 'anulada'}>
                          Anular
                        </button>
                        <Link href={`/facturas/${inv._id}`} className="text-indigo-600 hover:text-indigo-900">Ver</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
}
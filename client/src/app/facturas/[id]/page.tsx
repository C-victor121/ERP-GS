'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Protected from '../../../components/auth/Protected';
import { apiFetch } from '../../../utils/api';

interface InvoiceItem {
  sku?: string;
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
  observaciones?: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/api/invoices/${id}`);
        if (res?.success) {
          setInvoice(res.data as Invoice);
        } else {
          setError(res?.message || 'No se pudo cargar la factura');
        }
      } catch (e: any) {
        setError(e?.message || 'Error cargando la factura');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Detalle de Factura</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/facturas')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded">Volver</button>
            <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">Imprimir</button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="loading-spinner" />
          </div>
        ) : !invoice ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No se encontró la factura solicitada.</p>
            <Link href="/facturas" className="inline-block mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Volver a Facturas</Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-gray-500">Factura</div>
                  <div className="text-xl font-semibold">#{invoice.numero}</div>
                  <div className="text-sm text-gray-600">Fecha: {new Date(invoice.fecha).toLocaleString()}</div>
                </div>
                <div className="text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.estado === 'emitida' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {invoice.estado === 'emitida' ? 'Emitida' : 'Anulada'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Cliente</h2>
                <p className="text-gray-700">{invoice.clienteNombre}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Totales</h2>
                <div className="text-gray-700 space-y-1">
                  <div>SubTotal: {Number(invoice.subTotal).toFixed(2)}</div>
                  <div>Impuesto ({invoice.taxRate}%): {Number(invoice.taxAmount).toFixed(2)}</div>
                  <div className="font-semibold">Total: {Number(invoice.total).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold mb-3">Ítems</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">SKU</th>
                      <th className="table-header-cell">Producto</th>
                      <th className="table-header-cell">Cant.</th>
                      <th className="table-header-cell">Precio</th>
                      <th className="table-header-cell">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {(invoice.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="table-cell">{it.sku || ''}</td>
                        <td className="table-cell">{it.nombre}</td>
                        <td className="table-cell">{it.cantidad}</td>
                        <td className="table-cell">{Number(it.precioUnitario).toFixed(2)}</td>
                        <td className="table-cell">{Number(it.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {invoice.observaciones && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-1">Observaciones</h3>
                  <p className="text-gray-700">{invoice.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
}
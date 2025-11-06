'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Protected from '../../../components/auth/Protected';
import { apiFetch } from '../../../utils/api';

interface Producto {
  _id: string;
  sku: string;
  nombre: string;
  precio: number;
  stock: number;
}

interface InvoiceItemForm {
  product: string;
  cantidad: number;
  precioUnitario?: number;
}

export default function NuevaFacturaPage() {
  const router = useRouter();
  const [clienteNombre, setClienteNombre] = useState('');
  const [items, setItems] = useState<InvoiceItemForm[]>([{ product: '', cantidad: 1 }]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const empresa = userRaw ? (() => { try { return JSON.parse(userRaw as string).empresa; } catch { return undefined; } })() : undefined;
        const productsPath = `/api/products?activo=true${empresa ? `&empresa=${encodeURIComponent(empresa)}` : ''}`;

        const [prodRes, settingsRes]: any = await Promise.all([
          apiFetch(productsPath),
          apiFetch('/api/settings/inventory')
        ]);

        const lista = Array.isArray(prodRes?.data) ? prodRes.data : (Array.isArray(prodRes) ? prodRes : []);
        setProductos(lista);

        if (settingsRes?.success) setTaxRate(settingsRes.data?.taxRate || 0);
      } catch (err: any) {
        console.error(err);
        setError('No se pudieron cargar los productos. Vuelve a intentarlo.');
      }
    };
    loadData();
  }, []);

  const addItem = () => setItems(prev => [...prev, { product: '', cantidad: 1 }]);
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof InvoiceItemForm, value: any) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNombre.trim()) {
      setError('El nombre del cliente es obligatorio');
      return;
    }
    if (items.length === 0 || items.some(it => !it.product || it.cantidad <= 0)) {
      setError('Debes agregar al menos un ítem válido');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = { clienteNombre, items, taxRate };
      const res = await apiFetch('/api/invoices', { method: 'POST', body: payload });
      if (res.success) {
        router.push('/facturas');
      } else {
        setError(res.message || 'No se pudo crear la factura');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Nueva Factura</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Nombre del cliente"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Ítems</h2>
              <button type="button" onClick={addItem} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">+ Agregar ítem</button>
            </div>
            {items.map((it, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3 items-end">
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={it.product}
                    onChange={(e) => updateItem(index, 'product', e.target.value)}
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map(p => (
                      <option key={p._id} value={p._id}>{p.sku} - {p.nombre} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={it.cantidad}
                    onChange={(e) => updateItem(index, 'cantidad', Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio unitario (opcional)</label>
                  <input
                    type="number"
                    min={0}
                    value={it.precioUnitario || ''}
                    onChange={(e) => updateItem(index, 'precioUnitario', Number(e.target.value))}
                    placeholder="Usa precio del producto si se deja vacío"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="md:col-span-1 text-right">
                  <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800">Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impuesto (IVA %)</label>
              <input
                type="number"
                min={0}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              {loading ? 'Guardando...' : 'Guardar Factura'}
            </button>
          </div>
        </form>
      </div>
    </Protected>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../utils/api';
import Protected from '../../../components/auth/Protected';

interface FormData {
  nombre: string;
  descripcion: string;
  precio: string;
  costo: string;
  stock: string;
  stockMinimo: string;
  ubicacion: string;
  categoria: string;
  proveedor: string;
  fechaCompra?: string;
  fichaTecnicaUrl?: string;
}

const NuevoProductoPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    precio: '',
    costo: '',
    stock: '',
    stockMinimo: '',
    ubicacion: '',
    categoria: '',
    proveedor: ''
  });
  const [fichaFile, setFichaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [proveedores, setProveedores] = useState<{_id: string, nombre: string}[]>([]);
  const [categorias] = useState<string[]>(['paneles', 'inversores', 'baterías', 'estructuras', 'cables', 'otros']);

  useEffect(() => {
    // Cargar proveedores
    const fetchProveedores = async () => {
      try {
        const dataProv = await apiFetch('/api/suppliers');
        const lista = Array.isArray(dataProv?.data) ? dataProv.data : [];
        setProveedores(lista);
      } catch (error) {
        console.error(error);
        setError('Error al cargar proveedores');
      }
    };

    fetchProveedores();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFichaFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria.trim(),
        precio: parseFloat(formData.precio),
        costo: parseFloat(formData.costo),
        stock: parseInt(formData.stock, 10),
        stockMinimo: parseInt(formData.stockMinimo, 10),
        ubicacion: formData.ubicacion.trim(),
        proveedor: formData.proveedor,
        fechaCompra: formData.fechaCompra ? new Date(formData.fechaCompra).toISOString() : undefined,
        fichaTecnicaUrl: formData.fichaTecnicaUrl?.trim(),
      };

      const data = await apiFetch('/api/products', {
        method: 'POST',
        body: payload,
      });

      const createdId = (data as any)?.data?._id;

      // Subida de PDF de ficha técnica si se seleccionó archivo
      if (createdId && fichaFile) {
        const fd = new FormData();
        fd.append('ficha', fichaFile, fichaFile.name);
        await apiFetch(`/api/products/${createdId}/ficha-tecnica`, {
          method: 'POST',
          body: fd,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/productos');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al crear el producto. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Producto</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            <p>Producto creado exitosamente{fichaFile ? ' y ficha técnica subida' : ''}. Redirigiendo...</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (USD) *
                </label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="costo" className="block text-sm font-medium text-gray-700 mb-1">
                  Costo (USD) *
                </label>
                <input
                  type="number"
                  id="costo"
                  name="costo"
                  value={formData.costo}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="stockMinimo" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock mínimo *
                </label>
                <input
                  type="number"
                  id="stockMinimo"
                  name="stockMinimo"
                  value={formData.stockMinimo}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación *
                </label>
                <input
                  type="text"
                  id="ubicacion"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor *
                </label>
                <select
                  id="proveedor"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov._id} value={prov._id}>{prov.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="fechaCompra" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de compra (opcional)
                </label>
                <input
                  type="date"
                  id="fechaCompra"
                  name="fechaCompra"
                  value={formData.fechaCompra || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="fichaTecnicaUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Ficha técnica (URL PDF, opcional)
                </label>
                <input
                  type="url"
                  id="fichaTecnicaUrl"
                  name="fichaTecnicaUrl"
                  placeholder="https://.../ficha.pdf"
                  value={formData.fichaTecnicaUrl || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="fichaFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Subir ficha técnica (PDF, opcional)
                </label>
                <input
                  type="file"
                  id="fichaFile"
                  name="fichaFile"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Tamaño máximo 10 MB. Si cargas un archivo, se guardará en el servidor y se generará la URL automáticamente.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${(loading || success) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Protected>
  );
};

export default NuevoProductoPage;
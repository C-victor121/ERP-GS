'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../utils/api';
import Protected from '../../components/auth/Protected';

interface Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  proveedor: string;
  fechaCreacion: string;
  // nuevos opcionales
  fechaCompra?: string;
  fichaTecnicaUrl?: string;
  // campos adicionales para edición
  costo?: number;
  stockMinimo?: number;
  ubicacion?: string;
}

interface JournalEntry {
  account: string;
  debit: number;
  credit: number;
  description: string;
}

const ProductosPage: React.FC = () => {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Eliminar estados relacionados con la acción de stock
  // const [action, setAction] = useState<{ id: string; tipo: 'entrada' } | null>(null);
  // const [cantidad, setCantidad] = useState<string>('');
  // const [submitting, setSubmitting] = useState<boolean>(false);
  // const [journalByProduct, setJournalByProduct] = useState<Record<string, JournalEntry[]>>({});
  // const [opError, setOpError] = useState<string | null>(null);
  // const [opSuccess, setOpSuccess] = useState<string | null>(null);
  // const [origen, setOrigen] = useState<'compra' | 'ajuste'>('ajuste');
  // const [costoUnitario, setCostoUnitario] = useState<string>('');
  // const [fechaCompra, setFechaCompra] = useState<string>('');
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // nuevos estados para flujo de stock y modales
  const [origen, setOrigen] = useState<'compra' | 'ajuste'>('ajuste');
  const [costoUnitario, setCostoUnitario] = useState<string>('');
  const [fechaCompra, setFechaCompra] = useState<string>('');

  const [viewProduct, setViewProduct] = useState<Producto | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: 0,
    // costo eliminado
    stock: 0,
    stockMinimo: 0,
    ubicacion: '',
    proveedor: '',
    fechaCompra: '',
    fichaTecnicaUrl: '',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const [proveedores, setProveedores] = useState<{ _id: string; nombre: string }[]>([]);
  const categorias = ['paneles', 'inversores', 'baterías', 'estructuras', 'cables', 'otros'];

  useEffect(() => {
    // Cargar productos
    const fetchProductos = async () => {
      try {
        const data: any = await apiFetch('/api/products?activo=true');
        const lista = Array.isArray(data?.data) ? data.data : [];
        setProductos(lista);
      } catch (err) {
        setError('Error al cargar los productos. Por favor, intente nuevamente.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [router]);

  useEffect(() => {
    // Cargar proveedores para edición
    const fetchProveedores = async () => {
      try {
        const dataProv: any = await apiFetch('/api/suppliers');
        const lista = Array.isArray(dataProv?.data) ? dataProv.data : [];
        setProveedores(lista);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    };
    fetchProveedores();
  }, [router]);

  const handleNuevoProducto = () => {
    router.push('/productos/nuevo');
  };

  const openAction = (_id: string) => {
    // Opción Entrada eliminada: no hace nada
  };

  const cancelAction = () => {
    // Opción Entrada eliminada: no hace nada
  };

  const handleDelete = async (id: string) => {
    setGlobalError(null);
    setGlobalSuccess(null);
    const ok = typeof window !== 'undefined' ? window.confirm('¿Seguro que desea desactivar este producto?') : true;
    if (!ok) return;
    try {
      const res: any = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      // El backend marca activo=false; removemos de la lista para reflejar desactivación
      setProductos((prev) => prev.filter((p) => p._id !== id));
      setGlobalSuccess(res?.message || 'Producto desactivado correctamente');
    } catch (e: any) {
      setGlobalError(e?.message || 'Error al desactivar producto');
    }
  };

  const submitStockUpdate = async () => {
    // Opción Entrada eliminada: no hace nada
  };

  // Acciones de Ver/Editar con modales
  const handleView = async (id: string) => {
    try {
      const res: any = await apiFetch(`/api/products/${id}`);
      const product = res?.data;
      if (product) {
        setViewProduct(product);
      }
    } catch (e: any) {
      setGlobalError(e?.message || 'Error al obtener el producto');
    }
  };

  const closeView = () => setViewProduct(null);

  const handleEdit = async (id: string) => {
    try {
      const res: any = await apiFetch(`/api/products/${id}`);
      const p = res?.data;
      if (p) {
        setEditForm({
          nombre: p.nombre || '',
          descripcion: p.descripcion || '',
          categoria: p.categoria || '',
          precio: p.precio ?? 0,
          stock: p.stock ?? 0,
          stockMinimo: (p as any).stockMinimo ?? 0,
          ubicacion: (p as any).ubicacion || '',
          proveedor: typeof p.proveedor === 'string' ? p.proveedor : (p.proveedor?._id || ''),
          fechaCompra: p.fechaCompra ? new Date(p.fechaCompra).toISOString().slice(0, 10) : '',
          fichaTecnicaUrl: p.fichaTecnicaUrl || '',
        });
        setEditProductId(id);
        setModalError(null);
        setModalSuccess(null);
      }
    } catch (e: any) {
      setGlobalError(e?.message || 'Error al obtener el producto para editar');
    }
  };

  const closeEdit = () => {
    setEditProductId(null);
    setModalError(null);
    setModalSuccess(null);
  };

  const onEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async () => {
    if (!editProductId) return;
    setModalLoading(true);
    setModalError(null);
    setModalSuccess(null);
    try {
      const payload: any = {
        nombre: editForm.nombre?.trim(),
        descripcion: editForm.descripcion?.trim(),
        categoria: editForm.categoria?.trim(),
        precio: Number(editForm.precio),
        // costo eliminado del payload
        stock: Number(editForm.stock),
        stockMinimo: Number(editForm.stockMinimo),
        ubicacion: editForm.ubicacion?.trim(),
        proveedor: editForm.proveedor,
        fechaCompra: editForm.fechaCompra ? new Date(editForm.fechaCompra).toISOString() : undefined,
        fichaTecnicaUrl: editForm.fichaTecnicaUrl?.trim() || undefined,
      };

      const res: any = await apiFetch(`/api/products/${editProductId}`, {
        method: 'PUT',
        body: payload,
      });
      const updated = res?.data;
      if (updated) {
        setProductos((prev) => prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)));
        setModalSuccess('Producto actualizado correctamente');
        setTimeout(() => {
          closeEdit();
        }, 1200);
      }
    } catch (e: any) {
      setModalError(e?.message || 'Error al actualizar el producto');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
          <button 
            onClick={handleNuevoProducto}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <span className="mr-2">+</span> Nuevo Producto
          </button>
        </div>

        {globalError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{globalError}</p>
          </div>
        )}
        {globalSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{globalSuccess}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {productos.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No hay productos registrados. Comience agregando un nuevo producto.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productos.map((producto) => (
                    <React.Fragment key={producto._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 truncate max-w-xs">{producto.descripcion}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(producto.precio)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{producto.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {producto.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleView(producto._id)} 
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Ver
                          </button>
                          <button 
                            onClick={() => handleEdit(producto._id)} 
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 mr-3"
                            onClick={() => handleDelete(producto._id)}
                          >
                            Eliminar
                          </button>
                          {/* Opción "Entrada" eliminada */}
                        </td>
                      </tr>
                      {/* Preview contable eliminado */}
                      {/* {journalByProduct[producto._id] && (<tr><td colSpan={6}>...</td></tr>)} */}
                      {/* Preview contable eliminado */}
                      {/*
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-white">
                          <div className="rounded border p-3">
                            <h4 className="text-sm font-semibold mb-2">Preview de asiento contable</h4>
                            {(() => {
                              const entries = journalByProduct[producto._id];
                              const zero = entries.every((e) => (e.debit ?? 0) === 0 && (e.credit ?? 0) === 0);
                              return zero ? (
                                <div className="text-xs text-orange-600 mb-2">Nota: El costo del producto es 0; el asiento tendrá monto 0.</div>
                              ) : null;
                            })()}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {journalByProduct[producto._id].map((j, idx) => (
                                <div key={idx} className="border rounded p-2">
                                  <div className="text-xs text-gray-500">{j.description}</div>
                                  <div className="flex justify-between mt-1 text-sm">
                                    <span className="font-mono">{j.account}</span>
                                    <span className="text-gray-700">
                                      D: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(j.debit)} |
                                      C: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(j.credit)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                      */}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de ver producto */}
        {viewProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Detalle de Producto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Nombre</div>
                  <div className="font-medium">{viewProduct.nombre}</div>
                </div>
                <div>
                  <div className="text-gray-600">Categoría</div>
                  <div className="font-medium">{viewProduct.categoria}</div>
                </div>
                <div>
                  <div className="text-gray-600">Precio</div>
                  <div className="font-medium">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(viewProduct.precio)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Stock</div>
                  <div className="font-medium">{viewProduct.stock}</div>
                </div>
                {viewProduct.costo !== undefined && (
                  <div>
                    <div className="text-gray-600">Costo</div>
                    <div className="font-medium">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(viewProduct.costo || 0)}</div>
                  </div>
                )}
                {viewProduct.stockMinimo !== undefined && (
                  <div>
                    <div className="text-gray-600">Stock mínimo</div>
                    <div className="font-medium">{viewProduct.stockMinimo}</div>
                  </div>
                )}
                {viewProduct.ubicacion && (
                  <div>
                    <div className="text-gray-600">Ubicación</div>
                    <div className="font-medium">{viewProduct.ubicacion}</div>
                  </div>
                )}
                {viewProduct.fechaCompra && (
                  <div>
                    <div className="text-gray-600">Fecha de compra</div>
                    <div className="font-medium">{new Date(viewProduct.fechaCompra).toLocaleDateString()}</div>
                  </div>
                )}
                {viewProduct.fichaTecnicaUrl && (
                  <div className="md:col-span-2">
                    <a href={viewProduct.fichaTecnicaUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Ver ficha técnica (PDF)</a>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={closeView} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {editProductId && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
              <h2 className="text-xl font-semibold mb-4">Editar Producto</h2>
              {modalError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">{modalError}</div>
              )}
              {modalSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm">{modalSuccess}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                  <input name="nombre" value={editForm.nombre} onChange={onEditChange} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                  <select name="categoria" value={editForm.categoria} onChange={onEditChange} className="w-full border rounded px-2 py-1">
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea name="descripcion" value={editForm.descripcion} onChange={onEditChange} className="w-full border rounded px-2 py-1" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio (COP)</label>
                  <input type="number" name="precio" value={editForm.precio} onChange={onEditChange} className="w-full border rounded px-2 py-1" min={0} step={0.01} />
                </div>
                // (Eliminado bloque de campo Costo)
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" name="stock" value={editForm.stock} onChange={onEditChange} className="w-full border rounded px-2 py-1" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock mínimo</label>
                  <input type="number" name="stockMinimo" value={editForm.stockMinimo} onChange={onEditChange} className="w-full border rounded px-2 py-1" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ubicación</label>
                  <input name="ubicacion" value={editForm.ubicacion} onChange={onEditChange} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor</label>
                  <select name="proveedor" value={editForm.proveedor} onChange={onEditChange} className="w-full border rounded px-2 py-1">
                    <option value="">Seleccione un proveedor</option>
                    {proveedores.map((p) => (
                      <option key={p._id} value={p._id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de compra</label>
                  <input type="date" name="fechaCompra" value={editForm.fechaCompra} onChange={onEditChange} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ficha técnica (URL)</label>
                  <input type="url" name="fichaTecnicaUrl" value={editForm.fichaTecnicaUrl} onChange={onEditChange} className="w-full border rounded px-2 py-1" placeholder="https://.../ficha.pdf" />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button onClick={closeEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancelar</button>
                <button onClick={submitEdit} disabled={modalLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50">{modalLoading ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
};

export default ProductosPage;
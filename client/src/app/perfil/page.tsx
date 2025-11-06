'use client';

import React, { useEffect, useState } from 'react';
import Protected from '../../components/auth/Protected';
import { getProfile, updateMe } from '../../utils/api';

interface PerfilData {
  id?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: string;
  empresa?: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  correos?: string[];
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilData>({});
  const [form, setForm] = useState({
    nit: '',
    direccion: '',
    telefono: '',
    correos: '', // separado por comas
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp: any = await getProfile();
        const data: PerfilData = resp?.user || resp?.data || resp || {};
        setPerfil(data);
        setForm({
          nit: (data.nit || ''),
          direccion: (data.direccion || ''),
          telefono: (data.telefono || ''),
          correos: Array.isArray(data.correos) ? data.correos.join(', ') : '',
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        nit: form.nit.trim() || '',
        direccion: form.direccion.trim() || '',
        telefono: form.telefono.trim() || '',
        correos: form.correos
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      };
      const resp: any = await updateMe(payload);
      const updated = resp?.data || resp?.user || resp;
      setSuccess(resp?.message || 'Perfil actualizado exitosamente');
      setPerfil(updated);
      // Actualizar localStorage.user para que el frontend use los nuevos datos (ej. empresa)
      try {
        const lsUserRaw = localStorage.getItem('user');
        const lsUser = lsUserRaw ? JSON.parse(lsUserRaw) : {};
        const merged = { ...lsUser, ...updated };
        localStorage.setItem('user', JSON.stringify(merged));
      } catch {}
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-green-700 mb-6">Mi Perfil</h1>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel resumen */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-600">Nombre:</span> {perfil.nombre} {perfil.apellido}</p>
                  <p><span className="font-medium text-gray-600">Email:</span> {perfil.email}</p>
                  <p><span className="font-medium text-gray-600">Rol:</span> {perfil.rol}</p>
                  <p><span className="font-medium text-gray-600">Empresa:</span> {perfil.empresa || '-'}</p>
                </div>
              </div>

              {/* Formulario edición */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Datos de facturación</h2>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline">{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                    <input
                      type="text"
                      name="nit"
                      value={form.nit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="123456789-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Calle 123 #45-67, Ciudad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="(+57) 300 000 0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correos para envío de facturas</label>
                    <textarea
                      name="correos"
                      value={form.correos}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="correo1@empresa.com, correo2@empresa.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separa múltiples correos con comas.</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
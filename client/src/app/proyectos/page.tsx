"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';

type Project = {
  _id: string;
  nombre: string;
  metodologia?: string;
  estado?: 'planeado' | 'en_progreso' | 'pausado' | 'completado' | 'cancelado';
  presupuesto?: number;
};

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/api/projects');
        const lista = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setProyectos(lista);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar proyectos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Gestión de Proyectos</h1>
        <a href="/proyectos/nuevo" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Nuevo proyecto</a>
      </div>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Metodología</th>
                <th className="p-2 border">Estado</th>
                <th className="p-2 border">Presupuesto</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.length === 0 && (
                <tr>
                  <td className="p-3 border" colSpan={5}>No hay proyectos. Crea el primero.</td>
                </tr>
              )}
              {proyectos.map((p) => (
                <tr key={p._id}>
                  <td className="p-2 border">{p.nombre}</td>
                  <td className="p-2 border">{p.metodologia || 'kanban'}</td>
                  <td className="p-2 border">{p.estado || 'planeado'}</td>
                  <td className="p-2 border">{typeof p.presupuesto === 'number' ? new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP'}).format(p.presupuesto) : '-'}</td>
                  <td className="p-2 border">
                    <a className="text-blue-600 hover:underline" href={`/proyectos/${p._id}`}>Abrir</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
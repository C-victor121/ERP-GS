"use client";
import React, { useState } from 'react';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [metodologia, setMetodologia] = useState<string>('kanban');
  const [presupuesto, setPresupuesto] = useState<number | ''>('');
  const [estado, setEstado] = useState<'planeado'|'en_progreso'|'pausado'|'completado'|'cancelado'>('planeado');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: any = { nombre, metodologia, estado };
      if (presupuesto !== '') payload.presupuesto = Number(presupuesto);
      if (fechaInicio) payload.fechaInicio = new Date(fechaInicio);
      const res = await apiFetch('/api/projects', { method: 'POST', body: payload });
      const id = res?.data?._id || res?._id;
      router.push('/proyectos');
    } catch (err: any) {
      setError(err?.message || 'Error al crear proyecto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Nuevo Proyecto</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input className="w-full border rounded p-2" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Metodología</label>
            <input className="w-full border rounded p-2" value={metodologia} onChange={(e) => setMetodologia(e.target.value)} placeholder="Ej: Kanban, Scrum, PMBOK, Propia..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select className="w-full border rounded p-2" value={estado} onChange={(e) => setEstado(e.target.value as any)}>
              <option value="planeado">Planeado</option>
              <option value="en_progreso">En progreso</option>
              <option value="pausado">Pausado</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de inicio</label>
          <input type="date" className="w-full border rounded p-2" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Presupuesto (COP)</label>
          <input type="number" min={0} className="w-full border rounded p-2" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
          <a href="/proyectos" className="px-4 py-2 border rounded">Cancelar</a>
        </div>
      </form>
    </div>
  );
}
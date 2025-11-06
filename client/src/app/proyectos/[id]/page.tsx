"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import KanbanBoard, { KanbanColumn } from '@/components/projects/KanbanBoard';

type Project = { _id: string; nombre: string; metodologia?: string; estado?: string; presupuesto?: number; fechaInicio?: string };
type Task = { _id: string; titulo: string; descripcion?: string; estado: KanbanColumn };
type TimeEntry = { _id: string; fecha: string; horas: number; costoHora?: number; nota?: string };
type MaterialUsage = { _id: string; nombre: string; cantidad: number; unidad?: string; costoUnitario?: number; costoTotal?: number; fecha?: string; nota?: string };

export default function ProyectoDetallePage() {
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [times, setTimes] = useState<TimeEntry[]>([]);
  const [materials, setMaterials] = useState<MaterialUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editMetodologia, setEditMetodologia] = useState<string>('');
  const [editFechaInicio, setEditFechaInicio] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await apiFetch(`/api/projects/${id}`);
        const pj = p?.data || p;
        setProject(pj);
        setEditMetodologia(pj?.metodologia || '');
        setEditFechaInicio(pj?.fechaInicio ? new Date(pj.fechaInicio).toISOString().slice(0,10) : '');
        const t = await apiFetch(`/api/projects/${id}/tasks`);
        const lista = Array.isArray(t?.data) ? t.data : (Array.isArray(t) ? t : []);
        setTasks(lista);
        const tt = await apiFetch(`/api/projects/${id}/times`);
        setTimes(Array.isArray(tt?.data) ? tt.data : (Array.isArray(tt) ? tt : []));
        const mm = await apiFetch(`/api/projects/${id}/materials`);
        setMaterials(Array.isArray(mm?.data) ? mm.data : (Array.isArray(mm) ? mm : []));
      } catch (e: any) {
        setError(e?.message || 'Error al cargar proyecto');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleMove = async (taskId: string, estado: KanbanColumn) => {
    try {
      await apiFetch(`/api/projects/${id}/tasks/${taskId}/move`, { method: 'PATCH', body: { estado } });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, estado } : t)));
    } catch (e: any) {
      alert(e?.message || 'No se pudo mover la tarea');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await apiFetch(`/api/projects/${id}/tasks`, { method: 'POST', body: { titulo: newTaskTitle, estado: 'backlog' } });
      const created = res?.data || res;
      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle('');
    } catch (e: any) {
      alert(e?.message || 'No se pudo crear la tarea');
    }
  };

  // Registro de tiempos
  const [fechaTiempo, setFechaTiempo] = useState<string>('');
  const [horasTiempo, setHorasTiempo] = useState<string>('');
  const [costoHora, setCostoHora] = useState<string>('');
  const [notaTiempo, setNotaTiempo] = useState<string>('');

  const handleAddTime = async () => {
    if (!horasTiempo) return;
    try {
      const payload: any = { horas: Number(horasTiempo) };
      if (fechaTiempo) payload.fecha = new Date(fechaTiempo);
      if (costoHora) payload.costoHora = Number(costoHora);
      if (notaTiempo) payload.nota = notaTiempo;
      const res = await apiFetch(`/api/projects/${id}/times`, { method: 'POST', body: payload });
      const created = res?.data || res;
      setTimes((prev) => [created, ...prev]);
      setFechaTiempo(''); setHorasTiempo(''); setCostoHora(''); setNotaTiempo('');
    } catch (e: any) {
      alert(e?.message || 'No se pudo registrar tiempo');
    }
  };

  // Registro de materiales
  const [matNombre, setMatNombre] = useState<string>('');
  const [matCantidad, setMatCantidad] = useState<string>('');
  const [matUnidad, setMatUnidad] = useState<string>('unidad');
  const [matCostoUnit, setMatCostoUnit] = useState<string>('');
  const [matNota, setMatNota] = useState<string>('');

  const handleAddMaterial = async () => {
    if (!matNombre || !matCantidad) return;
    try {
      const payload: any = { nombre: matNombre, cantidad: Number(matCantidad), unidad: matUnidad };
      if (matCostoUnit) payload.costoUnitario = Number(matCostoUnit);
      if (matNota) payload.nota = matNota;
      const res = await apiFetch(`/api/projects/${id}/materials`, { method: 'POST', body: payload });
      const created = res?.data || res;
      setMaterials((prev) => [created, ...prev]);
      setMatNombre(''); setMatCantidad(''); setMatUnidad('unidad'); setMatCostoUnit(''); setMatNota('');
    } catch (e: any) {
      alert(e?.message || 'No se pudo registrar material');
    }
  };

  const handleSaveProjectInfo = async () => {
    try {
      const payload: any = {};
      payload.metodologia = editMetodologia || '';
      if (editFechaInicio) payload.fechaInicio = new Date(editFechaInicio);
      else payload.fechaInicio = null;
      const res = await apiFetch(`/api/projects/${id}`, { method: 'PUT', body: payload });
      const updated = res?.data || res;
      setProject(updated);
      alert('Proyecto actualizado');
    } catch (e: any) {
      alert(e?.message || 'No se pudo actualizar el proyecto');
    }
  };

  return (
    <div className="p-6">
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {project && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{project.nombre}</h1>
            <a href="/proyectos" className="text-blue-600 hover:underline">Volver</a>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Metodología</div>
              <div className="font-medium mb-2">{project.metodologia || '-'}</div>
              <input className="w-full border rounded p-2" value={editMetodologia} onChange={(e) => setEditMetodologia(e.target.value)} placeholder="Editar metodología" />
            </div>
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Estado</div>
              <div className="font-medium">{project.estado || 'planeado'}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Presupuesto</div>
              <div className="font-medium">{typeof project.presupuesto === 'number' ? new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP'}).format(project.presupuesto) : '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Fecha de inicio</div>
              <div className="font-medium mb-2">{project.fechaInicio ? new Date(project.fechaInicio).toLocaleDateString('es-CO') : '-'}</div>
              <input type="date" className="w-full border rounded p-2" value={editFechaInicio} onChange={(e) => setEditFechaInicio(e.target.value)} />
            </div>
          </div>
          <div className="mt-2">
            <button onClick={handleSaveProjectInfo} className="px-3 py-2 bg-blue-600 text-white rounded">Guardar cambios</button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm mb-1">Nueva tarea</label>
              <input className="w-full border rounded p-2" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Título de la tarea" />
            </div>
            <button onClick={handleAddTask} className="px-4 py-2 bg-blue-600 text-white rounded">Añadir</button>
          </div>

          <KanbanBoard tasks={tasks} onMove={handleMove} />

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Control de tiempos</h2>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input type="date" className="border rounded p-2" value={fechaTiempo} onChange={(e) => setFechaTiempo(e.target.value)} />
                <input type="number" min={0} step="0.25" placeholder="Horas" className="border rounded p-2" value={horasTiempo} onChange={(e) => setHorasTiempo(e.target.value)} />
                <input type="number" min={0} step="100" placeholder="Costo hora (COP)" className="border rounded p-2" value={costoHora} onChange={(e) => setCostoHora(e.target.value)} />
                <input placeholder="Nota" className="border rounded p-2" value={notaTiempo} onChange={(e) => setNotaTiempo(e.target.value)} />
              </div>
              <button onClick={handleAddTime} className="px-3 py-2 bg-green-600 text-white rounded">Registrar tiempo</button>
              <div className="mt-3">
                {times.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin registros</div>
                ) : (
                  <ul className="space-y-2">
                    {times.slice(0,5).map((t) => (
                      <li key={t._id} className="p-2 border rounded">
                        <div className="text-sm">{t.fecha ? new Date(t.fecha).toLocaleDateString('es-CO') : ''} • {t.horas} h • {t.costoHora ? new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP'}).format(t.costoHora) : ''}</div>
                        {t.nota && <div className="text-xs text-gray-600">{t.nota}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Control de materiales</h2>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="Nombre" className="border rounded p-2" value={matNombre} onChange={(e) => setMatNombre(e.target.value)} />
                <input type="number" min={0} step="1" placeholder="Cantidad" className="border rounded p-2" value={matCantidad} onChange={(e) => setMatCantidad(e.target.value)} />
                <select className="border rounded p-2" value={matUnidad} onChange={(e) => setMatUnidad(e.target.value)}>
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kg</option>
                  <option value="m">Metro</option>
                </select>
                <input type="number" min={0} step="100" placeholder="Costo unitario (COP)" className="border rounded p-2" value={matCostoUnit} onChange={(e) => setMatCostoUnit(e.target.value)} />
                <input placeholder="Nota" className="border rounded p-2" value={matNota} onChange={(e) => setMatNota(e.target.value)} />
              </div>
              <button onClick={handleAddMaterial} className="px-3 py-2 bg-green-600 text-white rounded">Registrar material</button>
              <div className="mt-3">
                {materials.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin registros</div>
                ) : (
                  <ul className="space-y-2">
                    {materials.slice(0,5).map((m) => (
                      <li key={m._id} className="p-2 border rounded">
                        <div className="text-sm">{m.nombre} • {m.cantidad} {m.unidad || ''} • {typeof m.costoTotal === 'number' ? new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP'}).format(m.costoTotal) : ''}</div>
                        {m.nota && <div className="text-xs text-gray-600">{m.nota}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
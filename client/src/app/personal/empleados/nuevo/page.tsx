"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface FormState {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoDocumento: 'CC' | 'CE' | 'PASAPORTE';
  numeroDocumento: string;
  fechaNacimiento: string; // ISO date string
  cargo: string;
  departamento: string;
  salarioBase: number | string;
  fechaIngreso: string; // ISO date string
  estado: 'activo' | 'inactivo' | 'suspendido';
  eps: string;
  pension: string;
  arl: string;
  cajaCompensacion: string;
  cesantias: string;
}

export default function NuevoEmpleadoPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    fechaNacimiento: "",
    cargo: "",
    departamento: "",
    salarioBase: "",
    fechaIngreso: new Date().toISOString().slice(0, 10),
    estado: "activo",
    eps: "",
    pension: "",
    arl: "",
    cajaCompensacion: "",
    cesantias: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        salarioBase: Number(form.salarioBase),
        fechaIngreso: new Date(form.fechaIngreso),
        fechaNacimiento: new Date(form.fechaNacimiento),
      };
      await apiFetch('/api/employees', { method: 'POST', body: payload });
      setSuccess('Empleado creado exitosamente');
      // Redirigir a la lista tras un breve delay
      setTimeout(() => router.push('/personal/empleados'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Error al crear el empleado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Registrar Nuevo Empleado</h1>
        <p className="text-gray-700">Crea el registro manual del empleado.</p>
      </div>

      {(error || success) && (
        <div className={`mb-4 rounded-md border p-4 ${error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className={error ? 'text-red-800' : 'text-green-800'}>
            {error || success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Datos personales */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Datos Personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="border rounded-md p-2" required />
            <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" className="border rounded-md p-2" required />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Correo" className="border rounded-md p-2" required />
            <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono (10 dígitos)" className="border rounded-md p-2" required />
            <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" className="border rounded-md p-2" required />
            <div className="flex gap-2">
              <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className="border rounded-md p-2 w-32">
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
              <input name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} placeholder="Número de documento" className="border rounded-md p-2 flex-1" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha de nacimiento</label>
              <input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} className="border rounded-md p-2 w-full" required />
            </div>
          </div>
        </div>

        {/* Información laboral */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Información Laboral</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="cargo" value={form.cargo} onChange={handleChange} placeholder="Cargo" className="border rounded-md p-2" required />
            <input name="departamento" value={form.departamento} onChange={handleChange} placeholder="Departamento" className="border rounded-md p-2" required />
            <input name="salarioBase" type="number" min={0} value={form.salarioBase} onChange={handleChange} placeholder="Salario Base" className="border rounded-md p-2" required />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha de ingreso</label>
              <input name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={handleChange} className="border rounded-md p-2 w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange} className="border rounded-md p-2 w-full">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seguridad social */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Seguridad Social</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="eps" value={form.eps} onChange={handleChange} placeholder="EPS" className="border rounded-md p-2" required />
            <input name="pension" value={form.pension} onChange={handleChange} placeholder="Fondo de pensión" className="border rounded-md p-2" required />
            <input name="arl" value={form.arl} onChange={handleChange} placeholder="ARL" className="border rounded-md p-2" required />
            <input name="cajaCompensacion" value={form.cajaCompensacion} onChange={handleChange} placeholder="Caja de compensación" className="border rounded-md p-2" required />
            <input name="cesantias" value={form.cesantias} onChange={handleChange} placeholder="Fondo de cesantías" className="border rounded-md p-2" required />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/personal/empleados')}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Guardar Empleado'}
          </button>
        </div>
      </form>
    </div>
  );
}
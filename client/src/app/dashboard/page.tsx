'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Protected from '../../components/auth/Protected';
import { getProfile, apiFetch } from '../../utils/api';

interface User {
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [invoicesCount, setInvoicesCount] = useState<number>(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data.user);
      } catch (error) {
        console.error('Error al obtener perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  useEffect(() => {
    const fetchProductsCount = async () => {
      try {
        const res: any = await apiFetch('/api/products?activo=true');
        const count = Array.isArray(res?.data) ? res.data.length : 0;
        setProductsCount(count);
      } catch (err) {
        console.error('Error al contar productos:', err);
      }
    };
    fetchProductsCount();
  }, [router]);

  useEffect(() => {
    const fetchInvoicesCount = async () => {
      try {
        const res: any = await apiFetch('/api/invoices');
        const count = Array.isArray(res?.data) ? res.data.length : 0;
        setInvoicesCount(count);
      } catch (err) {
        console.error('Error al contar facturas:', err);
      }
    };
    fetchInvoicesCount();
  }, [router]);

  if (loading) {
    return (
      <Protected>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido, {user?.nombre} {user?.apellido}</h1>
          <p className="text-gray-600 mb-2">Panel de control del sistema ERP de Global Solar</p>
          <p className="text-sm text-gray-700">Tipo de usuario: <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded">{user?.rol}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard 
            title="Productos" 
            count={String(productsCount)} 
            icon="📦" 
            link="/productos" 
            color="bg-blue-500" 
          />
          <DashboardCard 
            title="Facturas" 
            count={String(invoicesCount)} 
            icon="📄" 
            link="/facturas" 
            color="bg-green-500" 
          />
          <DashboardCard 
            title="Proveedores" 
            count="0" 
            icon="🏭" 
            link="/proveedores" 
            color="bg-yellow-500" 
          />
          <DashboardCard 
            title="Compras" 
            count="0" 
            icon="🛒" 
            link="/compras" 
            color="bg-purple-500" 
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
          <div className="border-t border-gray-200">
            <p className="py-4 text-gray-500 text-center">No hay actividad reciente para mostrar.</p>
          </div>
        </div>
      </div>
    </Protected>
  );
};

interface DashboardCardProps {
  title: string;
  count: string;
  icon: string;
  link: string;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, count, icon, link, color }) => {
  const router = useRouter();
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onClick={() => router.push(link)}
    >
      <div className={`${color} p-4 text-white text-center`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-2">{count}</p>
      </div>
    </div>
  );
};

export default Dashboard;
'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../../components/auth/LoginForm';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLoginSuccess = () => {
    setLoginSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Iniciar Sesión</h1>
          <p className="mt-2 text-sm text-gray-600">
            Accede a tu cuenta para gestionar el sistema ERP
          </p>
        </div>

        {loginSuccess ? (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            Inicio de sesión exitoso. Redirigiendo al dashboard...
          </div>
        ) : (
          <Suspense fallback={<div className="p-4 text-center">Cargando formulario...</div>}>
            <LoginForm onSuccess={handleLoginSuccess} />
          </Suspense>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
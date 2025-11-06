'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '../../components/auth/RegisterForm';
import Link from 'next/link';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleRegisterSuccess = () => {
    setRegisterSuccess(true);
    setTimeout(() => {
      const redirect = (typeof window !== 'undefined') ? new URLSearchParams(window.location.search).get('redirect') : null;
      router.push(redirect || '/dashboard');
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Registro</h1>
          <p className="mt-2 text-sm text-gray-600">
            Crea una cuenta para acceder al sistema ERP
          </p>
        </div>

        {registerSuccess ? (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            Registro exitoso. Redirigiendo a la página de inicio de sesión...
          </div>
        ) : (
          <RegisterForm onSuccess={handleRegisterSuccess} />
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
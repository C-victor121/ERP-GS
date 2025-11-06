'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedProps {
  children: React.ReactNode;
}

function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

const Protected: React.FC<ProtectedProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token') || getCookieToken()
      : null;

    if (!token) {
      const redirect = encodeURIComponent(pathname || '/');
      router.replace(`/login?redirect=${redirect}`);
      return;
    }

    setAuthorized(true);
  }, [router, pathname]);

  if (!authorized) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Protected;
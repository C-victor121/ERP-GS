// Utilidad de cliente de API para el frontend
// Usa NEXT_PUBLIC_API_URL y añade Authorization automáticamente si hay token

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ALT_BASE_URL = process.env.NEXT_PUBLIC_API_ALT_URL || 'http://localhost:5001';

function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || getCookieToken()) : null;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  // No forzar Content-Type por defecto; solo establecer JSON cuando corresponda
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path}`;
  let response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  // Fallback: si el backend principal responde 404 en módulos nuevos (employees, payroll, projects),
  // reintentar con ALT_BASE_URL (p. ej. puerto 5001) para evitar bloqueo en desarrollo.
  if (!response.ok && response.status === 404 && /\/api\/(employees|payroll|projects)/.test(path) && BASE_URL !== ALT_BASE_URL) {
    response = await fetch(`${ALT_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    });
  }

  const data = isJson ? await response.json() : (await response.text() as any);

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `Error ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export async function login(email: string, password: string) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function register(payload: any) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function getProfile() {
  return apiFetch('/api/auth/profile');
}

export async function getInventorySettings() {
  return apiFetch('/api/settings/inventory');
}

export async function updateInventorySettings(payload: any) {
  return apiFetch('/api/settings/inventory', {
    method: 'PUT',
    body: payload,
  });
}

export async function updateMe(payload: any) {
  return apiFetch('/api/users/me', {
    method: 'PUT',
    body: payload,
  });
}

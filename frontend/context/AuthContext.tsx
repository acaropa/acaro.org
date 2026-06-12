'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'supervisor' | 'tecnico' | 'visitante';
  activo: boolean;
  permissions: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (...permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    api.get<{ user: AuthUser }>('/auth/me')
      .then(data => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      router.replace('/login');
    }
    window.addEventListener('acaro:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('acaro:unauthorized', handleUnauthorized);
  }, [router]);

  async function login(email: string, password: string) {
    const data = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    router.push(data.user.role === 'visitante' ? '/' : '/admin');
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }

  function can(...permissions: string[]) {
    return permissions.some(permission => user?.permissions.includes(permission));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

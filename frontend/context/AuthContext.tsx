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
  logout: (allSessions?: boolean) => Promise<void>;
  can: (...permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('token');
    api.restoreSession<AuthUser>()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel('acaro-auth')
      : null;
    function handleUnauthorized() {
      api.forgetSession();
      setUser(null);
      router.replace('/login');
    }
    function handleMessage(event: MessageEvent) {
      if (event.data === 'logout') handleUnauthorized();
    }
    window.addEventListener('acaro:unauthorized', handleUnauthorized);
    channel?.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('acaro:unauthorized', handleUnauthorized);
      channel?.removeEventListener('message', handleMessage);
      channel?.close();
    };
  }, [router]);

  async function login(email: string, password: string) {
    const data = await api.login<AuthUser>(email, password);
    setUser(data.user);
    router.push(data.user.role === 'visitante' ? '/' : '/admin');
  }

  async function logout(allSessions = false) {
    try {
      await api.logout(allSessions);
    } finally {
      setUser(null);
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('acaro-auth');
        channel.postMessage('logout');
        channel.close();
      }
      router.push('/login');
    }
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

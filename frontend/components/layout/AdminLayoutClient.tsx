'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminTopbar } from '@/components/layout/AdminTopbar';
import { PERMISSIONS, hasAnyPermission } from '@/lib/permissions';

const routePermissions: Array<{ prefix: string; permissions: string[] }> = [
  { prefix: '/admin/configuracion', permissions: [PERMISSIONS.CONFIGURACION_MANAGE] },
  { prefix: '/admin/usuarios', permissions: [PERMISSIONS.USUARIOS_READ] },
  { prefix: '/admin/noticias', permissions: [PERMISSIONS.NOTICIAS_CREATE, PERMISSIONS.NOTICIAS_UPDATE] },
  { prefix: '/admin/socios', permissions: [PERMISSIONS.SOCIOS_READ] },
  {
    prefix: '/admin/tecnicos',
    permissions: [PERMISSIONS.TECNICOS_READ],
  },
  {
    prefix: '/admin/productores',
    permissions: [PERMISSIONS.PRODUCTORES_CREATE, PERMISSIONS.PRODUCTORES_UPDATE],
  },
  {
    prefix: '/admin/proyectos',
    permissions: [PERMISSIONS.PROYECTOS_READ_ASSIGNED, PERMISSIONS.PROYECTOS_READ_PRIVATE],
  },
  {
    prefix: '/admin/biblioteca',
    permissions: [
      PERMISSIONS.BIBLIOTECA_READ_INTERNAL,
      PERMISSIONS.BIBLIOTECA_UPLOAD_OWN,
      PERMISSIONS.BIBLIOTECA_REVIEW,
    ],
  },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-sm text-muted">Cargando plataforma...</span>
      </div>
    );
  }

  if (!user) return null;

  const isInternalUser = user.role !== 'visitante';
  const routeRule = routePermissions.find(rule => pathname.startsWith(rule.prefix));
  const allowed = isInternalUser && (
    pathname === '/admin' ||
    !routeRule ||
    hasAnyPermission(user.permissions, routeRule.permissions)
  );

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm font-semibold text-red-600">403 · Acceso denegado</p>
          <h1 className="mt-2 text-2xl font-bold">No tienes permiso para ver esta página</h1>
          <button
            type="button"
            onClick={() => router.replace(user.role === 'visitante' ? '/' : '/admin')}
            className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-admin bg-background admin-background-noise flex flex-col md:flex-row">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className={`flex-1 w-full flex flex-col min-h-screen transition-[margin] duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <AdminTopbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(current => !current)}
        />
        <div className="flex-1 overflow-y-auto px-5 py-8 md:px-16 md:py-12 max-w-[1440px] mx-auto w-full space-y-12">
          {children}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido</h1>
      <p className="text-sm text-gray-500 mb-8">
        Sesión iniciada como <span className="font-medium">{user?.email}</span> · {user?.role}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Socios',     href: '/dashboard/socios',     color: 'bg-blue-600' },
          { label: 'Técnicos',   href: '/dashboard/tecnicos',   color: 'bg-emerald-600' },
          { label: 'Proyectos',  href: '/dashboard/proyectos',  color: 'bg-violet-600' },
          { label: 'Biblioteca', href: '/dashboard/biblioteca', color: 'bg-amber-600' },
        ].map(card => (
          <a
            key={card.href}
            href={card.href}
            className={`${card.color} text-white rounded-lg p-6 hover:opacity-90 transition-opacity`}
          >
            <span className="text-lg font-semibold">{card.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

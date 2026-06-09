'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const nav = [
  { href: '/dashboard',            label: 'Inicio',     roles: ['admin','supervisor','tecnico','visitante'] },
  { href: '/dashboard/socios',     label: 'Socios',     roles: ['admin','supervisor'] },
  { href: '/dashboard/tecnicos',   label: 'Técnicos',   roles: ['admin','supervisor','tecnico'] },
  { href: '/dashboard/proyectos',  label: 'Proyectos',  roles: ['admin','supervisor','tecnico'] },
  { href: '/dashboard/biblioteca', label: 'Biblioteca', roles: ['admin','supervisor','tecnico','visitante'] },
] as const;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const links = nav.filter(n => user && (n.roles as readonly string[]).includes(user.role));

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-gray-100 flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-lg font-bold tracking-wide">ACARO</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate mb-1">{user?.email}</p>
        <span className="inline-block text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded mb-3 capitalize">
          {user?.role}
        </span>
        <button
          onClick={logout}
          className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

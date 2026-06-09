'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string | null;
  clasificacion: string | null;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  fecha_inicio: string | null;
}

const estadoLabel: Record<string, string> = {
  pendiente:    'Pendiente',
  en_progreso:  'En progreso',
  completado:   'Completado',
  cancelado:    'Cancelado',
};

const estadoColor: Record<string, string> = {
  pendiente:   'bg-yellow-100 text-yellow-800',
  en_progreso: 'bg-blue-100 text-blue-800',
  completado:  'bg-green-100 text-green-800',
  cancelado:   'bg-red-100 text-red-800',
};

export default function LandingPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

  useEffect(() => {
    api.get<Proyecto[]>('/proyectos').then(setProyectos).catch(() => {});
  }, []);

  const publicos = proyectos.filter(p => p.estado !== 'cancelado');

  return (
    <div className="min-h-screen bg-[chocolate]">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">ACARO</span>
          <div className="flex gap-4 items-center">
            <Link href="/biblioteca" className="text-sm text-gray-300 hover:text-white transition-colors">
              Biblioteca
            </Link>
            <Link
              href="/login"
              className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-md transition-colors"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Asociación ACARO</h1>
          <p className="text-gray-300 text-lg">
            Gestión de proyectos, técnicos y documentación de la asociación.
          </p>
        </div>
      </section>

      {/* Proyectos */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Proyectos</h2>

        {publicos.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay proyectos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicos.map(p => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 leading-snug">{p.nombre}</h3>
                  <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${estadoColor[p.estado]}`}>
                    {estadoLabel[p.estado]}
                  </span>
                </div>
                {p.clasificacion && (
                  <p className="text-xs text-gray-400 mb-2">{p.clasificacion}</p>
                )}
                {p.descripcion && (
                  <p className="text-sm text-gray-600 line-clamp-3">{p.descripcion}</p>
                )}
                {p.fecha_inicio && (
                  <p className="mt-3 text-xs text-gray-400">
                    Inicio: {new Date(p.fecha_inicio).toLocaleDateString('es-EC')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} ACARO. Todos los derechos reservados.
      </footer>
    </div>
  );
}

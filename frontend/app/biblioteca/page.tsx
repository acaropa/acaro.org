'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Documento {
  id: number;
  titulo: string;
  descripcion: string | null;
  autor: string;
  fecha: string;
  link: string;
}

export default function BibliotecaPage() {
  const [docs, setDocs]       = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Documento[]>('/biblioteca')
      .then(setDocs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">ACARO</Link>
          <Link
            href="/login"
            className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-md transition-colors"
          >
            Ingresar
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Biblioteca</h1>
        <p className="text-sm text-gray-500 mb-8">Documentos y recursos de la asociación.</p>

        {loading && <p className="text-sm text-gray-400">Cargando...</p>}

        {!loading && docs.length === 0 && (
          <p className="text-sm text-gray-500">No hay documentos disponibles.</p>
        )}

        <div className="space-y-4">
          {docs.map(doc => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900">{doc.titulo}</h2>
                  {doc.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{doc.descripcion}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {doc.autor} · {new Date(doc.fecha).toLocaleDateString('es-EC')}
                  </p>
                </div>
                <a
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-colors"
                >
                  Ver documento
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

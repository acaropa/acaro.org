"use client";

import React, { useEffect, useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, Library, Upload, Grid, List, ArrowDownAZ, ArrowRight, FileText, PlayCircle, ExternalLink } from 'lucide-react';

interface LibraryRecord {
  id: number;
  titulo: string;
  descripcion: string | null;
  autor: string;
  fecha: string;
  link: string;
}

interface Document {
  id: number;
  resourceType: 'pdf' | 'video' | 'link' | 'doc';
  type: string;
  title: string;
  description: string;
  category: string;
  date: string;
  contributor: string;
  meta: string;
  link: string;
  featured?: boolean;
}

const documentCategories = ['Todos'];

function toDocument(record: LibraryRecord, index: number): Document {
  const pathname = (() => {
    try { return new URL(record.link).pathname.toLowerCase(); }
    catch { return ''; }
  })();
  const resourceType = pathname.endsWith('.pdf') ? 'pdf'
    : /\.(mp4|webm|mov)$/.test(pathname) ? 'video'
    : /\.(doc|docx|odt)$/.test(pathname) ? 'doc'
    : 'link';

  return {
    id: record.id,
    resourceType,
    type: resourceType === 'pdf' ? 'PDF' : resourceType === 'video' ? 'Video' : resourceType === 'doc' ? 'Documento' : 'Enlace',
    title: record.titulo,
    description: record.descripcion || 'Recurso disponible en la biblioteca de ACARO.',
    category: 'Biblioteca',
    date: new Date(`${record.fecha.slice(0, 10)}T00:00:00`).toLocaleDateString('es-PA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    contributor: record.autor,
    meta: resourceType === 'link' ? 'Enlace externo' : 'Abrir recurso',
    link: record.link,
    featured: index < 3,
  };
}

function FeaturedCard({ doc }: { doc: Document }) {
  const TypeIcon = doc.resourceType === 'link' ? ExternalLink : doc.resourceType === 'video' ? PlayCircle : FileText;

  return (
    <a href={doc.link} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="flex h-full flex-col cursor-pointer overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1 hover:border-accent">
      <div className="h-32 relative bg-gradient-to-br from-primary to-[#2c1a12] p-5 flex items-end">
        <div className="absolute top-4 right-4">
          <Badge variant="warning">Destacado</Badge>
        </div>
        <div className="w-12 h-12 rounded-lg bg-[#b67332]/30 text-[#b67332] flex items-center justify-center">
          <TypeIcon size={24} />
        </div>
      </div>
      <CardContent className="p-6 flex flex-col gap-3 flex-1">
        <span className="text-xs font-semibold tracking-wider uppercase text-accent">
          {doc.type} · {doc.category}
        </span>
        <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-accent transition-colors">
          {doc.title}
        </h3>
        <p className="text-sm text-muted line-clamp-2 flex-1">
          {doc.description}
        </p>
        <div className="pt-4 mt-2 border-t border-border flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Aportado por {doc.contributor}</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-accent">
            Abrir <ArrowRight size={16} />
          </span>
        </div>
      </CardContent>
      </Card>
    </a>
  );
}

function DocumentCard({ doc }: { doc: Document }) {
  const TypeIcon = doc.resourceType === 'link' ? ExternalLink : doc.resourceType === 'video' ? PlayCircle : FileText;

  return (
    <a href={doc.link} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="flex h-full flex-col cursor-pointer overflow-hidden group hover:shadow-md transition-all hover:border-accent">
      <CardContent className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">
            {doc.type}
          </Badge>
          <div className="w-8 h-8 rounded-md bg-surface text-muted flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-colors">
            <TypeIcon size={18} />
          </div>
        </div>
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-wider uppercase text-muted mb-1 block">
            {doc.category}
          </span>
          <h4 className="font-semibold text-lg leading-tight mb-2 group-hover:text-accent transition-colors">
            {doc.title}
          </h4>
          <p className="text-sm text-muted line-clamp-2">
            {doc.description}
          </p>
        </div>
        <div className="pt-4 mt-auto border-t border-border flex items-center justify-between text-xs text-muted">
          <span>{doc.meta}</span>
          <span className="flex items-center gap-1 font-medium group-hover:text-accent transition-colors">
            Abrir <ArrowRight size={14} />
          </span>
        </div>
      </CardContent>
      </Card>
    </a>
  );
}

function DocumentRow({ doc }: { doc: Document }) {
  const TypeIcon = doc.resourceType === 'link' ? ExternalLink : doc.resourceType === 'video' ? PlayCircle : FileText;

  return (
    <a href={doc.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-surface/50 transition-colors cursor-pointer group">
      <div className="w-10 h-10 shrink-0 rounded-md bg-surface text-muted flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-colors">
        <TypeIcon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-base leading-tight truncate group-hover:text-accent transition-colors">
          {doc.title}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted">
          <span>{doc.category}</span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">{doc.type}</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>{doc.meta}</span>
        </div>
      </div>
      <div className="shrink-0 pl-4 hidden md:block text-sm text-muted">
        {doc.date}
      </div>
    </a>
  );
}

export default function Biblioteca() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('Todos');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'recent' | 'az'>('recent');

  useEffect(() => {
    api.get<LibraryRecord[]>('/biblioteca')
      .then(data => setDocuments(data.map(toDocument)))
      .catch(err => setLoadError(err instanceof Error ? err.message : 'No se pudo cargar la biblioteca'))
      .finally(() => setLoading(false));
  }, []);

  const featured = documents.filter(d => d.featured).slice(0, 3);

  let filtered = documents.filter(d => {
    const okCat = cat === 'Todos' || d.category === cat;
    const q = query.trim().toLowerCase();
    const okQ = !q || (d.title + ' ' + d.description + ' ' + d.type + ' ' + d.contributor).toLowerCase().includes(q);
    return okCat && okQ;
  });

  if (sort === 'az') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'es'));
  }

  const grouped: [string, Document[]][] = [];
  if (view === 'list' && sort === 'az') {
    const map: Record<string, Document[]> = {};
    filtered.forEach(d => {
      const L = d.title[0].toUpperCase();
      (map[L] = map[L] || []).push(d);
    });
    Object.keys(map).sort((a, b) => a.localeCompare(b, 'es')).forEach(L => {
      grouped.push([L, map[L]]);
    });
  }

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#2c1a12]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#2c1a12]/70 to-[#2c1a12] z-10" />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-20 pb-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#b67332]">
              <Library size={16} /> Centro de recursos &middot; Biblioteca pública
            </span>
            <h1 className="mt-4 font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1]">
              Biblioteca técnica
            </h1>
            <p className="mt-5 text-lg text-[#E7D9C6] leading-relaxed max-w-xl">
              Recursos, documentos y guías para fortalecer la producción, organización y desarrollo del café robusta. Acceso público a materiales aportados por la asociación y sus colaboradores.
            </p>
            <div className="mt-8 max-w-lg relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                <Search size={20} />
              </div>
              <Input
                className="pl-10 h-12 bg-white/95 text-black placeholder:text-gray-500 border-0 ring-offset-0 focus-visible:ring-accent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar documentos, guías o recursos…"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <div className="border-b border-border bg-background sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {documentCategories.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                cat === c
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-foreground border-border hover:bg-surface'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      {cat === 'Todos' && !query && (
        <section className="bg-background pt-16 pb-2">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <span className="text-sm font-semibold tracking-wider uppercase text-accent">Recursos destacados</span>
              <h2 className="text-3xl font-bold mt-1">Documentos recomendados</h2>
              <p className="text-muted mt-2">Una selección curada de las guías y estudios más consultados por las y los asociados.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(d => <FeaturedCard key={d.id} doc={d} />)}
            </div>
          </div>
        </section>
      )}

      {/* LISTADO */}
      <section className="bg-background py-16 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-border">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-accent">
                {cat === 'Todos' ? 'Todos los recursos' : cat}
              </span>
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl md:text-3xl font-bold">Listado de documentos</h2>
                <span className="text-sm text-muted font-medium">{filtered.length} {filtered.length === 1 ? 'recurso' : 'recursos'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort Seg */}
              <div className="inline-flex p-1 gap-0.5 bg-surface border border-border rounded-lg">
                <button
                  onClick={() => setSort('recent')}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-colors ${sort === 'recent' ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
                >
                  Recientes
                </button>
                <button
                  onClick={() => setSort('az')}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-colors ${sort === 'az' ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
                >
                  <ArrowDownAZ size={15} /> A-Z
                </button>
              </div>
              {/* View Seg */}
              <div className="inline-flex p-1 gap-0.5 bg-surface border border-border rounded-lg">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-muted">Cargando biblioteca...</p>
          ) : loadError ? (
            <EmptyState
              icon={<Library className="w-8 h-8" />}
              title="No se pudo cargar la biblioteca"
              description={loadError}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="Aún no hay documentos disponibles"
              description="Estamos sumando nuevos recursos técnicos. Vuelve a consultar pronto."
            />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map(d => <DocumentCard key={d.id} doc={d} />)}
            </div>
          ) : sort === 'az' ? (
            <div className="flex flex-col gap-8">
              {grouped.map(([letter, docs]) => (
                <div key={letter}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-bold text-xl text-accent w-6">{letter}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <Card className="overflow-hidden">
                    {docs.map(d => <DocumentRow key={d.id} doc={d} />)}
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              {filtered.map(d => <DocumentRow key={d.id} doc={d} />)}
            </Card>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#2c1a12] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#b67332]">Contribuye</span>
          <h2 className="mt-4 font-bold text-3xl md:text-4xl text-white leading-tight">
            ¿Tienes un documento técnico para compartir?
          </h2>
          <p className="mt-4 text-lg text-[#D9C7B2]">
            Contribuye al crecimiento de la biblioteca de la asociación y fortalece el conocimiento del sector cafetalero.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button variant="secondary" size="lg" className="gap-2 bg-[#b67332] hover:bg-[#b67332]/90 text-white border-0">
              <Upload size={18} /> Enviar recurso
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
              Contactar asociación
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

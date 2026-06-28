"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Download,
  FileText,
  Languages,
  Library,
} from "lucide-react";

import { LibrarySearchHero } from "@/components/library/LibrarySearchHero";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, apiAssetUrl } from "@/lib/api";
import {
  LibraryDocument,
  LibraryRecord,
  categoryGradient,
  libraryCategories,
  matchesLibraryQuery,
  toLibraryDocument,
} from "@/lib/library";

const themeCards = [
  {
    title: "Institucional",
    category: libraryCategories[4],
    description: "Archivos historicos, protocolos y reportes de la organizacion.",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Proyectos",
    category: libraryCategories[2],
    description: "Documentacion de iniciativas y resultados de campo.",
    className: "md:col-span-1",
  },
  {
    title: "Formacion",
    category: libraryCategories[3],
    description: "Materiales para talleres, capacitaciones y aprendizaje continuo.",
    className: "md:col-span-1",
  },
  {
    title: "Guias tecnicas",
    category: libraryCategories[1],
    description: "Manuales detallados para la excelencia tecnica.",
    className: "md:col-span-2",
  },
];

function documentHref(document: LibraryDocument) {
  return `/biblioteca/detalle/?slug=${document.slug || ""}`;
}

function LibraryBackdrop({ document, className = "" }: { document?: LibraryDocument; className?: string }) {
  if (document?.coverImage) {
    return (
      <div
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${className}`}
        style={{ backgroundImage: `url('${apiAssetUrl(document.coverImage)}')` }}
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${categoryGradient(document?.category || "Agronomia")} transition-transform duration-700 group-hover:scale-105 ${className}`}
    />
  );
}

function ThemeCard({
  title,
  description,
  category,
  document,
  className,
  onSelect,
}: {
  title: string;
  description: string;
  category: string;
  document?: LibraryDocument;
  className: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative min-h-[260px] overflow-hidden border border-[#d3c3c0] text-left ${className}`}
    >
      <LibraryBackdrop document={document} />
      <div className="absolute inset-0 bg-[#271310]/45 transition-colors group-hover:bg-[#271310]/55" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#ffdea5]">{category}</p>
        <h3 className="font-serif text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-white/82">{description}</p>
      </div>
    </button>
  );
}

function FeaturedDocument({ document }: { document: LibraryDocument }) {
  return (
    <article className="grid overflow-hidden border border-[#d3c3c0] bg-white lg:grid-cols-2">
      <div className="relative min-h-[360px] overflow-hidden lg:min-h-[460px]">
        <LibraryBackdrop document={document} />
        <div className="absolute inset-0 bg-[#271310]/10" />
      </div>
      <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#231600]">Recurso destacado</p>
        <h3 className="mt-4 font-serif text-3xl font-semibold leading-tight text-[#271310] md:text-4xl">
          {document.title}
        </h3>
        <p className="mt-5 text-base leading-7 text-[#504442]">{document.description}</p>

        <div className="mt-7 flex flex-wrap gap-5 border-t border-[#d3c3c0] pt-6 text-sm text-[#504442]">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {document.date}
          </span>
          <span className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {document.type}
          </span>
          <span className="inline-flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Espanol
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={documentHref(document)}
            className="inline-flex items-center gap-2 bg-[#271310] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#3e2723]"
          >
            Ver documento
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={documentHref(document)}
            className="inline-flex items-center gap-2 border border-[#271310] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#271310] transition-colors hover:bg-[#ffdad4]"
          >
            <Download className="h-4 w-4" />
            Descargar PDF
          </Link>
        </div>
      </div>
    </article>
  );
}

function DocumentCard({ document }: { document: LibraryDocument }) {
  return (
    <article className="flex h-full flex-col border border-[#d3c3c0] bg-white p-7 transition-shadow hover:shadow-[0_18px_40px_rgba(39,19,16,0.12)]">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#231600]">{document.category}</p>
      <h4 className="mt-4 flex-1 font-serif text-xl font-semibold leading-snug text-[#271310]">
        {document.title}
      </h4>
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-[#d3c3c0]/55 pb-2">
          <span className="text-[#827472]">Autor</span>
          <span className="text-right font-semibold text-[#271310]">{document.contributor}</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-[#d3c3c0]/55 pb-2">
          <span className="text-[#827472]">Formato</span>
          <span className="text-right font-semibold text-[#271310]">{document.type}</span>
        </div>
      </div>
      <Link
        href={documentHref(document)}
        className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#231600] transition-colors hover:text-[#745853]"
      >
        Leer mas
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function ResultItem({ document }: { document: LibraryDocument }) {
  return (
    <div className="group flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#231600]">
          {document.category} / {document.year}
        </p>
        <Link
          href={documentHref(document)}
          className="mt-2 block font-serif text-2xl font-semibold leading-snug text-[#271310] transition-colors group-hover:text-[#745853]"
        >
          {document.title}
        </Link>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#504442]">{document.description}</p>
      </div>
      <div className="flex shrink-0 gap-3">
        <Link
          href={documentHref(document)}
          className="border border-[#827472] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#504442] transition-colors hover:border-[#271310] hover:bg-[#3e2723] hover:text-white"
        >
          Ver
        </Link>
        <Link
          href={documentHref(document)}
          aria-label={`Descargar ${document.title}`}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#827472] text-[#504442] transition-colors hover:bg-[#f4eceb]"
        >
          <Download className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function Biblioteca() {
  const router = useRouter();
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [suggestionDocs, setSuggestionDocs] = useState<LibraryDocument[]>([]);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api
      .get<LibraryRecord[]>("/biblioteca/portada?limit=12")
      .then(data => setDocuments(data.map(toLibraryDocument)))
      .catch(err => setLoadError(err instanceof Error ? err.message : "No se pudo cargar la biblioteca"))
      .finally(() => setLoading(false));
    api
      .get<LibraryRecord[]>("/biblioteca?limit=60")
      .then(data => setSuggestionDocs(data.map(toLibraryDocument)))
      .catch(() => setSuggestionDocs([]));
  }, []);

  const featured = documents[0] || null;
  const secondaryDocs = documents.slice(1, 4);
  const recentDocs = documents.slice(0, 4);

  const suggestions = useMemo(() => {
    const value = query.trim();
    if (value.length < 2) return [];
    return suggestionDocs.filter(document => matchesLibraryQuery(document, value)).slice(0, 5);
  }, [query, suggestionDocs]);

  const docsByCategory = useMemo(() => {
    return documents.reduce<Record<string, LibraryDocument | undefined>>((acc, document) => {
      if (!acc[document.category]) acc[document.category] = document;
      return acc;
    }, {});
  }, [documents]);

  function goToSearch(params?: Record<string, string>) {
    const searchParams = new URLSearchParams(params);
    const href = `/biblioteca/buscar${searchParams.size ? `?${searchParams}` : ""}`;
    router.push(href, { scroll: false });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    setShowSuggestions(false);
    goToSearch(nextQuery ? { q: nextQuery } : undefined);
  }

  function selectSuggestion(title: string) {
    setQuery(title);
    setShowSuggestions(false);
    goToSearch({ q: title });
  }

  return (
    <PublicLayout>
      <div className="library-page-enter bg-[#faf9f5] text-[#1e1b1a]">
        <LibrarySearchHero
          query={query}
          onQueryChange={value => { setQuery(value); setShowSuggestions(true); }}
          onSubmit={submitSearch}
          onClear={() => setQuery("")}
          onFocus={() => setShowSuggestions(true)}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setTimeout(() => setShowSuggestions(false), 200);
            }
          }}
          topics={libraryCategories.slice(0, 4).map(category => ({
            label: category,
            onClick: () => goToSearch({ categoria: category }),
          }))}
          suggestions={showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full z-50 mt-2 w-full overflow-hidden border border-[#ead9c6] bg-white text-left shadow-xl">
              <ul className="py-1">
                {suggestions.map(document => (
                  <li key={document.id}>
                    <button
                      type="button"
                      onClick={() => selectSuggestion(document.title)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-sm text-[#271310] transition-colors hover:bg-[#f0eded]"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-[#8d7c70]" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{document.title}</span>
                        <span className="mt-0.5 block text-xs uppercase tracking-[0.08em] text-[#827472]">
                          {document.category}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        />

        <div style={{ viewTransitionName: "library-below-content" }}>
          <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
            <div className="mb-10">
              <h2 className="font-serif text-3xl font-semibold text-[#271310]">Explora por tema</h2>
              <div className="mt-3 h-px w-24 bg-[#e9c176]" />
            </div>

            <div className="grid min-h-[620px] grid-cols-1 gap-6 md:grid-cols-4">
              {themeCards.map(card => (
                <ThemeCard
                  key={card.title}
                  {...card}
                  document={docsByCategory[card.category] || documents.find(doc => doc.category === card.category)}
                  onSelect={() => goToSearch({ categoria: card.category })}
                />
              ))}
            </div>
          </section>

          <section className="bg-[#faf2f0] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-semibold text-[#271310]">Documentos destacados</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#504442]">
                    Seleccion de recursos esenciales para productores, tecnicos e investigadores.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => goToSearch()}
                  className="group inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-widest text-[#231600] transition-colors hover:text-[#745853]"
                >
                  Ver todo el archivo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {loading ? (
                <div className="py-20 text-center text-sm text-[#827472]">Cargando biblioteca...</div>
              ) : loadError ? (
                <EmptyState icon={<Library className="h-8 w-8" />} title="No se pudo cargar la biblioteca" description={loadError} />
              ) : featured ? (
                <>
                  <FeaturedDocument document={featured} />
                  {secondaryDocs.length > 0 && (
                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                      {secondaryDocs.map(document => (
                        <DocumentCard key={document.id} document={document} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={<Library className="h-8 w-8" />}
                  title="No hay documentos publicados"
                  description="Cuando se publiquen recursos, apareceran en esta portada."
                />
              )}
            </div>
          </section>

          {recentDocs.length > 0 && (
            <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
              <div className="mb-2 flex items-center justify-between border-b border-[#271310] pb-6">
                <h2 className="font-serif text-3xl font-semibold text-[#271310]">Documentos recientes</h2>
                <span className="text-sm text-[#504442]">Mostrando {recentDocs.length} de {documents.length}</span>
              </div>
              <div className="divide-y divide-[#d3c3c0]">
                {recentDocs.map(document => (
                  <ResultItem key={document.id} document={document} />
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => goToSearch()}
                  className="border-b border-[#271310] pb-1 text-xs font-bold uppercase tracking-widest text-[#271310] transition-colors hover:border-[#745853] hover:text-[#745853]"
                >
                  Cargar mas documentos
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

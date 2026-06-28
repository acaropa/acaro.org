"use client";

import { FormEvent, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  Leaf,
  Library,
  List,
  LayoutGrid,
  Search,
  X,
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

const PAGE_SIZE = 9;
const resourceOptions = [
  ["Todos", "Todos"],
  ["pdf", "PDF"],
  ["doc", "Documentos"],
  ["video", "Videos"],
  ["link", "Externos"],
] as const;

/* ─── Resaltado de texto ─── */
function HighlightText({ text, query }: { text: string; query: string }) {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return <>{text}</>;
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        words.some(w => part.localeCompare(w, "es", { sensitivity: "accent" }) === 0) ? (
          <mark key={i} className="rounded-none bg-[#c28a3a]/20 px-0.5 text-inherit">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/* ─── Área de imagen con las 6 variantes del mockup ─── */
function CardImageArea({ document, variant }: { document: LibraryDocument; variant: number }) {
  const gradient = categoryGradient(document.category);
  const imgUrl = document.coverImage ? apiAssetUrl(document.coverImage) : null;

  if (variant === 0) {
    return (
      <div className="absolute inset-12 bg-white shadow-xl flex flex-col p-8 border border-neutral-100">
        <div className="w-12 h-1 bg-[#5a3424] mb-4" />
        <h4 className="font-serif text-base text-[#271310] mb-4 leading-tight line-clamp-4">{document.title}</h4>
        <p className="mt-auto text-[10px] text-[#8d7c70] tracking-widest uppercase">{document.type}</p>
      </div>
    );
  }
  if (variant === 1) {
    return (
      <>
        {imgUrl ? (
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url('${imgUrl}')` }} />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-700`} />
        )}
        <div className="absolute inset-0 bg-[#271310]/20" />
      </>
    );
  }
  if (variant === 2) {
    return (
      <div className="absolute inset-12 bg-[#271310] flex flex-col p-8 text-white">
        <FileText className="h-10 w-10 mb-4 text-[#c28a3a]" />
        <h4 className="font-serif text-base leading-tight text-white mb-4 line-clamp-4">{document.title}</h4>
        <div className="mt-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c28a3a]" />
          <p className="text-[10px] uppercase opacity-80">{document.category}</p>
        </div>
      </div>
    );
  }
  if (variant === 3) {
    return imgUrl ? (
      <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url('${imgUrl}')` }} />
    ) : (
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:scale-105 transition-transform duration-500`} />
    );
  }
  if (variant === 4) {
    return (
      <div className="absolute inset-12 border border-[#271310]/20 flex flex-col items-center justify-center text-center p-6">
        <Leaf className="h-12 w-12 text-[#5a3424] mb-4" />
        <h4 className="text-sm text-[#271310] uppercase tracking-widest font-bold">{document.category}</h4>
      </div>
    );
  }
  return imgUrl ? (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${imgUrl}')` }} />
  ) : (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
  );
}

/* ─── Card editorial con 6 variantes ─── */
function CatalogCard({ document, index, query }: { document: LibraryDocument; index: number; query: string }) {
  return (
    <article className="group bg-white border border-[#c3c8c1]/30 flex flex-col hover:border-[#271310]/40 transition-all duration-300">
      <div className="aspect-[3/4] relative overflow-hidden bg-[#efeeeb]" style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.03)" }}>
        <CardImageArea document={document} variant={index % 6} />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-[#5a3424] uppercase font-bold tracking-wider">{document.category}</span>
          <span className="text-[10px] text-[#8d7c70]">{document.date}</span>
        </div>
        <h3 className="text-base font-medium text-[#271310] mb-2 group-hover:text-[#5a3424] transition-colors leading-snug">
          <HighlightText text={document.title} query={query} />
        </h3>
        <p className="text-sm text-[#504442] line-clamp-3 mb-5 leading-relaxed">
          <HighlightText text={document.description} query={query} />
        </p>
        <Link
          href={`/biblioteca/detalle/?slug=${document.slug || ""}`}
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#271310] group-hover:gap-3 transition-all"
        >
          Ver detalles <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

/* ─── Chip de filtro activo ─── */
function FilterChip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#c3c8c1] bg-white text-xs font-semibold text-[#504442] hover:border-[#271310] transition-colors"
    >
      {children}
      <X className="h-3 w-3" />
    </button>
  );
}

/* ─── Vista de lista compacta ─── */
function ResultRow({ document, query }: { document: LibraryDocument; query: string }) {
  return (
    <Link
      href={`/biblioteca/detalle/?slug=${document.slug || ""}`}
      className="group flex items-center gap-5 border-b border-[#c3c8c1]/30 p-5 last:border-0 hover:bg-[#f5f3f0] transition-colors"
    >
      <div className="h-16 w-12 shrink-0 overflow-hidden bg-[#efeeeb]">
        {document.coverImage ? (
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${apiAssetUrl(document.coverImage)}')` }} />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${categoryGradient(document.category)}`} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] text-[#5a3424] uppercase font-bold tracking-wider">{document.category}</span>
          <span className="text-[#c3c8c1]">·</span>
          <span className="text-[10px] text-[#737973]">{document.date}</span>
        </div>
        <h3 className="text-base font-medium text-[#271310] group-hover:text-[#5a3424] transition-colors truncate">
          <HighlightText text={document.title} query={query} />
        </h3>
        <p className="mt-0.5 text-sm text-[#504442] line-clamp-1">
          <HighlightText text={document.description} query={query} />
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[#c28a3a]">
        {document.resourceType === "link" ? <ExternalLink className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

/* ─── Componente principal del catálogo ─── */
function SearchCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = libraryCategories.includes(searchParams.get("categoria") as never) ? searchParams.get("categoria")! : "Todos";
  const initialType = resourceOptions.some(([v]) => v === searchParams.get("tipo")) ? searchParams.get("tipo")! : "Todos";
  const initialSort = ["recent", "oldest", "az"].includes(searchParams.get("orden") || "") ? searchParams.get("orden")! : "recent";
  const initialView = searchParams.get("vista") === "list" ? "list" : "grid";
  const initialPage = Math.max(1, Number(searchParams.get("pagina")) || 1);
  const initialQuery = searchParams.get("q") || "";

  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [suggestionDocs, setSuggestionDocs] = useState<LibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState(initialQuery);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [resourceType, setResourceType] = useState(initialType);
  const [year, setYear] = useState(searchParams.get("anio") || "Todos");
  const [sort, setSort] = useState(initialSort);
  const [view, setView] = useState<"grid" | "list">(initialView);
  const [page, setPage] = useState(initialPage);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api
      .get<LibraryRecord[]>("/biblioteca?limit=200")
      .then(data => setSuggestionDocs(data.map(toLibraryDocument)))
      .catch(() => setSuggestionDocs([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (appliedQuery) params.set("q", appliedQuery);
    if (category !== "Todos") params.set("categoria", category);
    if (resourceType !== "Todos") params.set("tipo", resourceType);
    if (year !== "Todos") params.set("anio", year);
    if (sort !== "recent") params.set("orden", sort);

    api
      .get<LibraryRecord[]>(`/biblioteca${params.size ? `?${params}` : ""}`)
      .then(data => setDocuments(data.map(toLibraryDocument)))
      .catch(err => setLoadError(err instanceof Error ? err.message : "No se pudo cargar la biblioteca"))
      .finally(() => setLoading(false));
  }, [appliedQuery, category, resourceType, sort, year]);

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  const years = useMemo(
    () => [...new Set((suggestionDocs.length ? suggestionDocs : documents).map(d => d.year))].sort((a, b) => b.localeCompare(a)),
    [documents, suggestionDocs],
  );

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return (suggestionDocs.length ? suggestionDocs : documents)
      .filter(d => words.every(w => d.title.toLowerCase().includes(w)))
      .slice(0, 5);
  }, [query, documents, suggestionDocs]);

  const filtered = useMemo(() => {
    const matches = documents.filter(d =>
      matchesLibraryQuery(d, appliedQuery)
      && (category === "Todos" || d.category === category)
      && (resourceType === "Todos" || d.resourceType === resourceType)
      && (year === "Todos" || d.year === year),
    );
    return [...matches].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title, "es");
      if (sort === "oldest") return a.dateValue.localeCompare(b.dateValue);
      return b.dateValue.localeCompare(a.dateValue);
    });
  }, [appliedQuery, category, documents, resourceType, sort, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasActiveFilters = Boolean(appliedQuery || category !== "Todos" || resourceType !== "Todos" || year !== "Todos");

  function syncUrl(overrides: Partial<{ query: string; category: string; resourceType: string; year: string; sort: string; view: "grid" | "list"; page: number }>) {
    const next = { query: appliedQuery, category, resourceType, year, sort, view, page, ...overrides };
    const params = new URLSearchParams();
    if (next.query) params.set("q", next.query);
    if (next.category !== "Todos") params.set("categoria", next.category);
    if (next.resourceType !== "Todos") params.set("tipo", next.resourceType);
    if (next.year !== "Todos") params.set("anio", next.year);
    if (next.sort !== "recent") params.set("orden", next.sort);
    if (next.view !== "grid") params.set("vista", next.view);
    if (next.page > 1) params.set("pagina", String(next.page));
    router.replace(`/biblioteca/buscar${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  function clearFilters() {
    setQuery(""); setAppliedQuery(""); setCategory("Todos"); setResourceType("Todos"); setYear("Todos"); setPage(1);
    syncUrl({ query: "", category: "Todos", resourceType: "Todos", year: "Todos", page: 1 });
  }

  function clearQuery() {
    setQuery(""); setAppliedQuery(""); setPage(1);
    syncUrl({ query: "", page: 1 });
  }

  function selectSuggestion(title: string) {
    setQuery(title); setShowSuggestions(false);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setIsSearching(true); setShowResults(false);
    setTimeout(() => {
      setAppliedQuery(title); setPage(1); setShowResults(true); setIsSearching(false);
      syncUrl({ query: title, page: 1 });
    }, 150);
  }

  function submitSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const nextQuery = query.trim();
    setIsSearching(true); setShowResults(false); setShowSuggestions(false);
    searchTimer.current = setTimeout(() => {
      setAppliedQuery(nextQuery); setPage(1); setShowResults(true); setIsSearching(false);
      syncUrl({ query: nextQuery, page: 1 });
    }, 220);
  }

  function selectCategory(next: string) { setCategory(next); setPage(1); syncUrl({ category: next, page: 1 }); }
  function selectType(next: string) { setResourceType(next); setPage(1); syncUrl({ resourceType: next, page: 1 }); }
  function selectYear(next: string) { setYear(next); setPage(1); syncUrl({ year: next, page: 1 }); }
  function selectSort(next: string) { setSort(next); setPage(1); syncUrl({ sort: next, page: 1 }); }
  function selectView(next: "grid" | "list") { setView(next); syncUrl({ view: next }); }
  function selectPage(next: number) { setPage(next); syncUrl({ page: next }); }
  function returnToLibrary() {
    router.push("/biblioteca", { scroll: false });
  }

  return (
    <PublicLayout>
      <div className="library-page-enter min-h-screen bg-[#faf9f5] text-[#1b1c1a]">

        <LibrarySearchHero
          query={query}
          onQueryChange={value => { setQuery(value); setShowSuggestions(true); }}
          onSubmit={submitSearch}
          onClear={clearQuery}
          isSearching={isSearching}
          onFocus={() => setShowSuggestions(true)}
          onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setTimeout(() => setShowSuggestions(false), 200); }}
          backLabel="Volver a portada"
          onBack={returnToLibrary}
          topics={libraryCategories.map(item => ({
            label: item,
            active: category === item,
            onClick: () => selectCategory(item),
          }))}
          suggestions={showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full z-50 mt-2 w-full overflow-hidden border border-[#ead9c6] bg-white text-left shadow-xl">
              <ul className="py-1">
                {suggestions.map(doc => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => selectSuggestion(doc.title)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-sm text-[#271310] transition-colors hover:bg-[#f0eded]"
                    >
                      <Search className="h-4 w-4 shrink-0 text-[#8d7c70]" />
                      <span className="line-clamp-1 font-medium"><HighlightText text={doc.title} query={query} /></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        />

        {/* ── Contenido principal ── */}
        <main
          style={{ viewTransitionName: "library-below-content" }}
          className="mx-auto max-w-7xl bg-[#faf9f5] px-5 py-10 sm:px-8 lg:px-10"
        >

          {/* Barra de filtros horizontal */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#737973] mr-1">Tipo:</span>
              {resourceOptions.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectType(value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    resourceType === value
                      ? "bg-[#271310] text-white"
                      : "bg-white border border-[#c3c8c1] text-[#434843] hover:border-[#271310]"
                  }`}
                >
                  {label}
                </button>
              ))}

              <select
                value={year}
                onChange={e => selectYear(e.target.value)}
                className="ml-2 h-10 rounded-full border border-[#c3c8c1] bg-white px-4 text-sm text-[#271310] outline-none hover:border-[#271310] transition-colors"
              >
                <option value="Todos">Todos los años</option>
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <select
                value={sort}
                onChange={e => selectSort(e.target.value)}
                className="h-10 rounded-full border border-[#c3c8c1] bg-white px-4 text-sm text-[#271310] outline-none hover:border-[#271310] transition-colors"
              >
                <option value="recent">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="az">A–Z</option>
              </select>

              <div className="flex items-center gap-1 bg-[#efeeeb] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => selectView("grid")}
                  aria-label="Vista editorial"
                  className={`p-2 rounded transition-colors ${view === "grid" ? "bg-white text-[#271310] shadow-sm" : "text-[#737973] hover:text-[#271310]"}`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => selectView("list")}
                  aria-label="Vista compacta"
                  className={`p-2 rounded transition-colors ${view === "list" ? "bg-white text-[#271310] shadow-sm" : "text-[#737973] hover:text-[#271310]"}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Conteo + filtros activos */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="text-sm text-[#504442]">
              <span className="font-semibold text-[#271310]">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "resultado" : "resultados"}
              {appliedQuery && <> para <span className="font-semibold text-[#271310]">&ldquo;{appliedQuery}&rdquo;</span></>}
            </p>
            {hasActiveFilters && (
              <>
                {appliedQuery && <FilterChip onRemove={clearQuery}>&ldquo;{appliedQuery}&rdquo;</FilterChip>}
                {category !== "Todos" && <FilterChip onRemove={() => selectCategory("Todos")}>{category}</FilterChip>}
                {resourceType !== "Todos" && (
                  <FilterChip onRemove={() => selectType("Todos")}>
                    {resourceOptions.find(([v]) => v === resourceType)?.[1]}
                  </FilterChip>
                )}
                {year !== "Todos" && <FilterChip onRemove={() => selectYear("Todos")}>{year}</FilterChip>}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#5a3424] hover:underline underline-offset-4"
                >
                  Limpiar todos
                </button>
              </>
            )}
          </div>

          {/* Grid o lista */}
          <div
            aria-busy={isSearching}
            className={`transition-all duration-300 motion-reduce:transform-none motion-reduce:transition-none ${showResults ? "opacity-100 translate-y-0" : "opacity-30 translate-y-2"}`}
          >
            {loading ? (
              <div className="py-24 text-center text-sm text-[#8d7c70]">Cargando catálogo...</div>
            ) : loadError ? (
              <EmptyState icon={<Library className="h-8 w-8" />} title="No se pudo cargar la biblioteca" description={loadError} />
            ) : visible.length === 0 ? (
              <EmptyState icon={<Search className="h-8 w-8" />} title="No encontramos resultados" description="Prueba con otras palabras o limpia los filtros." />
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((doc, i) => <CatalogCard key={doc.id} document={doc} index={i} query={appliedQuery} />)}
              </div>
            ) : (
              <div className="border border-[#c3c8c1]/30 overflow-hidden bg-white">
                {visible.map(doc => <ResultRow key={doc.id} document={doc} query={appliedQuery} />)}
              </div>
            )}

            {/* Paginación */}
            {!loading && !loadError && filtered.length > PAGE_SIZE && (
              <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginación">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => selectPage(Math.max(1, currentPage - 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-full border border-[#c3c8c1] hover:border-[#271310] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "…" ? (
                        <span key={`e-${idx}`} className="flex h-12 w-8 items-center justify-center text-[#737973]">…</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => selectPage(item as number)}
                          className={`h-12 min-w-12 px-2 text-sm font-semibold rounded-full transition-colors ${
                            item === currentPage ? "bg-[#271310] text-white" : "hover:bg-[#efeeeb] text-[#271310]"
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}
                </div>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => selectPage(Math.min(totalPages, currentPage + 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-full border border-[#c3c8c1] hover:border-[#271310] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            )}
          </div>
        </main>
      </div>
    </PublicLayout>
  );
}

export default function BibliotecaBuscar() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f5]" />}>
      <SearchCatalog />
    </Suspense>
  );
}

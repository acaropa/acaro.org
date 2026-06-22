"use client";

import { FormEvent, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Grid2X2,
  Library,
  Link as LinkIcon,
  List,
  LoaderCircle,
  Search,
  Video,
  X,
} from "lucide-react";

import { LibraryPageTransition } from "@/components/library/LibraryPageTransition";
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
  ["link", "Enlaces externos"],
] as const;

function HighlightText({ text, query }: { text: string; query: string }) {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return text;

  const escaped = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  return text.split(pattern).map((part, index) =>
    words.some(word => part.localeCompare(word, "es", { sensitivity: "accent" }) === 0) ? (
      <mark key={`${part}-${index}`} className="rounded-none bg-accent/20 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

function ResultCard({ document, query }: { document: LibraryDocument; query: string }) {
  const getBadgeStyle = (category: string) => {
    if (category === "Estándares OBC" || category === "Sostenibilidad") {
      return "bg-brand-green/10 text-brand-green";
    }
    if (category === "Mercados" || category === "Procesamiento") {
      return "border border-accent text-accent bg-transparent";
    }
    return "bg-accent/10 text-accent";
  };

  return (
    <Link
      href={`/biblioteca/detalle/?slug=${document.slug || ""}`}
      className="group relative isolate flex min-h-[260px] flex-col overflow-hidden rounded-none border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/30"
    >
      <div className="absolute inset-0 -z-10">
        {document.coverImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.12] transition-opacity duration-300 group-hover:opacity-20"
            style={{ backgroundImage: `url('${apiAssetUrl(document.coverImage)}')` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient(document.category)} opacity-[0.07]`} />
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center text-primary">
          <DocumentIcon type={document.resourceType} className="h-6 w-6" />
        </div>
        <span className={`shrink-0 rounded-none px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${getBadgeStyle(document.category)}`}>
          {document.category}
        </span>
      </div>

      <h2 className="mt-5 font-serif text-[18px] font-semibold leading-snug text-primary">
        <HighlightText text={document.title} query={query} />
      </h2>

      <p className="mt-2.5 line-clamp-3 text-[13px] leading-[1.6] text-muted">
        <HighlightText text={document.description} query={query} />
      </p>

      {document.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {document.tags.slice(0, 3).map(tag => (
            <span key={tag} className="inline-flex items-center rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-end justify-between pt-6">
        <div className="flex flex-col gap-0.5 text-[11px] font-medium text-muted">
          <span>{document.date}</span>
          <span className="uppercase">{document.type}</span>
          {document.serie && (
            <span className="mt-1 text-[10px] text-accent">📖 {document.serie}{document.ordenLectura ? ` · Paso ${document.ordenLectura}` : ''}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-accent">
          {document.resourceType === "link" ? <ExternalLink className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </div>
      </div>
    </Link>
  );
}

function DocumentIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "pdf":
      return <FileText className={className} />;
    case "doc":
      return <FileSpreadsheet className={className} />;
    case "video":
      return <Video className={className} />;
    case "link":
      return <LinkIcon className={className} />;
    default:
      return <FileText className={className} />;
  }
}

function ResultRow({ document, query }: { document: LibraryDocument; query: string }) {
  return (
    <Link
      href={`/biblioteca/detalle/?slug=${document.slug || ""}`}
      className="relative isolate flex flex-col gap-4 overflow-hidden rounded-none border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:flex-row sm:items-center"
    >
      <div className="absolute inset-0 -z-10">
        {document.coverImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.1]"
            style={{ backgroundImage: `url('${apiAssetUrl(document.coverImage)}')` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${categoryGradient(document.category)} opacity-[0.06]`} />
        )}
      </div>

      <span className="flex shrink-0 items-center justify-center text-accent">
        <DocumentIcon type={document.resourceType} className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
          <span>{document.category}</span>
          <span className="text-muted/40">·</span>
          <span>{document.type}</span>
        </div>
        <h2 className="mt-1 font-serif text-lg font-semibold text-primary">
          <HighlightText text={document.title} query={query} />
        </h2>
        <p className="mt-1 line-clamp-1 text-sm text-muted">
          <HighlightText text={document.description} query={query} />
        </p>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-6 border-t border-primary/10 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <span className="text-xs text-muted">{document.date}</span>
        <div className="flex items-center gap-2 text-accent">
          {document.resourceType === "link" ? <ExternalLink className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </div>
      </div>
    </Link>
  );
}

function FilterChip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-none border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-primary/40"
    >
      {children}
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

function SearchCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = libraryCategories.includes(searchParams.get("categoria") as never)
    ? searchParams.get("categoria")!
    : "Todos";
  const initialType = resourceOptions.some(([value]) => value === searchParams.get("tipo"))
    ? searchParams.get("tipo")!
    : "Todos";
  const initialSort = ["recent", "oldest", "az"].includes(searchParams.get("orden") || "")
    ? searchParams.get("orden")!
    : "recent";
  const initialView = searchParams.get("vista") === "list" ? "list" : "grid";
  const initialPage = Math.max(1, Number(searchParams.get("pagina")) || 1);
  const initialQuery = searchParams.get("q") || "";

  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api
      .get<LibraryRecord[]>("/biblioteca")
      .then(data => setDocuments(data.map(toLibraryDocument)))
      .catch(err => setLoadError(err instanceof Error ? err.message : "No se pudo cargar la biblioteca"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
  }, []);

  const years = useMemo(
    () => [...new Set(documents.map(document => document.year))].sort((a, b) => b.localeCompare(a)),
    [documents],
  );

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return documents
      .filter(doc => words.every(word => doc.title.toLowerCase().includes(word)))
      .slice(0, 5);
  }, [query, documents]);

  function selectSuggestion(title: string) {
    setQuery(title);
    setShowSuggestions(false);
    
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setIsSearching(true);
    setShowResults(false);
    
    // Pequeño delay visual para simular la búsqueda
    setTimeout(() => {
      setAppliedQuery(title);
      setPage(1);
      setShowResults(true);
      setIsSearching(false);
      syncUrl({ query: title, page: 1 });
    }, 150);
  }

  const filtered = useMemo(() => {
    const matches = documents.filter(document =>
      matchesLibraryQuery(document, appliedQuery)
      && (category === "Todos" || document.category === category)
      && (resourceType === "Todos" || document.resourceType === resourceType)
      && (year === "Todos" || document.year === year),
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

  function syncUrl(overrides: Partial<{
    query: string;
    category: string;
    resourceType: string;
    year: string;
    sort: string;
    view: "grid" | "list";
    page: number;
  }>) {
    const next = {
      query: appliedQuery,
      category,
      resourceType,
      year,
      sort,
      view,
      page,
      ...overrides,
    };
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
    setQuery("");
    setAppliedQuery("");
    setCategory("Todos");
    setResourceType("Todos");
    setYear("Todos");
    setPage(1);
    syncUrl({ query: "", category: "Todos", resourceType: "Todos", year: "Todos", page: 1 });
  }

  function clearQuery() {
    setQuery("");
    setAppliedQuery("");
    setPage(1);
    syncUrl({ query: "", page: 1 });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const nextQuery = query.trim();

    setIsSearching(true);
    setShowResults(false);
    searchTimer.current = setTimeout(() => {
      setAppliedQuery(nextQuery);
      setPage(1);
      setShowResults(true);
      setIsSearching(false);
      syncUrl({ query: nextQuery, page: 1 });
    }, 220);
  }

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    setPage(1);
    syncUrl({ category: nextCategory, page: 1 });
  }

  function selectType(nextType: string) {
    setResourceType(nextType);
    setPage(1);
    syncUrl({ resourceType: nextType, page: 1 });
  }

  function selectYear(nextYear: string) {
    setYear(nextYear);
    setPage(1);
    syncUrl({ year: nextYear, page: 1 });
  }

  function selectSort(nextSort: string) {
    setSort(nextSort);
    setPage(1);
    syncUrl({ sort: nextSort, page: 1 });
  }

  function selectView(nextView: "grid" | "list") {
    setView(nextView);
    syncUrl({ view: nextView });
  }

  function selectPage(nextPage: number) {
    setPage(nextPage);
    syncUrl({ page: nextPage });
  }

  function returnToLibrary() {
    setIsLeaving(true);
    navigationTimer.current = setTimeout(() => router.push("/biblioteca"), 820);
  }

  return (
    <PublicLayout>
      <LibraryPageTransition active={isLeaving} />
      <main className="library-page-enter min-h-screen bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#182216] py-14 text-white">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/library-hero-v2.png')" }}
          />
          <div className="absolute inset-0 bg-[#182216]/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-[#182216]/25 to-[#182216]/75" />
          <div className="relative mx-auto max-w-7xl px-6">
            <button
              type="button"
              onClick={returnToLibrary}
              className="group mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Volver a Portada
            </button>
            <div className="mt-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f7decc]">Catálogo documental</span>
              <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">Biblioteca técnica</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85">
                Repositorio oficial de investigación, metodologías y estándares para el cultivo y procesamiento del café robusta.
              </p>
              <div 
                className="relative mx-auto mt-8 w-full max-w-4xl"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }
                }}
              >
                <form
                  onSubmit={submitSearch}
                  className="group flex min-h-16 items-center rounded-none border border-[#ead9c6] bg-[#fffaf1]/95 p-1.5 backdrop-blur-md transition-colors duration-300 focus-within:border-accent focus-within:bg-white"
                >
                  <span className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-accent/15 text-accent transition-colors group-focus-within:bg-accent/25">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={event => {
                      setQuery(event.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="min-w-0 flex-1 bg-transparent px-4 text-[15px] font-medium text-[#25160e] caret-[#a66f20] outline-none placeholder:font-normal placeholder:text-[#8d7c70]"
                    placeholder="Buscar documentos, manuales, investigaciones..."
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={clearQuery}
                      aria-label="Limpiar búsqueda"
                      className="my-auto mr-1 flex h-9 w-9 items-center justify-center rounded-none text-[#81756f] transition-colors hover:bg-accent/15 hover:text-[#25160e]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="flex min-h-12 min-w-28 items-center justify-center gap-2 rounded-none bg-primary px-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors duration-300 hover:bg-accent active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
                  >
                    {isSearching && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {isSearching ? "Buscando" : "Buscar"}
                  </button>
                </form>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-none border border-[#ead9c6] bg-white shadow-xl">
                    <ul className="py-1">
                      {suggestions.map(doc => (
                        <li key={doc.id}>
                          <button
                            type="button"
                            onClick={() => selectSuggestion(doc.title)}
                            className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/10 focus:bg-accent/10"
                          >
                            <Search className="h-4 w-4 text-muted/50 shrink-0" />
                            <span className="text-sm font-medium text-primary line-clamp-1">
                              <HighlightText text={doc.title} query={query} />
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {["Todos", ...libraryCategories].map(item => (
                  <button
                    key={item}
                    onClick={() => selectCategory(item)}
                    className={`rounded-none border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 ${category === item
                      ? "border-accent bg-accent text-primary-foreground"
                      : "border-white/30 bg-black/15 text-white/90 backdrop-blur-md hover:border-white/55 hover:bg-white/15"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <button
            type="button"
            onClick={() => setFiltersOpen(current => !current)}
            className="mb-5 flex w-full items-center justify-between rounded-none border border-border bg-card px-4 py-3 text-sm font-semibold lg:hidden"
          >
            <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filtros</span>
            <span className="text-xs text-muted">{filtersOpen ? "Ocultar" : "Mostrar"}</span>
          </button>

          <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
            <aside className={`${filtersOpen ? "block" : "hidden"} h-fit rounded-none border border-border bg-card p-5 lg:sticky lg:top-24 lg:block`}>
              <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                <h2 className="font-serif text-lg font-semibold text-primary">Filtros</h2>
                <button onClick={clearFilters} className="text-xs text-accent">Limpiar</button>
              </div>
              <fieldset className="mt-5 space-y-3">
                <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Tipo de documento</legend>
                {resourceOptions.map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-3 text-sm text-muted">
                    <input
                      type="radio"
                      name="resource-type"
                      checked={resourceType === value}
                      onChange={() => selectType(value)}
                      className="accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              <label className="mt-6 block border-t border-primary/10 pt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                Año de publicación
                <select
                  value={year}
                  onChange={event => selectYear(event.target.value)}
                  className="mt-3 w-full rounded-none border border-border bg-surface px-3 py-2 text-sm font-normal normal-case tracking-normal outline-none"
                >
                  <option value="Todos">Todos los años</option>
                  {years.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
            </aside>

            <div
              aria-busy={isSearching}
              className={`min-w-0 transition-all duration-300 motion-reduce:transform-none motion-reduce:transition-none ${showResults ? "translate-y-0 opacity-100" : "translate-y-2 opacity-30"
                }`}
            >
              <div className="flex flex-col gap-4 border-b border-primary/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  Mostrando <strong className="text-foreground">
                    {filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-{Math.min(currentPage * PAGE_SIZE, filtered.length)}
                  </strong> de {filtered.length} resultados
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-xs text-muted">
                    Ordenar por:
                    <select
                      value={sort}
                      onChange={event => selectSort(event.target.value)}
                      className="ml-2 rounded-none border border-border bg-card px-3 py-2 text-xs font-semibold outline-none"
                    >
                      <option value="recent">Más recientes</option>
                      <option value="oldest">Más antiguos</option>
                      <option value="az">A-Z</option>
                    </select>
                  </label>
                  <button onClick={() => selectView("grid")} aria-label="Vista de cuadrícula" className={view === "grid" ? "text-accent" : "text-muted/50"}>
                    <Grid2X2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => selectView("list")} aria-label="Vista de lista" className={view === "list" ? "text-accent" : "text-muted/50"}>
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs font-semibold text-muted">Filtros activos:</span>
                  {appliedQuery && <FilterChip onRemove={clearQuery}>“{appliedQuery}”</FilterChip>}
                  {category !== "Todos" && <FilterChip onRemove={() => selectCategory("Todos")}>{category}</FilterChip>}
                  {resourceType !== "Todos" && (
                    <FilterChip onRemove={() => selectType("Todos")}>
                      {resourceOptions.find(([value]) => value === resourceType)?.[1]}
                    </FilterChip>
                  )}
                  {year !== "Todos" && <FilterChip onRemove={() => selectYear("Todos")}>{year}</FilterChip>}
                  <button onClick={clearFilters} className="ml-1 text-xs font-semibold text-accent underline-offset-4 hover:underline">
                    Limpiar todos
                  </button>
                </div>
              )}

              {loading ? (
                <div className="py-24 text-center text-sm text-muted">Cargando catálogo...</div>
              ) : loadError ? (
                <EmptyState icon={<Library className="h-8 w-8" />} title="No se pudo cargar la biblioteca" description={loadError} />
              ) : visible.length === 0 ? (
                <EmptyState icon={<Search className="h-8 w-8" />} title="No encontramos resultados" description="Prueba con otras palabras o limpia los filtros." />
              ) : view === "grid" ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {visible.map(document => <ResultCard key={document.id} document={document} query={appliedQuery} />)}
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {visible.map(document => <ResultRow key={document.id} document={document} query={appliedQuery} />)}
                </div>
              )}

              {filtered.length > PAGE_SIZE && (
                <nav className="mt-10 flex justify-center gap-2" aria-label="Paginación">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => selectPage(Math.max(1, currentPage - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-none border border-border disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(item => (
                    <button
                      key={item}
                      onClick={() => selectPage(item)}
                      className={`h-9 min-w-9 rounded-none border px-2 text-xs font-semibold ${item === currentPage ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => selectPage(Math.min(totalPages, currentPage + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-none border border-border disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export default function BibliotecaBuscar() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbf9f5]" />}>
      <SearchCatalog />
    </Suspense>
  );
}

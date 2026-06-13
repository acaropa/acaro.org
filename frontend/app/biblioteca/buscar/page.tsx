"use client";

import { FormEvent, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
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
import { mockLibraryRecords } from "@/data/mock-documents";
import { api } from "@/lib/api";
import {
  LibraryDocument,
  LibraryRecord,
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
      <mark key={`${part}-${index}`} className="rounded-sm bg-[#f7decc] px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

function DocumentAction({ document }: { document: LibraryDocument }) {
  return (
    <div className="flex items-center gap-3 text-[#2a3b25] dark:text-accent">
      <a
        href={document.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ver documento"
        className="transition-opacity hover:opacity-70"
      >
        {document.resourceType === "link" ? (
          <ExternalLink className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </a>
      {document.resourceType !== "link" && (
        <a
          href={document.link}
          download
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Descargar documento"
          className="transition-opacity hover:opacity-70"
        >
          <Download className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function ResultCard({ document, query }: { document: LibraryDocument; query: string }) {
  const getBadgeStyle = (category: string) => {
    if (category === "Estándares OBC" || category === "Sostenibilidad") {
      return "bg-[#eef3f0] text-[#426a50]";
    }
    if (category === "Mercados" || category === "Procesamiento") {
      return "border border-[#d7a24a] text-[#b88022] bg-transparent";
    }
    return "bg-[#fdf4ed] text-[#b46830]";
  };

  const simulatedSize = (document.id % 15 + 1.2).toFixed(1);

  return (
    <article className="flex min-h-[260px] flex-col rounded-xl border border-[#f0ebe1] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-border dark:bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center text-[#1a1a1a] dark:text-foreground">
          <DocumentIcon type={document.resourceType} className="h-6 w-6" />
        </div>
        <span className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${getBadgeStyle(document.category)}`}>
          {document.category}
        </span>
      </div>

      <h2 className="mt-5 font-sans text-[17px] font-semibold leading-snug tracking-tight text-[#1a1a1a] dark:text-foreground">
        <HighlightText text={document.title} query={query} />
      </h2>

      <p className="mt-2.5 line-clamp-3 text-[13px] leading-[1.6] text-[#666666] dark:text-muted">
        <HighlightText text={document.description} query={query} />
      </p>

      <div className="mt-auto flex items-end justify-between pt-6">
        <div className="flex flex-col gap-0.5 text-[11px] font-medium text-[#888888] dark:text-muted/80">
          <span>{document.date}</span>
          <span className="uppercase">
            {document.resourceType} • {simulatedSize} MB
          </span>
        </div>
        <DocumentAction document={document} />
      </div>
    </article>
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
    <article className="flex flex-col gap-4 rounded-lg border border-[#ded6cc] bg-white p-5 transition hover:border-[#b8a99d] sm:flex-row sm:items-center dark:border-border dark:bg-card">
      <span className="flex shrink-0 items-center justify-center text-[#705a4f]">
        <DocumentIcon type={document.resourceType} className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#705a4f]">
          <span>{document.category}</span>
          <span className="text-[#c4b8ae]">·</span>
          <span>{document.type}</span>
        </div>
        <h2 className="mt-1 font-serif text-lg font-bold text-[#25160e] dark:text-foreground">
          <HighlightText text={document.title} query={query} />
        </h2>
        <p className="mt-1 line-clamp-1 text-sm text-[#6d5b4d] dark:text-muted">
          <HighlightText text={document.description} query={query} />
        </p>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-6 border-t border-[#eee7df] pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 dark:border-border">
        <span className="text-xs text-[#81756f]">{document.date}</span>
        <DocumentAction document={document} />
      </div>
    </article>
  );
}

function FilterChip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#d3c3bd] bg-white px-3 py-1.5 text-xs font-semibold text-[#5f514a] transition hover:border-[#81756f] dark:border-border dark:bg-card dark:text-muted"
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
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api
      .get<LibraryRecord[]>("/biblioteca")
      .then(data => setDocuments((data.length ? data : mockLibraryRecords).map(toLibraryDocument)))
      .catch(() => {
        setDocuments(mockLibraryRecords.map(toLibraryDocument));
        setLoadError("");
      })
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
      <main className="library-page-enter min-h-screen bg-[#fbf9f5] text-[#25160e] dark:bg-background dark:text-foreground">
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
              className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/20 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-white/85 shadow-sm backdrop-blur transition hover:border-white/40 hover:bg-black/30 hover:text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#243120] transition-transform group-hover:-translate-x-0.5">
                <ArrowLeft className="h-3.5 w-3.5" />
              </span>
              Portada de biblioteca
            </button>
            <div className="mt-7 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f7decc]">Catálogo documental</span>
              <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">Biblioteca técnica</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85">
                Repositorio oficial de investigación, metodologías y estándares para el cultivo y procesamiento del café robusta.
              </p>
              <form
                onSubmit={submitSearch}
                className="group mx-auto mt-8 flex min-h-16 max-w-4xl items-center rounded-xl border border-[#ead9c6] bg-[#fffaf1]/95 p-1.5 shadow-[0_18px_55px_rgba(13,24,12,0.28)] backdrop-blur-md transition-all duration-300 focus-within:border-[#d3a75f] focus-within:bg-white focus-within:shadow-[0_22px_65px_rgba(13,24,12,0.38),0_0_0_3px_rgba(211,167,95,0.16)]"
              >
                <span className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f1e5d6] text-[#8a5c25] transition-colors group-focus-within:bg-[#ead7bd] group-focus-within:text-[#5f3a18]">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-4 text-[15px] font-medium text-[#25160e] caret-[#a66f20] outline-none placeholder:font-normal placeholder:text-[#8d7c70]"
                  placeholder="Buscar documentos, manuales, investigaciones..."
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    aria-label="Limpiar búsqueda"
                    className="my-auto mr-1 flex h-9 w-9 items-center justify-center rounded-full text-[#81756f] transition-colors hover:bg-[#f1e5d6] hover:text-[#25160e]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex min-h-12 min-w-28 items-center justify-center gap-2 rounded-lg bg-[#243120] px-6 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#34452f] hover:shadow-[0_8px_24px_rgba(36,49,32,0.24)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
                >
                  {isSearching && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {isSearching ? "Buscando" : "Buscar"}
                </button>
              </form>
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {["Todos", ...libraryCategories].map(item => (
                  <button
                    key={item}
                    onClick={() => selectCategory(item)}
                    className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 ${category === item
                      ? "border-[#fffaf1] bg-[#fffaf1] text-[#243120] shadow-[0_6px_18px_rgba(0,0,0,0.16)]"
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
            className="mb-5 flex w-full items-center justify-between rounded-lg border border-[#ded6cc] bg-white px-4 py-3 text-sm font-semibold lg:hidden dark:border-border dark:bg-card"
          >
            <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filtros</span>
            <span className="text-xs text-[#81756f]">{filtersOpen ? "Ocultar" : "Mostrar"}</span>
          </button>

          <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
            <aside className={`${filtersOpen ? "block" : "hidden"} h-fit rounded-lg border border-[#ded6cc] bg-white p-5 dark:border-border dark:bg-card lg:sticky lg:top-24 lg:block`}>
              <div className="flex items-center justify-between border-b border-[#eee7df] pb-4 dark:border-border">
                <h2 className="font-serif text-lg font-bold">Filtros</h2>
                <button onClick={clearFilters} className="text-xs text-[#705a4f] dark:text-accent">Limpiar</button>
              </div>
              <fieldset className="mt-5 space-y-3">
                <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em]">Tipo de documento</legend>
                {resourceOptions.map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-3 text-sm text-[#5f514a] dark:text-muted">
                    <input
                      type="radio"
                      name="resource-type"
                      checked={resourceType === value}
                      onChange={() => selectType(value)}
                      className="accent-[#243120]"
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              <label className="mt-6 block border-t border-[#eee7df] pt-5 text-[10px] font-bold uppercase tracking-[0.14em] dark:border-border">
                Año de publicación
                <select
                  value={year}
                  onChange={event => selectYear(event.target.value)}
                  className="mt-3 w-full rounded-md border border-[#ded6cc] bg-[#fbf9f5] px-3 py-2 text-sm font-normal normal-case tracking-normal outline-none dark:border-border dark:bg-surface"
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
              <div className="flex flex-col gap-4 border-b border-[#e3ddd5] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#6d5b4d] dark:text-muted">
                  Mostrando <strong className="text-[#25160e] dark:text-foreground">
                    {filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-{Math.min(currentPage * PAGE_SIZE, filtered.length)}
                  </strong> de {filtered.length} resultados
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-xs text-[#6d5b4d] dark:text-muted">
                    Ordenar por:
                    <select
                      value={sort}
                      onChange={event => selectSort(event.target.value)}
                      className="ml-2 border border-[#ded6cc] bg-white px-3 py-2 text-xs font-semibold outline-none dark:border-border dark:bg-card"
                    >
                      <option value="recent">Más recientes</option>
                      <option value="oldest">Más antiguos</option>
                      <option value="az">A-Z</option>
                    </select>
                  </label>
                  <button onClick={() => selectView("grid")} aria-label="Vista de cuadrícula" className={view === "grid" ? "text-[#243120] dark:text-accent" : "text-[#a79a91]"}>
                    <Grid2X2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => selectView("list")} aria-label="Vista de lista" className={view === "list" ? "text-[#243120] dark:text-accent" : "text-[#a79a91]"}>
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs font-semibold text-[#81756f]">Filtros activos:</span>
                  {appliedQuery && <FilterChip onRemove={clearQuery}>“{appliedQuery}”</FilterChip>}
                  {category !== "Todos" && <FilterChip onRemove={() => selectCategory("Todos")}>{category}</FilterChip>}
                  {resourceType !== "Todos" && (
                    <FilterChip onRemove={() => selectType("Todos")}>
                      {resourceOptions.find(([value]) => value === resourceType)?.[1]}
                    </FilterChip>
                  )}
                  {year !== "Todos" && <FilterChip onRemove={() => selectYear("Todos")}>{year}</FilterChip>}
                  <button onClick={clearFilters} className="ml-1 text-xs font-semibold text-[#705a4f] underline-offset-4 hover:underline">
                    Limpiar todos
                  </button>
                </div>
              )}

              {loading ? (
                <div className="py-24 text-center text-sm text-[#81756f]">Cargando catálogo...</div>
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
                    className="flex h-9 w-9 items-center justify-center rounded border border-[#ded6cc] disabled:opacity-40 dark:border-border"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(item => (
                    <button
                      key={item}
                      onClick={() => selectPage(item)}
                      className={`h-9 min-w-9 rounded border px-2 text-xs font-semibold ${item === currentPage ? "border-[#243120] bg-[#243120] text-white" : "border-[#ded6cc] dark:border-border"
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => selectPage(Math.min(totalPages, currentPage + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded border border-[#ded6cc] disabled:opacity-40 dark:border-border"
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

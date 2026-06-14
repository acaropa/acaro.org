"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Leaf,
  Library,
  PlayCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/landing/LandingMotion";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, apiAssetUrl } from "@/lib/api";
import {
  LibraryDocument,
  LibraryRecord,
  categoryGradient,
  libraryCategories,
  toLibraryDocument,
} from "@/lib/library";

function ResourceIcon({
  document,
  className = "h-5 w-5",
}: {
  document: LibraryDocument;
  className?: string;
}) {
  const Icon =
    document.resourceType === "link"
      ? ExternalLink
      : document.resourceType === "video"
        ? PlayCircle
        : FileText;
  return <Icon className={className} />;
}

function MainFeature({ document }: { document: LibraryDocument }) {
  return (
    <ScrollReveal delay={100} distance="sm" className="md:col-span-8">
    <Link
      href={`/biblioteca/detalle/?slug=${document.slug || ""}`}
      className="group relative flex min-h-[410px] h-full w-full overflow-hidden rounded-lg bg-[#21130d] shadow-sm"
    >
      {document.coverImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${apiAssetUrl(document.coverImage)}')` }}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient(document.category)} transition-transform duration-700 group-hover:scale-105`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-[#2b1710]/45 to-black/5" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <span className="inline-flex rounded bg-[#3d4b37]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
          {document.category}
        </span>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
          {document.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90">
          {document.description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-white/75">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" /> {document.date}
          </span>
          <span>{document.contributor}</span>
        </div>
      </div>
    </Link>
    </ScrollReveal>
  );
}

function SecondaryFeature({ document }: { document: LibraryDocument }) {
  return (
    <ScrollReveal delay={200} distance="sm" className="md:col-span-4">
    <Link
      href={`/biblioteca/detalle/?slug=${document.slug || ""}`}
      className="group flex min-h-[410px] h-full w-full flex-col overflow-hidden rounded-lg border border-[#ded6cc] bg-white shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card"
    >
      <div className="relative h-44 overflow-hidden">
        {document.coverImage ? (
          <div
            className="absolute inset-0 bg-cover bg-[center_58%] transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${apiAssetUrl(document.coverImage)}')` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient(document.category)} transition-transform duration-700 group-hover:scale-105`} />
        )}
        <div className="absolute inset-0 bg-[#25160e]/30" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#705a4f]">
          {document.category}
        </span>
        <h3 className="mt-2 font-serif text-2xl font-bold leading-tight text-[#25160e] dark:text-foreground">
          {document.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5f514a] dark:text-muted">
          {document.description}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-[#e5ddd4] pt-4 text-xs text-[#81756f] dark:border-border">
          <span>Por {document.contributor}</span>
          <ArrowRight className="h-5 w-5 text-[#25160e] transition-transform group-hover:translate-x-1 dark:text-accent" />
        </div>
      </div>
    </Link>
    </ScrollReveal>
  );
}

function TechnicalRow({ document, index }: { document: LibraryDocument, index: number }) {
  return (
    <ScrollReveal delay={100 * index} distance="sm">
    <Link
      href={`/biblioteca/detalle/?slug=${document.slug || ""}`}
      className="group flex items-center gap-4 border-b border-[#e7dfd6] p-4 last:border-0 hover:bg-[#faf7f2] dark:border-border dark:hover:bg-surface w-full"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[#f7decc] text-[#705a4f] dark:bg-accent/15 dark:text-accent">
        <ResourceIcon document={document} />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-[#25160e] dark:text-foreground">{document.title}</h4>
        <p className="mt-1 text-xs text-[#81756f] dark:text-muted">
          {document.type} · {document.date}
        </p>
      </div>
      {document.resourceType === "link" ? (
        <ExternalLink className="h-4 w-4 text-[#25160e] dark:text-accent" />
      ) : (
        <Download className="h-4 w-4 text-[#25160e] dark:text-accent" />
      )}
    </Link>
    </ScrollReveal>
  );
}

export default function Biblioteca() {
  const router = useRouter();
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState<"recent" | "az">("recent");

  useEffect(() => {
    api
      .get<LibraryRecord[]>("/biblioteca")
      .then(data => setDocuments(data.map(toLibraryDocument)))
      .catch(err => setLoadError(err instanceof Error ? err.message : "No se pudo cargar la biblioteca"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const matches = category === "Todos"
      ? documents
      : documents.filter(document => document.category === category);
    return [...matches].sort((a, b) =>
      sort === "az" ? a.title.localeCompare(b.title, "es") : b.dateValue.localeCompare(a.dateValue),
    );
  }, [category, documents, sort]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/biblioteca/buscar${params.size ? `?${params}` : ""}`);
  }

  const primary = visible[0];
  const secondary = visible[1];
  const recent = visible.slice(2, 5);

  return (
    <PublicLayout>
      <div className="-mt-18">
      <header className="relative isolate min-h-[560px] overflow-hidden bg-[#25160e] md:min-h-[620px]">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center blur-[1px]"
          style={{ backgroundImage: "url('/assets/library-hero-v2.png')" }}
        />
        <div className="absolute inset-0 bg-[#182216]/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/60" />
        <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col items-center justify-center px-6 pt-18 text-center md:min-h-[620px]">
          <ScrollReveal delay={0} distance="md" className="flex flex-col items-center">

            <h1 className="mt-5 max-w-4xl font-serif text-4xl font-bold text-white drop-shadow md:text-6xl">
              El legado del café robusta
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/90 md:text-base">
              Explora nuestra biblioteca técnica, un viaje editorial por la ciencia, sostenibilidad
              e historia del cultivo de café robusta.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200} distance="sm" className="w-full flex justify-center">
            <form onSubmit={submitSearch} className="mt-8 flex w-full max-w-xl rounded-lg bg-white p-1.5 shadow-xl">
              <Search className="ml-3 mt-3 h-5 w-5 shrink-0 text-[#81756f]" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#25160e] outline-none"
                placeholder="Buscar documentos, manuales, investigaciones..."
                aria-label="Buscar en la biblioteca"
              />
              <button className="rounded-md bg-[#243120] px-5 py-3 text-sm font-semibold text-white hover:bg-[#34452f]">
                Buscar
              </button>
            </form>
          </ScrollReveal>
        </div>
      </header>

      <main className="bg-[#fbf9f5] py-10 text-[#1b1c1a] dark:bg-background dark:text-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-5 border-b border-[#e3ddd5] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {["Todos", ...libraryCategories].map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold transition-colors ${
                    category === item
                      ? "border-[#243120] bg-[#243120] text-white"
                      : "border-[#ded6cc] bg-white text-[#25160e] hover:border-[#81756f] dark:border-border dark:bg-card dark:text-foreground"
                  }`}
                >
                  {item === "Agronomía" && <Leaf className="h-3.5 w-3.5" />}
                  {item}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSort(current => (current === "recent" ? "az" : "recent"))}
              className="flex shrink-0 items-center gap-2 text-xs text-[#5f514a] dark:text-muted"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Ordenar: {sort === "recent" ? "más recientes" : "A-Z"}
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-sm text-[#81756f]">Cargando biblioteca...</div>
          ) : loadError ? (
            <EmptyState
              icon={<Library className="h-8 w-8" />}
              title="No se pudo cargar la biblioteca"
              description={loadError}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<Search className="h-8 w-8" />}
              title="No hay recursos en esta sección"
              description="Prueba con otra categoría o consulta el catálogo completo."
            />
          ) : (
            <>
              <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
                {primary && <MainFeature document={primary} />}
                {secondary && <SecondaryFeature document={secondary} />}
              </section>

              {recent.length > 0 && (
                <section className="mt-12">
                  <div className="mb-4 flex items-end justify-between border-b border-[#e3ddd5] pb-3">
                    <h2 className="font-serif text-2xl font-bold">Especificaciones técnicas recientes</h2>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-[#e3ddd5] bg-white dark:border-border dark:bg-card">
                    {recent.map((document, index) => <TechnicalRow key={document.id} document={document} index={index} />)}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Link
                      href="/biblioteca/buscar"
                      className="group inline-flex items-center gap-2 rounded-md bg-[#243120] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#34452f]"
                    >
                      Explorar catálogo completo
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      </div>
    </PublicLayout>
  );
}

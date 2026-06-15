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
      className="group relative flex min-h-[410px] h-full w-full overflow-hidden rounded-none bg-[#21130d]"
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
        <span className="inline-flex bg-accent px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] leading-none text-primary-foreground">
          {document.category}
        </span>
        <h2 className="mt-4 max-w-3xl font-serif text-[32px] font-semibold leading-[1.2] text-[#fdf9f4] sm:text-[40px]">
          {document.title}
        </h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-[#fdf9f4]/80">
          {document.description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-[#fdf9f4]/70">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" /> {document.date}
          </span>
          <span>Subido por {document.contributor}</span>
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
      className="group flex min-h-[410px] h-full w-full flex-col overflow-hidden rounded-none border border-border bg-card transition-colors hover:border-primary/30"
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
        <span className="text-[12px] font-semibold uppercase tracking-[0.1em] leading-none text-accent">
          {document.category}
        </span>
        <h3 className="mt-3 font-serif text-[24px] font-semibold leading-[1.3] text-primary">
          {document.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[16px] leading-[1.6] text-muted">
          {document.description}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-primary/10 pt-4 text-xs text-muted">
          <span>Subido por {document.contributor}</span>
          <ArrowRight className="h-5 w-5 text-accent transition-transform group-hover:translate-x-1" />
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
      className="group flex items-center gap-4 border-b border-primary/10 p-4 last:border-0 hover:bg-surface w-full"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-accent/10 text-accent">
        <ResourceIcon document={document} />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-primary">{document.title}</h4>
        <p className="mt-1 text-xs text-muted">
          {document.type} · {document.date}
        </p>
      </div>
      {document.resourceType === "link" ? (
        <ExternalLink className="h-4 w-4 text-accent" />
      ) : (
        <Download className="h-4 w-4 text-accent" />
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
            <form onSubmit={submitSearch} className="mt-8 flex w-full max-w-xl rounded-none bg-white p-1.5">
              <Search className="ml-3 mt-3 h-5 w-5 shrink-0 text-[#81756f]" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#25160e] outline-none"
                placeholder="Buscar documentos, manuales, investigaciones..."
                aria-label="Buscar en la biblioteca"
              />
              <button className="rounded-none bg-primary px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-accent">
                Buscar
              </button>
            </form>
          </ScrollReveal>
        </div>
      </header>

      <main className="bg-background py-10 text-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-5 border-b border-primary/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {["Todos", ...libraryCategories].map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`inline-flex items-center gap-2 rounded-none border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                    category === item
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40"
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
              className="flex shrink-0 items-center gap-2 text-xs text-muted"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Ordenar: {sort === "recent" ? "más recientes" : "A-Z"}
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-sm text-muted">Cargando biblioteca...</div>
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
                  <div className="mb-4 flex items-end justify-between border-b border-primary/10 pb-3">
                    <h2 className="font-serif text-[24px] font-semibold leading-[1.3] text-primary">Especificaciones técnicas recientes</h2>
                  </div>
                  <div className="overflow-hidden rounded-none border border-border bg-card">
                    {recent.map((document, index) => <TechnicalRow key={document.id} document={document} index={index} />)}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Link
                      href="/biblioteca/buscar"
                      className="group inline-flex items-center gap-2 rounded-none bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-accent"
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

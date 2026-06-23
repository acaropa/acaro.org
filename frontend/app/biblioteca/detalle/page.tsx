"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, ChevronRight, ExternalLink, FileText, Tag } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, apiAssetUrl } from "@/lib/api";
import { LibraryDocument, LibraryRecord, toLibraryDocument } from "@/lib/library";

function DocumentDetail() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";

  const [document, setDocument] = useState<LibraryDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serieDocuments, setSerieDocuments] = useState<LibraryDocument[]>([]);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    api
      .get<LibraryRecord>(`/biblioteca/slug/${slug}`)
      .then(record => setDocument(toLibraryDocument(record)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!document?.serie) { setSerieDocuments([]); return; }
    api
      .get<LibraryRecord[]>(`/biblioteca/serie/${encodeURIComponent(document.serie)}`)
      .then(records => setSerieDocuments(records.map(toLibraryDocument)))
      .catch(() => setSerieDocuments([]));
  }, [document?.serie]);

  const fileHref = document ? apiAssetUrl(document.link) : "";
  const isPdf = document?.resourceType === "pdf";

  return (
    <PublicLayout>
      <main className="min-h-screen bg-[#fbf9f5] py-14 text-[#25160e] dark:bg-background dark:text-foreground">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/biblioteca/buscar"
            className="group mb-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#705a4f] transition-colors hover:text-[#25160e] dark:text-muted dark:hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver a la biblioteca
          </Link>

          {loading ? (
            <div className="py-24 text-center text-sm text-[#81756f]">Cargando documento...</div>
          ) : notFound || !document ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="Documento no encontrado"
              description="Es posible que este recurso ya no esté disponible o haya sido retirado."
            />
          ) : (
            <div>
              <article>
                <span className="inline-flex rounded bg-[#f7decc] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#705a4f] dark:bg-accent/15 dark:text-accent">
                  {document.category}
                </span>
                <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#25160e] sm:text-4xl dark:text-foreground">
                  {document.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#81756f] dark:text-muted">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" /> {document.date}
                  </span>
                  <span>Subido por {document.contributor}</span>
                  <span className="uppercase">{document.type}</span>
                </div>

                <p className="mt-6 max-w-2xl text-justify text-[15px] leading-7 text-[#5f514a] [hyphens:auto] dark:text-muted">
                  {document.description}
                </p>

                {document.tags?.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-[#81756f] dark:text-muted" />
                    {document.tags.map(tag => (
                      <Link
                        key={tag}
                        href={`/biblioteca/buscar?q=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center rounded-full border border-[#ded6cc] bg-[#f7f3ee] px-3 py-1 text-[11px] font-semibold text-[#705a4f] transition-colors hover:border-[#c4a882] hover:bg-[#f0e8dd] dark:border-border dark:bg-surface dark:text-muted dark:hover:border-accent/40"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}

                {document.serie && serieDocuments.length > 1 && (
                  <div className="mt-8 rounded-lg border border-[#ded6cc] bg-[#faf7f3] p-6 dark:border-border dark:bg-card">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#705a4f] dark:text-muted">
                      📖 Serie: {document.serie}
                    </h3>
                    <p className="mt-1 text-[13px] text-[#81756f] dark:text-muted">
                      Este documento {document.ordenLectura ? `es el paso ${document.ordenLectura}` : 'pertenece a esta serie'}. Sigue los pasos en orden para completar el curso.
                    </p>
                    <ol className="mt-4 space-y-2">
                      {serieDocuments.map((doc, index) => {
                        const isCurrent = doc.slug === document.slug;
                        return (
                          <li key={doc.id}>
                            {isCurrent ? (
                              <span className="flex items-center gap-3 rounded-md bg-[#243120]/10 px-4 py-3 text-sm font-semibold text-[#243120] dark:bg-primary/10 dark:text-primary">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#243120] text-[11px] font-bold text-white dark:bg-primary">
                                  {doc.ordenLectura || index + 1}
                                </span>
                                {doc.title}
                                <span className="ml-auto text-[10px] uppercase tracking-widest opacity-60">Estás aquí</span>
                              </span>
                            ) : (
                              <Link
                                href={`/biblioteca/detalle/?slug=${doc.slug}`}
                                className="group flex items-center gap-3 rounded-md px-4 py-3 text-sm text-[#5f514a] transition-colors hover:bg-[#f0e8dd] dark:text-muted dark:hover:bg-surface"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#ded6cc] text-[11px] font-bold text-[#81756f] dark:border-border dark:text-muted">
                                  {doc.ordenLectura || index + 1}
                                </span>
                                {doc.title}
                                <ChevronRight className="ml-auto h-4 w-4 text-[#c4a882] opacity-0 transition-opacity group-hover:opacity-100" />
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}

                {document.resourceType === "link" && (
                <div className="mt-8">
                  <a
                    href={fileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-[#243120] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#34452f]"
                  >
                    <ExternalLink className="h-4 w-4" /> Abrir enlace
                  </a>
                </div>
                )}

                {isPdf && fileHref && (
                  <div className="mt-10 overflow-hidden rounded-lg border border-[#ded6cc] dark:border-border">
                    <iframe
                      src={`${fileHref}#view=FitH`}
                      title={document.title}
                      className="h-[75vh] min-h-[640px] w-full bg-white"
                    />
                  </div>
                )}
              </article>
            </div>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}

export default function BibliotecaDetalle() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbf9f5]" />}>
      <DocumentDetail />
    </Suspense>
  );
}

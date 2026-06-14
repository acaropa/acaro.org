"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Download, ExternalLink, FileText } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/landing/LandingMotion";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, apiAssetUrl } from "@/lib/api";
import { LibraryDocument, LibraryRecord, toLibraryDocument } from "@/lib/library";

function DocumentDetail() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";

  const [document, setDocument] = useState<LibraryDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
            <ScrollReveal delay={0} distance="md">
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
                  <span>Por {document.contributor}</span>
                  <span className="uppercase">{document.type}</span>
                </div>

                <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#5f514a] dark:text-muted">
                  {document.description}
                </p>

                <div className="mt-8">
                  <a
                    href={fileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={document.resourceType !== "link"}
                    className="inline-flex items-center gap-2 rounded-md bg-[#243120] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#34452f]"
                  >
                    {document.resourceType === "link" ? (
                      <>
                        <ExternalLink className="h-4 w-4" /> Abrir enlace
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" /> Descargar documento
                      </>
                    )}
                  </a>
                </div>

                {isPdf && fileHref && (
                  <div className="mt-10 overflow-hidden rounded-lg border border-[#ded6cc] dark:border-border">
                    <iframe src={fileHref} title={document.title} className="h-[640px] w-full" />
                  </div>
                )}
              </article>
            </ScrollReveal>
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

"use client";

import { FocusEvent, FormEvent, ReactNode } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { TypingIndicator } from "@/components/ui/TypingIndicator";

type Topic = {
  label: string;
  active?: boolean;
  onClick: () => void;
};

export function LibrarySearchHero({
  query,
  onQueryChange,
  onSubmit,
  onClear,
  isSearching = false,
  topics = [],
  suggestions,
  onBlur,
  onFocus,
  backLabel,
  onBack,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClear?: () => void;
  isSearching?: boolean;
  topics?: Topic[];
  suggestions?: ReactNode;
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
  onFocus?: () => void;
  backLabel?: string;
  onBack?: () => void;
}) {
  return (
    <header
      style={{ viewTransitionName: "library-search-hero" }}
      className="relative isolate min-h-[560px] overflow-hidden bg-[#faf9f5] text-[#271310] md:min-h-[620px]"
    >
      <OptimizedImage
        src="/assets/landing-hero-main.jpg"
        alt=""
        aria-hidden="true"
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.16]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf9f5]/10 via-[#faf9f5]/68 to-[#faf9f5]" />

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8 md:min-h-[620px] lg:px-10">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-5 top-6 inline-flex items-center gap-2 text-sm font-semibold text-[#504442] transition-colors hover:text-[#271310] sm:left-8 lg:left-10"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel || "Volver"}
          </button>
        )}

        <div className="w-full max-w-4xl">
          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight text-[#271310] md:text-6xl">
            Explora la biblioteca de ACARO OBC
          </h1>

          <div className="relative mx-auto mt-9 w-full max-w-3xl" onBlur={onBlur}>
            <form onSubmit={onSubmit}>
              <div className="flex items-center border-b-2 border-[#271310] bg-[#faf9f5]/55 px-2 py-4 backdrop-blur-sm">
                <Search className="mr-4 h-7 w-7 shrink-0 text-[#271310]" />
                <input
                  value={query}
                  onChange={event => onQueryChange(event.target.value)}
                  onFocus={onFocus}
                  className="h-12 min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-[#271310] outline-none ring-0 placeholder:text-[#827472] focus:ring-0 md:text-lg"
                  placeholder="Buscar documentos, guías técnicas, archivos..."
                  aria-label="Buscar en la biblioteca"
                />
                {query && onClear && (
                  <button
                    type="button"
                    onClick={onClear}
                    aria-label="Limpiar búsqueda"
                    className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center text-[#827472] transition-colors hover:text-[#271310]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex h-11 shrink-0 items-center gap-2 bg-[#271310] px-5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#3e2723] disabled:cursor-wait disabled:opacity-70"
                >
                  {isSearching && <TypingIndicator compact tone="light" label="Buscando documentos" />}
                  Buscar
                </button>
              </div>
            </form>

            {suggestions}
          </div>

          {topics.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#3d2a00]/60">
                Temas sugeridos:
              </span>
              {topics.map(topic => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={topic.onClick}
                  className={`text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                    topic.active ? "text-[#271310]" : "text-[#b38f4a] hover:text-[#271310]"
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

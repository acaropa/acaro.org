"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    contentRef.current?.scrollTo({ top: 0 });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={event => {
        if (event.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "w-full overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_70px_rgba(43,23,16,0.22)]",
          maxWidth,
        )}
      >
        <header className="flex min-h-16 items-center justify-between border-b border-border bg-card px-6 py-4">
          <h2 id={titleId} className="pr-6 text-lg font-bold leading-6 text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <AppIcon name="close" className="text-[19px]" />
          </button>
        </header>

        <div ref={contentRef} className="max-h-[calc(100vh-7rem)] overflow-y-auto bg-card p-6">
          {children}
        </div>
      </section>
    </div>
  );

  return createPortal(modalContent, document.body);
}

interface ModalActionsProps {
  cancelLabel?: string;
  className?: string;
  disabled?: boolean;
  onCancel: () => void;
  pending?: boolean;
  pendingLabel?: string;
  submitLabel: string;
}

export function ModalActions({
  cancelLabel = "Cancelar",
  className,
  disabled = false,
  onCancel,
  pending = false,
  pendingLabel = "Guardando...",
  submitLabel,
}: ModalActionsProps) {
  return (
    <div className={cn("sticky bottom-[-24px] z-20 -mx-6 -mb-6 mt-2 grid grid-cols-2 gap-3 border-t border-border bg-card/95 px-6 py-4 backdrop-blur-sm md:col-span-full sm:flex sm:justify-end", className)}>
      <button type="button" onClick={onCancel} className="h-11 border border-border bg-background px-5 text-xs font-bold text-foreground transition-colors hover:bg-surface">
        {cancelLabel}
      </button>
      <button type="submit" disabled={disabled || pending} className="flex h-11 min-w-44 items-center justify-center gap-2 bg-primary px-6 text-xs font-bold text-primary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">
        <Save className="h-4 w-4" aria-hidden="true" />
        {pending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}
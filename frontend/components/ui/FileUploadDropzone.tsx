"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";

import { cn } from "@/lib/utils";

type FileUploadDropzoneProps = {
  accept?: string;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
  existingUrl?: string | null;
  fileName?: string | null;
  helperText?: string;
  label?: string;
  maxSizeMb?: number;
  name?: string;
  onClear?: () => void;
  onFileSelect?: (file: File) => void;
  required?: boolean;
  showPreview?: boolean;
};

function acceptsFile(file: File, accept: string) {
  const rules = accept.split(",").map(rule => rule.trim().toLowerCase()).filter(Boolean);
  if (!rules.length) return true;

  return rules.some(rule => {
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    return file.type.toLowerCase() === rule;
  });
}

function formatAccept(accept: string) {
  const extensions = accept
    .split(",")
    .map(item => item.trim())
    .filter(item => item.startsWith("."))
    .map(item => item.slice(1).toUpperCase());

  if (accept.includes("image/")) {
    return "JPG, PNG, WEBP o GIF";
  }

  return extensions.length ? extensions.join(", ") : "Archivos permitidos";
}

export function FileUploadDropzone({
  accept = "image/jpeg,image/png,image/webp,image/gif",
  className,
  compact = false,
  disabled = false,
  existingUrl,
  fileName,
  helperText,
  label,
  maxSizeMb = 4,
  name = "file",
  onClear,
  onFileSelect,
  required = false,
  showPreview = true,
}: FileUploadDropzoneProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function selectFile(file: File) {
    setError("");

    if (!acceptsFile(file, accept)) {
      setError("El formato del archivo no está permitido.");
      return false;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError("El archivo supera el límite de " + maxSizeMb + " MB.");
      return false;
    }

    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setLocalFile(file);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    onFileSelect?.(file);
    return true;
  }

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && !selectFile(file)) event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    if (!file || !selectFile(file)) return;

    if (inputRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      inputRef.current.files = transfer.files;
    }
  }

  function clear() {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setLocalFile(null);
    setPreviewUrl(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  const currentName = fileName || localFile?.name || existingUrl?.split("/").pop() || null;
  const imagePreview = showPreview && (previewUrl || existingUrl || null);

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-widest text-muted">
          {label}
        </label>
      )}

      <label
        htmlFor={id}
        onDragEnter={() => !disabled && setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={event => event.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center border border-dashed px-5 text-center transition-colors",
          compact ? "min-h-28 py-4" : "min-h-36 py-6",
          dragging
            ? "border-coffee bg-coffee/5 text-coffee"
            : "border-border bg-background text-foreground hover:border-coffee/60 hover:bg-surface",
          disabled && "cursor-not-allowed opacity-55",
        )}
      >
        <CloudUpload className={cn("text-coffee", compact ? "mb-2 h-6 w-6" : "mb-3 h-8 w-8")} strokeWidth={1.7} aria-hidden="true" />
        <p className="text-sm text-foreground">
          <span className="font-semibold">Selecciona un archivo</span>
          <span className="text-muted"> o arrástralo aquí</span>
        </p>
        <p className="mt-1.5 text-xs text-muted">
          {formatAccept(accept)} · máximo {maxSizeMb} MB
        </p>
      </label>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required && !existingUrl}
        disabled={disabled}
        onChange={handleInput}
        className="sr-only"
      />

      {currentName && (
        <div className="flex min-w-0 items-center gap-3 border border-border bg-card p-2.5">
          {imagePreview ? (
            <span
              className="h-14 w-14 shrink-0 bg-surface bg-cover bg-center"
              style={{ backgroundImage: "url('" + imagePreview + "')" }}
              aria-label="Vista previa del archivo"
              role="img"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-surface text-coffee">
              <FileText className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">{currentName}</span>
          {(localFile || onClear) && (
            <button
              type="button"
              onClick={clear}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-muted transition-colors hover:bg-red-50 hover:text-red-700"
              aria-label="Quitar archivo"
              title="Quitar archivo"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {helperText && <p className="text-xs leading-5 text-muted">{helperText}</p>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

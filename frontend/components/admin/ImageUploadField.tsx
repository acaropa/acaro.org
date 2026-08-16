"use client";

import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { apiAssetUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Link2, RotateCcw, Upload } from "lucide-react";

export interface UploadedFile {
  base64: string;
  fileName: string;
}

type ImageSourceMode = "file" | "url" | "keep";

export function ImageSourceSwitch({
  value,
  onChange,
  allowKeep = false,
}: {
  value: ImageSourceMode;
  onChange: (mode: ImageSourceMode) => void;
  allowKeep?: boolean;
}) {
  const options = [
    { value: "file" as const, label: "Archivo", icon: Upload },
    { value: "url" as const, label: "Enlace", icon: Link2 },
    ...(allowKeep ? [{ value: "keep" as const, label: "Actual", icon: RotateCcw }] : []),
  ];

  return (
    <div
      className="mb-3 grid border border-border bg-background p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="group"
      aria-label="Origen del archivo"
    >
      {options.map(option => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "flex h-9 items-center justify-center gap-2 px-2 text-xs font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:bg-surface hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
interface ImageUploadFieldProps {
  compact?: boolean;
  label?: string;
  value: UploadedFile | null;
  onChange: (value: UploadedFile | null) => void;
  existingUrl?: string | null;
  accept?: string;
  helperText?: string;
  maxSizeMb?: number;
  showPreview?: boolean;
}

export function ImageUploadField({
  compact = false,
  label,
  value,
  onChange,
  existingUrl,
  accept = "image/jpeg,image/png,image/webp",
  helperText,
  maxSizeMb = 4,
  showPreview = true,
}: ImageUploadFieldProps) {
  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ base64: String(reader.result), fileName: file.name });
    };
    reader.readAsDataURL(file);
  }

  return (
    <FileUploadDropzone
      compact={compact}
      label={label}
      accept={accept}
      maxSizeMb={maxSizeMb}
      helperText={helperText}
      existingUrl={value?.base64 || (existingUrl ? apiAssetUrl(existingUrl) : null)}
      fileName={value?.fileName || existingUrl?.split("/").pop()}
      onFileSelect={handleFile}
      onClear={value ? () => onChange(null) : undefined}
      showPreview={showPreview}
    />
  );
}

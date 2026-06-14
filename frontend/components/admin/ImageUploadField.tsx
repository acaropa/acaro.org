'use client';

import { useRef, useState } from 'react';
import { apiAssetUrl } from '@/lib/api';

export interface UploadedFile {
  base64: string;
  fileName: string;
}

interface ImageUploadFieldProps {
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
  label,
  value,
  onChange,
  existingUrl,
  accept = 'image/jpeg,image/png,image/webp',
  helperText,
  maxSizeMb = 4,
  showPreview = true,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`El archivo supera el límite de ${maxSizeMb} MB`);
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ base64: String(reader.result), fileName: file.name });
    };
    reader.readAsDataURL(file);
  }

  function clear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const previewSrc = value?.base64 || (existingUrl ? apiAssetUrl(existingUrl) : null);
  const isImagePreview =
    showPreview &&
    !!previewSrc &&
    (value?.base64.startsWith('data:image') || /\.(jpe?g|png|webp|gif)$/i.test(previewSrc));

  return (
    <div>
      {label && (
        <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">
          {label}
        </label>
      )}
      {isImagePreview && (
        <div className="mb-3 h-40 w-full max-w-xs bg-surface overflow-hidden border border-border">
          <img src={previewSrc ?? undefined} alt="Vista previa" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest border border-border text-foreground hover:bg-surface transition-colors"
        >
          {value || existingUrl ? 'Cambiar archivo' : 'Subir archivo'}
        </button>
        {(value?.fileName || existingUrl) && (
          <span className="text-sm text-muted font-body-md truncate max-w-[200px]">
            {value?.fileName || existingUrl?.split('/').pop()}
          </span>
        )}
        {value && (
          <button type="button" onClick={clear} className="text-sm text-red-600 hover:text-red-800">
            Quitar
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      {helperText && <p className="mt-1 text-xs text-muted">{helperText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

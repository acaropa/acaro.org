'use client';

import { AppIcon } from "@/components/ui/AppIcon"

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { api, apiAssetUrl } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { ImageUploadField, UploadedFile } from '@/components/admin/ImageUploadField';
import { libraryCategories } from '@/lib/library';

const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp';

type DocumentState =
  | 'borrador'
  | 'pendiente_revision'
  | 'requiere_correccion'
  | 'aprobado'
  | 'rechazado'
  | 'archivado';

interface LibraryRecord {
  id: number;
  titulo: string;
  descripcion: string | null;
  archivo_url: string;
  categoria: string;
  imagen_portada: string | null;
  estado: DocumentState;
  visibilidad: 'publica' | 'interna';
  creado_por: number;
  creado_por_email: string;
  creado_por_nombre: string | null;
  revisado_por_email: string | null;
  fecha_creacion: string;
  fecha_revision: string | null;
  observacion_revision: string | null;
  etiquetas: string[] | null;
  serie: string | null;
  orden_lectura: number | null;
  destacado: boolean | number;
  orden_portada: number | null;
}

const emptyForm = {
  titulo: '',
  descripcion: '',
  archivo_url: '',
  categoria: '',
  imagen_portada: '',
  visibilidad: 'interna' as 'publica' | 'interna',
  etiquetas: '',
  serie: '',
  orden_lectura: '',
  destacado: false,
  orden_portada: '',
};

const stateLabels: Record<DocumentState, string> = {
  borrador: 'Borrador',
  pendiente_revision: 'Pendiente de revisión',
  requiere_correccion: 'Requiere corrección',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  archivado: 'Archivado',
};

const reviewTabs: Array<{ state: DocumentState; label: string }> = [
  { state: 'pendiente_revision', label: 'Documentos pendientes' },
  { state: 'requiere_correccion', label: 'Correcciones solicitadas' },
  { state: 'aprobado', label: 'Aprobados' },
  { state: 'rechazado', label: 'Rechazados' },
  { state: 'archivado', label: 'Archivados' },
];

export default function AdminBiblioteca() {
  const { user, can } = useAuth();
  const canReview = can(PERMISSIONS.BIBLIOTECA_REVIEW);
  const canDelete = can(PERMISSIONS.BIBLIOTECA_DELETE);
  const [documents, setDocuments] = useState<LibraryRecord[]>([]);
  const [activeState, setActiveState] = useState<DocumentState>('pendiente_revision');
  const [mineOnly, setMineOnly] = useState(!canReview);
  const [form, setForm] = useState(emptyForm);
  const [uploadMode, setUploadMode] = useState<'url' | 'file' | 'keep'>('url');
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [coverMode, setCoverMode] = useState<'url' | 'file' | 'keep'>('url');
  const [cover, setCover] = useState<UploadedFile | null>(null);
  const [editing, setEditing] = useState<LibraryRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (activeState) params.set('status', activeState);
    if (mineOnly) params.set('scope', 'mine');
    try {
      setDocuments(await api.get<LibraryRecord[]>(`/biblioteca?${params}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la biblioteca');
    } finally {
      setLoading(false);
    }
  }, [activeState, mineOnly]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const title = canReview && !mineOnly ? 'Revisión de biblioteca' : 'Mis documentos';
  const editableStates: DocumentState[] = ['borrador', 'pendiente_revision', 'requiere_correccion'];

  function resetForm() {
    setForm(emptyForm);
    setUploadMode('url');
    setFile(null);
    setCoverMode('url');
    setCover(null);
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(document: LibraryRecord) {
    setEditing(document);
    const archivoEsSubido = document.archivo_url?.startsWith('/uploads/');
    const portadaEsSubida = document.imagen_portada?.startsWith('/uploads/');
    setForm({
      titulo: document.titulo,
      descripcion: document.descripcion || '',
      archivo_url: archivoEsSubido ? '' : (document.archivo_url || ''),
      categoria: document.categoria,
      imagen_portada: portadaEsSubida ? '' : (document.imagen_portada || ''),
      visibilidad: document.visibilidad,
      etiquetas: (document.etiquetas || []).join(', '),
      serie: document.serie || '',
      orden_lectura: document.orden_lectura != null ? String(document.orden_lectura) : '',
      destacado: Boolean(document.destacado),
      orden_portada: document.orden_portada != null ? String(document.orden_portada) : '',
    });
    setUploadMode(archivoEsSubido ? 'keep' : 'url');
    setFile(null);
    setCoverMode(portadaEsSubida ? 'keep' : 'url');
    setCover(null);
    setShowForm(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = { ...form };
      payload.etiquetas = form.etiquetas
        ? form.etiquetas.split(',').map((t: string) => t.trim()).filter(Boolean)
        : null;
      payload.serie = form.serie.trim() || null;
      payload.orden_lectura = form.orden_lectura ? Number(form.orden_lectura) : null;
      payload.destacado = Boolean(form.destacado);
      payload.orden_portada = form.orden_portada ? Number(form.orden_portada) : null;
      if (uploadMode === 'file' && file) {
        delete payload.archivo_url;
        payload.archivo_base64 = file.base64;
        payload.archivo_nombre = file.fileName;
      } else if (uploadMode === 'keep') {
        delete payload.archivo_url; // el backend mantiene el archivo existente
      }
      if (coverMode === 'file' && cover) {
        delete payload.imagen_portada;
        payload.portada_base64 = cover.base64;
        payload.portada_nombre = cover.fileName;
      } else if (coverMode === 'keep') {
        delete payload.imagen_portada; // el backend mantiene la portada existente
      } else {
        payload.imagen_portada = form.imagen_portada.trim() || null;
      }
      if (editing) {
        await api.put(`/biblioteca/${editing.id}`, payload);
        if (editing.estado === 'requiere_correccion' && editing.creado_por === user?.id) {
          await api.post(`/biblioteca/${editing.id}/resubmit`, {});
        }
      } else {
        await api.post('/biblioteca', payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el documento');
    } finally {
      setSaving(false);
    }
  }

  async function review(document: LibraryRecord, action: string) {
    let observation = '';
    if (action === 'reject' || action === 'request_changes') {
      observation = prompt('Escribe la observación para el autor:')?.trim() || '';
      if (!observation) return;
    }
    try {
      await api.post(`/biblioteca/${document.id}/review`, { action, observation });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la revisión');
    }
  }

  async function remove(document: LibraryRecord) {
    if (!confirm(`¿Eliminar "${document.titulo}"?`)) return;
    try {
      await api.delete(`/biblioteca/${document.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el documento');
    }
  }

  const tabs = useMemo(() => reviewTabs, []);

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              {title}
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              {canReview && !mineOnly
                ? 'Aprueba, rechaza o solicita correcciones a los documentos recibidos.'
                : 'Consulta el estado de tus documentos y reenvía las correcciones.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {canReview && (
              <button
                type="button"
                onClick={() => setMineOnly(value => !value)}
                className="px-6 py-3 font-label-caps text-label-caps border border-border text-foreground hover:bg-surface transition-colors uppercase tracking-widest"
              >
                {mineOnly ? 'Ver revisión' : 'Mis documentos'}
              </button>
            )}
            <button
              type="button"
              onClick={() => showForm ? resetForm() : setShowForm(true)}
              className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
            >
              + Subir documento
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-6 mb-8 border-b border-border">
        {tabs.map(tab => {
          const isActive = activeState === tab.state;
          return (
            <button
              key={tab.state}
              type="button"
              onClick={() => setActiveState(tab.state)}
              className={`pb-3 font-label-caps text-[12px] tracking-widest uppercase transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary"></span>
              )}
            </button>
          )
        })}
      </div>

      <Modal isOpen={showForm} onClose={resetForm} title={editing ? 'Editar Documento' : 'Subir Documento'}>
        <form onSubmit={save} className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Título</label>
              <input required value={form.titulo} onChange={event => setForm(current => ({ ...current, titulo: event.target.value }))} className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Categoría</label>
              <select required value={form.categoria} onChange={event => setForm(current => ({ ...current, categoria: event.target.value }))} className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors">
                <option value="" disabled>Selecciona una categoría</option>
                {libraryCategories.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Visibilidad</label>
              <select value={form.visibilidad} onChange={event => setForm(current => ({ ...current, visibilidad: event.target.value as 'publica' | 'interna' }))} className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors">
                <option value="interna">Interna</option>
                <option value="publica">Pública al aprobarse</option>
              </select>
            </div>
            <div className="md:col-span-2">
              {uploadMode === 'keep' ? (
                <div className="rounded border border-border bg-surface px-4 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-label-caps text-[10px] uppercase tracking-widest text-muted mb-1">Archivo actual</p>
                    <a
                      href={apiAssetUrl(editing?.archivo_url || '')}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-medium text-primary hover:underline"
                    >
                      {editing?.archivo_url?.split('/').pop()}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className="shrink-0 border border-border px-3 py-1.5 font-label-caps text-[11px] uppercase tracking-widest text-foreground hover:bg-background transition-colors"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest border transition-colors ${uploadMode === 'url' ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted hover:bg-surface'}`}
                    >
                      URL externa
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest border transition-colors ${uploadMode === 'file' ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted hover:bg-surface'}`}
                    >
                      Subir archivo
                    </button>
                    {editing && (
                      <button
                        type="button"
                        onClick={() => { setUploadMode('keep'); setFile(null); }}
                        className="px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest border border-border text-muted hover:bg-surface transition-colors"
                      >
                        Mantener actual
                      </button>
                    )}
                  </div>
                  {uploadMode === 'url' ? (
                    <div>
                      <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">URL del archivo</label>
                      <input required type="url" value={form.archivo_url} onChange={event => setForm(current => ({ ...current, archivo_url: event.target.value }))} className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  ) : (
                    <ImageUploadField
                      label="Archivo"
                      value={file}
                      onChange={setFile}
                      existingUrl={undefined}
                      accept={DOCUMENT_ACCEPT}
                      maxSizeMb={8}
                      showPreview={false}
                      helperText="PDF, Word, Excel, PowerPoint, texto o imagen. Máximo 8 MB."
                    />
                  )}
                </>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Imagen de portada (opcional)</label>
              {coverMode === 'keep' ? (
                <div className="rounded border border-border bg-surface flex items-center gap-4 p-3">
                  <img src={apiAssetUrl(editing?.imagen_portada || '')} alt="Portada actual" className="h-16 w-24 shrink-0 object-cover rounded border border-border" />
                  <div className="flex-1 min-w-0">
                    <p className="font-label-caps text-[10px] uppercase tracking-widest text-muted mb-1">Portada actual</p>
                    <p className="truncate text-sm text-foreground">{editing?.imagen_portada?.split('/').pop()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoverMode('file')}
                    className="shrink-0 border border-border px-3 py-1.5 font-label-caps text-[11px] uppercase tracking-widest text-foreground hover:bg-background transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setCoverMode('url')}
                      className={`px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest border transition-colors ${coverMode === 'url' ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted hover:bg-surface'}`}
                    >
                      URL externa
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode('file')}
                      className={`px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest border transition-colors ${coverMode === 'file' ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted hover:bg-surface'}`}
                    >
                      Subir imagen
                    </button>
                    {editing?.imagen_portada?.startsWith('/uploads/') && (
                      <button
                        type="button"
                        onClick={() => { setCoverMode('keep'); setCover(null); }}
                        className="px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest border border-border text-muted hover:bg-surface transition-colors"
                      >
                        Mantener actual
                      </button>
                    )}
                  </div>
                  {coverMode === 'url' ? (
                    <input type="url" value={form.imagen_portada} onChange={event => setForm(current => ({ ...current, imagen_portada: event.target.value }))} placeholder="https://..." className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
                  ) : (
                    <ImageUploadField
                      value={cover}
                      onChange={setCover}
                      existingUrl={undefined}
                      helperText="Formatos JPG, PNG o WEBP, máximo 4 MB."
                    />
                  )}
                </>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Etiquetas</label>
              <input value={form.etiquetas} onChange={event => setForm(current => ({ ...current, etiquetas: event.target.value }))} placeholder="Ej: Permisología, Legal, Productores (separadas por coma)" className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
              <p className="mt-1 text-[11px] text-muted">Separa las etiquetas con comas. Estas ayudan a los usuarios a encontrar documentos relacionados.</p>
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Serie / Curso (opcional)</label>
              <input value={form.serie} onChange={event => setForm(current => ({ ...current, serie: event.target.value }))} placeholder="Ej: Permisología del Café" className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
              <p className="mt-1 text-[11px] text-muted">Agrupa documentos en un curso o serie paso a paso.</p>
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">N° de paso en la serie (opcional)</label>
              <input type="number" min="1" value={form.orden_lectura} onChange={event => setForm(current => ({ ...current, orden_lectura: event.target.value }))} placeholder="Ej: 1" className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
              <p className="mt-1 text-[11px] text-muted">El orden en que se debe leer este documento dentro de la serie.</p>
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Portada editorial</label>
              <label className="flex items-center gap-3 border border-border bg-background px-4 py-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(form.destacado)}
                  onChange={event => setForm(current => ({ ...current, destacado: event.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                Destacar en la portada de biblioteca
              </label>
              <p className="mt-1 text-[11px] text-muted">Los destacados aparecen primero en /biblioteca.</p>
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Orden en portada (opcional)</label>
              <input
                type="number"
                min="1"
                value={form.orden_portada}
                onChange={event => setForm(current => ({ ...current, orden_portada: event.target.value }))}
                placeholder="Ej: 1"
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <p className="mt-1 text-[11px] text-muted">Menor numero aparece antes entre los destacados.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Descripción</label>
              <textarea value={form.descripcion} onChange={event => setForm(current => ({ ...current, descripcion: event.target.value }))} rows={3} className="w-full bg-background border border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
            </div>
            
            <div className="md:col-span-2 flex justify-end mt-4">
              <button disabled={saving} className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-[12px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : editing?.estado === 'requiere_correccion' ? 'Guardar y reenviar' : 'Guardar Documento'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {error && <p className="rounded border-l-4 border-red-600 bg-red-50 p-4 font-body-md text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="py-12 text-center text-muted font-body-md animate-pulse">Cargando biblioteca...</div>
      ) : documents.length === 0 ? (
        <div className="bg-surface/30 border border-border border-dashed p-16 flex flex-col items-center justify-center text-center">
          <AppIcon name="description" className="text-[48px] text-muted mb-4 opacity-50" />
          <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">Sin documentos</h3>
          <p className="font-body-md text-muted max-w-md">No se encontraron archivos en este estado actualmente.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {documents.map(document => {
            const isOwner = document.creado_por === user?.id;
            return (
              <div key={document.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                {document.imagen_portada && (
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg border border-border bg-surface md:w-36">
                    <img
                      src={apiAssetUrl(document.imagen_portada)}
                      alt={`Portada de ${document.titulo}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="shrink-0 whitespace-nowrap font-label-caps text-[10px] tracking-widest uppercase text-accent bg-accent/10 px-2 py-1 rounded">
                      {document.categoria}
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-xs text-muted font-mono">{document.visibilidad}</span>
                    {Boolean(document.destacado) && (
                      <span className="shrink-0 whitespace-nowrap text-[10px] tracking-wide text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded">
                        Destacado{document.orden_portada ? ` · Orden ${document.orden_portada}` : ''}
                      </span>
                    )}
                    {document.serie && (
                      <span className="shrink-0 whitespace-nowrap text-[10px] tracking-wide text-primary/80 bg-primary/5 border border-primary/15 px-2 py-1 rounded">
                        📖 {document.serie}{document.orden_lectura ? ` · Paso ${document.orden_lectura}` : ''}
                      </span>
                    )}
                    {document.etiquetas?.map(tag => (
                      <span key={tag} className="shrink-0 whitespace-nowrap text-[10px] tracking-wide text-muted bg-surface px-2 py-0.5 rounded border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a href={apiAssetUrl(document.archivo_url)} target="_blank" rel="noreferrer" className="block font-headline-md text-lg font-bold text-foreground hover:text-primary transition-colors mb-1">
                    {document.titulo}
                  </a>
                  <p className="text-sm text-muted font-body-md">Subido por: <span className="text-foreground">{document.creado_por_nombre || document.creado_por_email}</span></p>
                  
                  {document.observacion_revision && (
                    <div className="mt-3 bg-red-50/50 border-l-2 border-red-500 p-3 text-sm text-red-800 font-body-md">
                      <strong className="block text-xs uppercase tracking-widest mb-1 opacity-70">Observación</strong> 
                      {document.observacion_revision}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
                  <span className="font-label-caps text-[11px] uppercase tracking-wider text-muted border border-border px-3 py-1">
                    {stateLabels[document.estado]}
                  </span>
                  
                  <div className="flex flex-wrap gap-4 md:gap-3">
                    {(canReview || (isOwner && editableStates.includes(document.estado))) && (
                      <button onClick={() => startEdit(document)} className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <AppIcon name="edit" className="text-[16px]" /> Editar
                      </button>
                    )}
                    {canReview && document.estado === 'pendiente_revision' && (
                      <>
                        <button onClick={() => void review(document, 'approve')} className="flex items-center gap-1 text-sm font-medium text-brand-green hover:underline">
                          <AppIcon name="check_circle" className="text-[16px]" /> Aprobar
                        </button>
                        <button onClick={() => void review(document, 'request_changes')} className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                          <AppIcon name="assignment_return" className="text-[16px]" /> Pedir corrección
                        </button>
                        <button onClick={() => void review(document, 'reject')} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:underline">
                          <AppIcon name="cancel" className="text-[16px]" /> Rechazar
                        </button>
                      </>
                    )}
                    {canReview && document.estado === 'aprobado' && (
                      <button onClick={() => void review(document, 'archive')} className="flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground">
                        <AppIcon name="inventory_2" className="text-[16px]" /> Archivar
                      </button>
                    )}
                    {canReview && document.estado === 'archivado' && (
                      <button onClick={() => void review(document, 'unarchive')} className="flex items-center gap-1 text-sm font-medium text-brand-green hover:underline">
                        <AppIcon name="unarchive" className="text-[16px]" /> Desarchivar
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => void remove(document)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800">
                        <AppIcon name="delete" className="text-[16px]" /> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

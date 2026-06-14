'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { EmptyState } from '@/components/ui/EmptyState';
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
  revisado_por_email: string | null;
  fecha_creacion: string;
  fecha_revision: string | null;
  observacion_revision: string | null;
}

const emptyForm = {
  titulo: '',
  descripcion: '',
  archivo_url: '',
  categoria: '',
  imagen_portada: '',
  visibilidad: 'interna' as 'publica' | 'interna',
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
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [coverMode, setCoverMode] = useState<'url' | 'file'>('url');
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
    setForm({
      titulo: document.titulo,
      descripcion: document.descripcion || '',
      archivo_url: document.archivo_url,
      categoria: document.categoria,
      imagen_portada: document.imagen_portada || '',
      visibilidad: document.visibilidad,
    });
    setUploadMode('url');
    setFile(null);
    setCoverMode('url');
    setCover(null);
    setShowForm(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = { ...form };
      if (uploadMode === 'file' && file) {
        delete payload.archivo_url;
        payload.archivo_base64 = file.base64;
        payload.archivo_nombre = file.fileName;
      }
      if (coverMode === 'file' && cover) {
        delete payload.imagen_portada;
        payload.portada_base64 = cover.base64;
        payload.portada_nombre = cover.fileName;
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
                  existingUrl={editing?.archivo_url}
                  accept={DOCUMENT_ACCEPT}
                  maxSizeMb={8}
                  showPreview={false}
                  helperText="PDF, Word, Excel, PowerPoint, texto o imagen. Máximo 8 MB."
                />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Imagen de portada (opcional)</label>
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
                  Subir archivo
                </button>
              </div>
              {coverMode === 'url' ? (
                <input type="url" value={form.imagen_portada} onChange={event => setForm(current => ({ ...current, imagen_portada: event.target.value }))} placeholder="https://..." className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
              ) : (
                <ImageUploadField
                  value={cover}
                  onChange={setCover}
                  existingUrl={editing?.imagen_portada}
                  helperText="Formatos JPG, PNG o WEBP, máximo 4 MB."
                />
              )}
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
          <span className="material-symbols-outlined text-[48px] text-muted mb-4 opacity-50">description</span>
          <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">Sin documentos</h3>
          <p className="font-body-md text-muted max-w-md">No se encontraron archivos en este estado actualmente.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {documents.map(document => {
            const isOwner = document.creado_por === user?.id;
            return (
              <div key={document.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-label-caps text-[10px] tracking-widest uppercase text-accent bg-accent/10 px-2 py-1 rounded">
                      {document.categoria}
                    </span>
                    <span className="text-xs text-muted font-mono">{document.visibilidad}</span>
                  </div>
                  <a href={document.archivo_url} target="_blank" rel="noreferrer" className="block font-headline-md text-lg font-bold text-foreground hover:text-primary transition-colors mb-1">
                    {document.titulo}
                  </a>
                  <p className="text-sm text-muted font-body-md">Subido por: <span className="text-foreground">{document.creado_por_email}</span></p>
                  
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
                        <span className="material-symbols-outlined text-[16px]">edit</span> Editar
                      </button>
                    )}
                    {canReview && document.estado === 'pendiente_revision' && (
                      <>
                        <button onClick={() => void review(document, 'approve')} className="flex items-center gap-1 text-sm font-medium text-brand-green hover:underline">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span> Aprobar
                        </button>
                        <button onClick={() => void review(document, 'request_changes')} className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                          <span className="material-symbols-outlined text-[16px]">assignment_return</span> Pedir corrección
                        </button>
                        <button onClick={() => void review(document, 'reject')} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:underline">
                          <span className="material-symbols-outlined text-[16px]">cancel</span> Rechazar
                        </button>
                      </>
                    )}
                    {canReview && document.estado === 'aprobado' && (
                      <button onClick={() => void review(document, 'archive')} className="flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground">
                        <span className="material-symbols-outlined text-[16px]">inventory_2</span> Archivar
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => void remove(document)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800">
                        <span className="material-symbols-outlined text-[16px]">delete</span> Eliminar
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

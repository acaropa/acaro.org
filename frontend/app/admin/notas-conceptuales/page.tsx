'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

type AgendaRow = {
  hora: string;
  actividad: string;
  responsable: string;
};

type ConceptNoteForm = {
  asociacion: string;
  titulo: string;
  subtitulo: string;
  fecha: string;
  lugar: string;
  horario: string;
  introduccion: string;
  objetivo: string;
  participantesAcaro: string;
  participantesContraparte: string;
  temas: string;
  metodologia: string;
  agenda: AgendaRow[];
  resultados: string;
  productos: string;
  aprobacion: string;
  firmanteAcaro: string;
  cargoAcaro: string;
  firmanteTecnico: string;
  cargoTecnico: string;
  realizadoPor: string;
  fechaDocumento: string;
};

type NotaConceptualRecord = {
  id: number;
  asociacion: string;
  titulo: string;
  subtitulo: string;
  fecha: string;
  lugar: string;
  horario: string;
  introduccion: string;
  objetivo: string;
  participantes_acaro: string;
  participantes_contraparte: string;
  temas: string;
  metodologia: string;
  agenda: AgendaRow[];
  resultados: string;
  productos: string;
  aprobacion: string;
  firmante_acaro: string;
  cargo_acaro: string;
  firmante_tecnico: string;
  cargo_tecnico: string;
  realizado_por: string;
  fecha_documento: string;
  creado_por: number;
  created_at: string;
  updated_at: string;
};

const defaultForm: ConceptNoteForm = {
  asociacion: 'Asociación Café Robusta OBC (ACARO)',
  titulo: 'NOTA CONCEPTUAL',
  subtitulo: '',
  fecha: '',
  lugar: '',
  horario: '',
  introduccion: '',
  objetivo: '',
  participantesAcaro: '',
  participantesContraparte: '',
  temas: '',
  metodologia: '',
  agenda: [{ hora: '', actividad: '', responsable: '' }],
  resultados: '',
  productos: '',
  aprobacion: '',
  firmanteAcaro: '',
  cargoAcaro: '',
  firmanteTecnico: '',
  cargoTecnico: '',
  realizadoPor: '',
  fechaDocumento: '',
};

const fieldClass =
  'w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors';

function recordToForm(r: NotaConceptualRecord): ConceptNoteForm {
  return {
    asociacion: r.asociacion,
    titulo: r.titulo,
    subtitulo: r.subtitulo,
    fecha: r.fecha,
    lugar: r.lugar,
    horario: r.horario,
    introduccion: r.introduccion,
    objetivo: r.objetivo,
    participantesAcaro: r.participantes_acaro,
    participantesContraparte: r.participantes_contraparte,
    temas: r.temas,
    metodologia: r.metodologia,
    agenda: r.agenda.map(row => ({ ...row })),
    resultados: r.resultados,
    productos: r.productos,
    aprobacion: r.aprobacion,
    firmanteAcaro: r.firmante_acaro,
    cargoAcaro: r.cargo_acaro,
    firmanteTecnico: r.firmante_tecnico,
    cargoTecnico: r.cargo_tecnico,
    realizadoPor: r.realizado_por,
    fechaDocumento: r.fecha_documento,
  };
}

function formToPayload(form: ConceptNoteForm) {
  return {
    asociacion: form.asociacion,
    titulo: form.titulo,
    subtitulo: form.subtitulo,
    fecha: form.fecha,
    lugar: form.lugar,
    horario: form.horario,
    introduccion: form.introduccion,
    objetivo: form.objetivo,
    participantes_acaro: form.participantesAcaro,
    participantes_contraparte: form.participantesContraparte,
    temas: form.temas,
    metodologia: form.metodologia,
    agenda: form.agenda,
    resultados: form.resultados,
    productos: form.productos,
    aprobacion: form.aprobacion,
    firmante_acaro: form.firmanteAcaro,
    cargo_acaro: form.cargoAcaro,
    firmante_tecnico: form.firmanteTecnico,
    cargo_tecnico: form.cargoTecnico,
    realizado_por: form.realizadoPor,
    fecha_documento: form.fechaDocumento,
  };
}

function listFromText(value: string) {
  return value.split('\n').map(i => i.trim()).filter(Boolean);
}

function paragraphsFromText(value: string) {
  return value.split('\n').map(i => i.trim()).filter(Boolean);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'nota-conceptual'
  );
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getNoteStatus(note: NotaConceptualRecord) {
  const requiredFields = [
    note.subtitulo,
    note.fecha,
    note.lugar,
    note.horario,
    note.introduccion,
    note.objetivo,
    note.metodologia,
    note.resultados,
    note.productos,
  ];
  const isComplete = requiredFields.every(value => value?.trim());
  const isStarted = Boolean(note.subtitulo?.trim() && (note.introduccion?.trim() || note.objetivo?.trim()));
  if (isComplete) return { label: 'Aprobada', className: 'bg-[#ead2bd] text-[#7a4d27]' };
  if (isStarted) return { label: 'En revision', className: 'bg-[#d8eef1] text-[#336a73]' };
  return { label: 'Borrador', className: 'bg-[#e8dedd] text-[#6f4d4a]' };
}

function getNoteSummary(note: NotaConceptualRecord) {
  return note.objetivo || note.introduccion || note.lugar || 'Sin descripcion registrada.';
}

function formatNoteDate(value: string) {
  if (!value) return 'Sin fecha';
  return value;
}

function buildDocumentHtml(form: ConceptNoteForm, logoUrl = '', autoPrint = false) {
  const p = (text: string) =>
    paragraphsFromText(text).map(item => `<p>${escapeHtml(item)}</p>`).join('');
  const ul = (text: string) =>
    `<ul>${listFromText(text).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const agendaRows = form.agenda
    .filter(row => row.hora.trim() || row.actividad.trim() || row.responsable.trim())
    .map(
      row =>
        `<tr><td class="hora-cell">${escapeHtml(row.hora)}</td><td>${escapeHtml(row.actividad)}</td><td>${escapeHtml(row.responsable)}</td></tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(form.titulo)} - ${escapeHtml(form.fechaDocumento)}</title>
  ${autoPrint ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},600);});<\/script>' : ''}
  <style>
    @page { size: letter; margin: 15mm 18mm 15mm 18mm; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0 18mm 15mm; color: #1a1a1a; font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.45; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { max-width: 760px; margin: 0 auto; }
    @media print { body { padding: 0; } .page { max-width: none; margin: 0; } }
    .top-bar { height: 6px; background: #8B5E3C !important; margin-bottom: 6px; }
    .bottom-bar { height: 5px; background: #8B5E3C !important; margin-top: 24px; }
    header { text-align: center; margin-bottom: 10px; page-break-inside: avoid; }
    .logo { width: 66px; height: 66px; margin: 0 auto 6px; display: block; }
    .association { font-weight: 700; font-size: 11.5pt; margin-bottom: 2px; }
    .doc-title { font-size: 17pt; font-weight: 900; margin: 4px 0 6px; letter-spacing: .06em; text-transform: uppercase; }
    .subtitle-box { background: #8B5E3C !important; color: #fff !important; font-weight: 700; font-size: 11pt; padding: 9px 22px; text-align: center; line-height: 1.32; }
    .meta-table { width: 100%; border-collapse: collapse; margin: 12px 0 14px; page-break-inside: avoid; }
    .meta-table td { border: 1px solid #c8c8c8; padding: 5px 10px; font-size: 10.5pt; }
    h2 { font-size: 11pt; font-weight: 700; margin: 14px 0 5px; color: #1a1a1a; page-break-after: avoid; }
    .banner { background: #8B5E3C !important; color: #fff !important; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: .04em; padding: 7px 14px; font-size: 10pt; margin: 8px 0 6px; page-break-inside: avoid; page-break-after: avoid; }
    p { margin: 0 0 7px; text-align: justify; }
    .participant-sub { margin: 8px 0 3px; font-weight: 700; page-break-after: avoid; }
    ul { margin: 3px 0 10px 20px; padding: 0; }
    li { margin: 0 0 4px; }
    .agenda-title { text-align: center; font-weight: 900; font-size: 13pt; margin: 14px 0 8px; text-transform: uppercase; letter-spacing: .06em; page-break-after: avoid; }
    table { width: 100%; border-collapse: collapse; margin: 6px 0 12px; font-size: 10.5pt; page-break-inside: avoid; }
    thead tr { background: #8B5E3C !important; }
    th { font-weight: 700; text-align: center; text-transform: uppercase; color: #fff !important; border: 1px solid #8B5E3C; padding: 8px 10px; font-size: 10pt; letter-spacing: .03em; }
    td { border: 1px solid #c8c8c8; padding: 6px 8px; vertical-align: top; }
    .hora-cell { font-weight: 700; white-space: nowrap; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 28px 0 16px; text-align: center; page-break-inside: avoid; }
    .sig-name { font-weight: 700; font-size: 11pt; margin-bottom: 2px; }
    .sig-role { font-weight: 700; font-size: 10.5pt; }
    .doc-footer { margin-top: 14px; font-size: 10pt; page-break-inside: avoid; }
  </style>
</head>
<body>
  <main class="page">
    <div class="top-bar"></div>
    <header>
      ${logoUrl ? `<img src="${logoUrl}" alt="Logo ACARO" class="logo" />` : ''}
      <div class="association">${escapeHtml(form.asociacion)}</div>
      <div class="doc-title">${escapeHtml(form.titulo)}</div>
      <div class="subtitle-box">${escapeHtml(form.subtitulo)}</div>
    </header>
    <table class="meta-table">
      <tr><td><strong>Fecha:</strong> ${escapeHtml(form.fecha)}</td></tr>
      <tr><td><strong>Lugar:</strong> ${escapeHtml(form.lugar)}</td></tr>
      <tr><td><strong>Horario:</strong> ${escapeHtml(form.horario)}</td></tr>
    </table>
    <h2>Introducci&oacute;n</h2>
    ${p(form.introduccion)}
    <h2>Objetivo</h2>
    ${p(form.objetivo)}
    <h2>Participantes</h2>
    <div class="banner">Participar&aacute;n Representantes de:</div>
    <p class="participant-sub">Por parte de ACARO:</p>
    ${ul(form.participantesAcaro)}
    <p class="participant-sub">Por parte de la contraparte:</p>
    ${ul(form.participantesContraparte)}
    <h2>Temas de Intercambio</h2>
    ${ul(form.temas)}
    <h2>Metodolog&iacute;a</h2>
    ${p(form.metodologia)}
    <div class="agenda-title">Agenda</div>
    <table>
      <thead><tr><th>Hora</th><th>Actividad</th><th>Responsable</th></tr></thead>
      <tbody>${agendaRows}</tbody>
    </table>
    <h2>Resultados Esperados</h2>
    ${ul(form.resultados)}
    <h2>Productos</h2>
    <div class="banner">Al finalizar la actividad se contar&aacute; con:</div>
    ${ul(form.productos)}
    <h2>Aprobaci&oacute;n</h2>
    ${p(form.aprobacion)}
    <section class="signatures">
      <div>
        <div class="sig-name">${escapeHtml(form.firmanteAcaro)}</div>
        <div class="sig-role">${escapeHtml(form.cargoAcaro)}</div>
      </div>
      <div>
        <div class="sig-name">${escapeHtml(form.firmanteTecnico)}</div>
        <div class="sig-role">${escapeHtml(form.cargoTecnico)}</div>
      </div>
    </section>
    <div class="doc-footer">
      <p><strong>Documento realizado por:</strong> ${escapeHtml(form.realizadoPor)}</p>
      <p><strong>Fecha:</strong> ${escapeHtml(form.fechaDocumento)}</p>
    </div>
    <div class="bottom-bar"></div>
  </main>
</body>
</html>`;
}

export default function AdminNotasConceptualesPage() {
  const [notes, setNotes] = useState<NotaConceptualRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draftForm, setDraftForm] = useState<ConceptNoteForm>({ ...defaultForm, agenda: [{ hora: '', actividad: '', responsable: '' }] });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const selectedRecord = notes.find(n => n.id === selectedId) || null;
  const logoUrl = `${window.location.origin}/assets/logos/logo1.png`;
  const previewForm = useMemo(() => (selectedRecord ? recordToForm(selectedRecord) : null), [selectedRecord]);
  const preview = useMemo(() => (previewForm ? buildDocumentHtml(previewForm, logoUrl) : ''), [previewForm, logoUrl]);
  const filteredNotes = useMemo(() => {
    const term = normalizeSearch(query.trim());
    if (!term) return notes;
    return notes.filter(note => {
      const haystack = normalizeSearch([
        note.titulo,
        note.subtitulo,
        note.fecha,
        note.lugar,
        note.horario,
        note.introduccion,
        note.objetivo,
        note.temas,
        note.metodologia,
        note.resultados,
        note.productos,
      ].join(' '));
      return haystack.includes(term);
    });
  }, [notes, query]);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<NotaConceptualRecord[]>('/notas-conceptuales');
      setNotes(data);
      setSelectedId(prev => (prev ? prev : data[0]?.id ?? null));
    } catch {
      setError('No se pudieron cargar las notas. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNotes();
  }, [loadNotes]);

  function updateField<K extends keyof ConceptNoteForm>(key: K, value: ConceptNoteForm[K]) {
    setDraftForm(current => ({ ...current, [key]: value }));
  }

  function updateAgenda(index: number, key: keyof AgendaRow, value: string) {
    setDraftForm(current => ({
      ...current,
      agenda: current.agenda.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    }));
  }

  function addAgendaRow() {
    setDraftForm(current => ({
      ...current,
      agenda: [...current.agenda, { hora: '', actividad: '', responsable: '' }],
    }));
  }

  function removeAgendaRow(index: number) {
    setDraftForm(current => ({
      ...current,
      agenda: current.agenda.filter((_, i) => i !== index),
    }));
  }

  function startCreate() {
    setEditingId(null);
    setDraftForm({ ...defaultForm, agenda: [{ hora: '', actividad: '', responsable: '' }] });
    setShowForm(true);
  }

  function startEdit(record: NotaConceptualRecord) {
    setEditingId(record.id);
    setDraftForm(recordToForm(record));
    setShowForm(true);
  }

  async function saveDraft() {
    setSaving(true);
    try {
      const payload = formToPayload(draftForm);
      if (editingId) {
        const updated = await api.put<NotaConceptualRecord>(`/notas-conceptuales/${editingId}`, payload);
        setNotes(current => current.map(n => (n.id === editingId ? updated : n)));
        setSelectedId(editingId);
      } else {
        const created = await api.post<NotaConceptualRecord>('/notas-conceptuales', payload);
        setNotes(current => [created, ...current]);
        setSelectedId(created.id);
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la nota');
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(record: NotaConceptualRecord) {
    if (!window.confirm(`¿Eliminar la nota "${record.subtitulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/notas-conceptuales/${record.id}`);
      setNotes(current => current.filter(n => n.id !== record.id));
      if (selectedId === record.id) setSelectedId(notes.find(n => n.id !== record.id)?.id ?? null);
    } catch {
      setError('No se pudo eliminar la nota.');
    }
  }

  function savePdf() {
    if (!previewForm) return;
    const html = buildDocumentHtml(previewForm, logoUrl);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:816px;height:1px;border:0;visibility:hidden;';
    document.body.appendChild(iframe);

    iframe.addEventListener('load', () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 600);
    }, { once: true });

    iframe.srcdoc = html;
  }


  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-3xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Notas conceptuales
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              Crea y gestiona notas conceptuales. El documento se guarda en la base de datos y puedes descargarlo como PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={startCreate}
              className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
            >
              + Nueva nota
            </button>
            <button
              type="button"
              onClick={savePdf}
              disabled={!selectedRecord}
              className="px-6 py-3 font-label-caps text-label-caps border border-border text-foreground hover:bg-surface transition-colors uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Guardar PDF
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-4">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-8 items-start">
        <aside className="bg-card border border-border rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-label-caps text-[10px] text-muted uppercase tracking-widest">Notas creadas</span>
            <span className="text-xs text-muted">{filteredNotes.length}/{notes.length}</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted">
              search
            </span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar notas..."
              className="w-full border border-border bg-surface-container-lowest py-3 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
            />
          </div>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted">Cargando...</div>
          ) : notes.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-6 text-center">
              <span className="material-symbols-outlined text-[36px] text-muted mb-3">contract_edit</span>
              <h2 className="font-headline-md text-lg text-foreground">Sin notas</h2>
              <p className="mt-2 text-sm text-muted leading-6">Crea la primera nota conceptual para verla aquí.</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-6 text-center">
              <span className="material-symbols-outlined text-[36px] text-muted mb-3">search_off</span>
              <h2 className="font-headline-md text-lg text-foreground">Sin resultados</h2>
              <p className="mt-2 text-sm text-muted leading-6">No encontramos notas con ese termino.</p>
            </div>
          ) : (
            <div className="-mx-6 border-y border-border">
              {filteredNotes.map(note => {
                const isSelected = note.id === selectedId;
                const status = getNoteStatus(note);
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setSelectedId(note.id)}
                    className={`w-full border-b border-border px-6 py-4 text-left transition-colors last:border-b-0 ${
                      isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-bold leading-5 text-foreground line-clamp-2">
                        {note.subtitulo || note.titulo}
                      </h3>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-widest ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">
                      {getNoteSummary(note)}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-foreground">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      {formatNoteDate(note.fecha)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {selectedRecord && (
            <div className="border-t border-border pt-5 space-y-2">
              <button
                type="button"
                onClick={() => startEdit(selectedRecord)}
                className="w-full px-5 py-3 border border-border font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface transition-colors"
              >
                Editar nota
              </button>
              <button
                type="button"
                onClick={() => deleteNote(selectedRecord)}
                className="w-full px-5 py-3 border border-red-200 text-red-600 font-label-caps text-label-caps uppercase tracking-widest hover:bg-red-50 transition-colors"
              >
                Eliminar
              </button>
            </div>
          )}
        </aside>

        <section className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="border-b border-border px-5 py-3 flex items-center justify-between gap-3">
            <span className="font-label-caps text-[11px] uppercase tracking-widest text-muted">Vista previa</span>
            <span className="text-xs text-muted">Tamaño carta</span>
          </div>
          {selectedRecord ? (
            <iframe title="Vista previa de nota conceptual" srcDoc={preview} className="h-[760px] w-full bg-white" />
          ) : (
            <div className="h-[560px] flex flex-col items-center justify-center text-center px-8">
              <span className="material-symbols-outlined text-[52px] text-muted mb-4">draft</span>
              <h2 className="font-headline-md text-xl text-foreground">Selecciona o crea una nota</h2>
              <p className="mt-2 max-w-md text-sm text-muted leading-6">
                La vista previa aparecerá cuando selecciones una nota conceptual.
              </p>
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Editar nota conceptual' : 'Crear nota conceptual'}
        maxWidth="max-w-5xl"
      >
        <form
          className="relative z-10 space-y-8"
          onSubmit={event => {
            event.preventDefault();
            saveDraft();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Asociación</label>
              <input value={draftForm.asociacion} onChange={e => updateField('asociacion', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Título</label>
              <input value={draftForm.titulo} onChange={e => updateField('titulo', e.target.value)} className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Nombre de la actividad</label>
              <input value={draftForm.subtitulo} onChange={e => updateField('subtitulo', e.target.value)} className={fieldClass} required />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Fecha</label>
              <input value={draftForm.fecha} onChange={e => updateField('fecha', e.target.value)} className={fieldClass} required />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Horario</label>
              <input value={draftForm.horario} onChange={e => updateField('horario', e.target.value)} className={fieldClass} required />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Lugar</label>
              <input value={draftForm.lugar} onChange={e => updateField('lugar', e.target.value)} className={fieldClass} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextArea label="Introducción" value={draftForm.introduccion} onChange={v => updateField('introduccion', v)} rows={7} />
            <TextArea label="Objetivo" value={draftForm.objetivo} onChange={v => updateField('objetivo', v)} rows={7} />
            <TextArea label="Participantes ACARO" value={draftForm.participantesAcaro} onChange={v => updateField('participantesAcaro', v)} rows={5} />
            <TextArea label="Participantes contraparte" value={draftForm.participantesContraparte} onChange={v => updateField('participantesContraparte', v)} rows={5} />
            <TextArea label="Temas de intercambio" value={draftForm.temas} onChange={v => updateField('temas', v)} rows={7} />
            <TextArea label="Metodología" value={draftForm.metodologia} onChange={v => updateField('metodologia', v)} rows={7} />
          </div>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="font-headline-md text-lg text-foreground">Agenda</h3>
              <button type="button" onClick={addAgendaRow} className="px-4 py-2 border border-border text-sm hover:bg-surface transition-colors">
                + Fila
              </button>
            </div>
            <div className="space-y-4">
              {draftForm.agenda.map((row, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[160px_1fr_190px_44px] gap-3 items-end border border-border rounded-lg p-4">
                  <div>
                    <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Hora</label>
                    <input value={row.hora} onChange={e => updateAgenda(index, 'hora', e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Actividad</label>
                    <input value={row.actividad} onChange={e => updateAgenda(index, 'actividad', e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Responsable</label>
                    <input value={row.responsable} onChange={e => updateAgenda(index, 'responsable', e.target.value)} className={fieldClass} />
                  </div>
                  <button
                    type="button"
                    aria-label="Eliminar fila"
                    onClick={() => removeAgendaRow(index)}
                    className="h-11 w-11 flex items-center justify-center border border-border text-muted hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextArea label="Resultados esperados" value={draftForm.resultados} onChange={v => updateField('resultados', v)} rows={7} />
            <TextArea label="Productos" value={draftForm.productos} onChange={v => updateField('productos', v)} rows={7} />
            <div className="md:col-span-2">
              <TextArea label="Aprobación" value={draftForm.aprobacion} onChange={v => updateField('aprobacion', v)} rows={4} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Firmante ACARO</label>
              <input value={draftForm.firmanteAcaro} onChange={e => updateField('firmanteAcaro', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Cargo firmante ACARO</label>
              <input value={draftForm.cargoAcaro} onChange={e => updateField('cargoAcaro', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Firmante técnico</label>
              <input value={draftForm.firmanteTecnico} onChange={e => updateField('firmanteTecnico', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Cargo firmante técnico</label>
              <input value={draftForm.cargoTecnico} onChange={e => updateField('cargoTecnico', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Documento realizado por</label>
              <input value={draftForm.realizadoPor} onChange={e => updateField('realizadoPor', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Fecha del documento</label>
              <input value={draftForm.fechaDocumento} onChange={e => updateField('fechaDocumento', e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-border text-foreground hover:bg-surface transition-colors uppercase tracking-widest font-label-caps text-label-caps"
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-label-caps uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear nota'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <div>
      <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-background border border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors resize-y"
      />
      <p className="mt-2 text-xs text-muted">Una línea por punto para crear lista.</p>
    </div>
  );
}

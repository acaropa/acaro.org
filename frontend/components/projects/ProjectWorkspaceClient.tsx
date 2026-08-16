'use client';

import { DataLoadingState } from "@/components/ui/TypingIndicator";

import { AppIcon } from "@/components/ui/AppIcon"

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { FileUploadDropzone } from '@/components/ui/FileUploadDropzone';
import { useAuth } from '@/context/AuthContext';
import { api, apiAssetUrl } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';

type Row = Record<string, string | number | null>;
type PhaseTab = 'resumen' | 'tareas' | 'avances' | 'documentos' | 'evidencias' | 'riesgos' | 'decisiones' | 'reuniones' | 'finanzas' | 'auditoria';

interface Workspace {
  project: Row & { tecnicos?: Row[]; indicadores?: Row[] };
  fases: Row[];
  tareas: Row[];
  avances: Row[];
  archivos: Row[];
  riesgos: Row[];
  decisiones: Row[];
  reuniones: Row[];
  finanzas: Row[];
  auditoria: Row[];
  financeSummary: Record<string, number>;
  report: {
    completedTasks: number;
    taskProgress: number;
    overdueTasks: number;
    openRisks: number;
    pendingReviews: number;
    health: 'verde' | 'amarillo' | 'rojo';
    alerts: string[];
  };
}

const MAX_PHASES = 6;
const MAX_INDICADORES = 4;
const INDICADOR_ICONS = ['groups', 'water', 'trees', 'eco', 'sparkles', 'coffee', 'trending_up', 'star'];
const phaseTabs: Array<[PhaseTab, string, string]> = [
  ['resumen', 'Resumen', 'dashboard'],
  ['tareas', 'Tareas', 'task_alt'],
  ['avances', 'Bitácora', 'history_edu'],
  ['documentos', 'Archivos', 'description'],
  ['evidencias', 'Evidencias', 'photo_library'],
  ['riesgos', 'Riesgos', 'warning'],
  ['decisiones', 'Decisiones', 'gavel'],
  ['reuniones', 'Reuniones', 'groups'],
  ['finanzas', 'Finanzas', 'payments'],
  ['auditoria', 'Auditoría', 'manage_history'],
];

const creationFields: Record<string, Array<{ name: string; label: string; type?: string; options?: string[]; required?: boolean }>> = {
  tareas: [
    { name: 'titulo', label: 'Título', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    { name: 'prioridad', label: 'Prioridad', type: 'select', options: ['baja', 'media', 'alta', 'critica'] },
    { name: 'fecha_inicio', label: 'Fecha de inicio', type: 'date' },
    { name: 'fecha_limite', label: 'Fecha límite', type: 'date' },
    { name: 'porcentaje_avance', label: 'Avance', type: 'number' },
  ],
  avances: [
    { name: 'titulo', label: 'Título o comentario' },
    { name: 'descripcion', label: 'Reporte de avance', type: 'textarea', required: true },
    { name: 'porcentaje_avance', label: 'Avance reportado', type: 'number' },
  ],
  riesgos: [
    { name: 'tipo', label: 'Tipo', type: 'select', options: ['riesgo', 'problema'] },
    { name: 'titulo', label: 'Título', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    { name: 'probabilidad', label: 'Probabilidad', type: 'select', options: ['baja', 'media', 'alta'] },
    { name: 'impacto', label: 'Impacto', type: 'select', options: ['bajo', 'medio', 'alto', 'critico'] },
    { name: 'plan_respuesta', label: 'Plan de respuesta', type: 'textarea' },
  ],
  decisiones: [
    { name: 'titulo', label: 'Título', required: true },
    { name: 'decision_tomada', label: 'Decisión tomada', type: 'textarea', required: true },
    { name: 'motivo', label: 'Motivo', type: 'textarea' },
    { name: 'impacto_tiempo', label: 'Impacto en tiempo' },
    { name: 'impacto_costo', label: 'Impacto en costo', type: 'number' },
    { name: 'impacto_alcance', label: 'Impacto en alcance', type: 'textarea' },
  ],
  reuniones: [
    { name: 'titulo', label: 'Título', required: true },
    { name: 'fecha_reunion', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'lugar', label: 'Lugar' },
    { name: 'participantes', label: 'Participantes', type: 'textarea' },
    { name: 'temas', label: 'Temas', type: 'textarea' },
    { name: 'acuerdos', label: 'Acuerdos', type: 'textarea' },
    { name: 'proximos_pasos', label: 'Próximos pasos', type: 'textarea' },
  ],
  finanzas: [
    { name: 'tipo', label: 'Tipo', type: 'select', options: ['presupuesto', 'compromiso', 'gasto', 'ingreso', 'ajuste'] },
    { name: 'concepto', label: 'Concepto', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    { name: 'monto', label: 'Monto', type: 'number', required: true },
    { name: 'moneda', label: 'Moneda' },
    { name: 'fecha_movimiento', label: 'Fecha', type: 'date', required: true },
  ],
};

export default function ProjectWorkspacePage() {
  const id = useSearchParams().get('id') || '';
  const router = useRouter();
  const { can } = useAuth();
  const [data, setData] = useState<Workspace | null>(null);
  const [projectView, setProjectView] = useState<'resumen' | 'fases'>('fases');
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [phaseTab, setPhaseTab] = useState<PhaseTab>('resumen');
  const [createKind, setCreateKind] = useState<string | null>(null);
  const [fileKind, setFileKind] = useState<'documento' | 'foto' | null>(null);
  const [editProject, setEditProject] = useState(false);
  const [editPhase, setEditPhase] = useState(false);
  const [technicians, setTechnicians] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const workspace = await api.get<Workspace>(`/proyectos/${id}/gestion`);
      setData(workspace);
      setActivePhaseId(current =>
        workspace.fases.some(phase => Number(phase.id) === current)
          ? current
          : workspace.fases[0] ? Number(workspace.fases[0].id) : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el expediente');
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const canManage = can(PERMISSIONS.PROYECTOS_UPDATE_ALL, PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED);
  const canOperate = canManage || can(PERMISSIONS.PROYECTOS_OPERATE_ASSIGNED);
  const canReview = can(PERMISSIONS.PROYECTOS_UPDATE_ALL, PERMISSIONS.PROYECTOS_REVIEW_ASSIGNED);

  useEffect(() => {
    if (!canManage) return;
    api.get<Row[]>('/tecnicos').then(setTechnicians).catch(() => setTechnicians([]));
  }, [canManage]);

  const phase = useMemo(
    () => data?.fases.find(item => Number(item.id) === activePhaseId) || null,
    [data, activePhaseId]
  );
  const phaseRows = useMemo(() => {
    const belongs = (item: Row) => Number(item.fase_id) === activePhaseId;
    const files = data?.archivos.filter(belongs) || [];
    return {
      tareas: data?.tareas.filter(belongs) || [],
      avances: data?.avances.filter(belongs) || [],
      documentos: files.filter(item => !['foto', 'evidencia'].includes(String(item.tipo))),
      evidencias: files.filter(item => ['foto', 'evidencia'].includes(String(item.tipo))),
      riesgos: data?.riesgos.filter(belongs) || [],
      decisiones: data?.decisiones.filter(belongs) || [],
      reuniones: data?.reuniones.filter(belongs) || [],
      finanzas: data?.finanzas.filter(belongs) || [],
      auditoria: data?.auditoria.filter(belongs) || [],
    };
  }, [data, activePhaseId]);

  const unassignedCount = useMemo(() => {
    if (!data) return 0;
    return [
      ...data.tareas, ...data.avances, ...data.archivos, ...data.riesgos,
      ...data.decisiones, ...data.reuniones, ...data.finanzas,
    ].filter(item => !item.fase_id).length;
  }, [data]);

  async function mutate(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      setError('');
      await action();
      await load();
      setCreateKind(null);
      setFileKind(null);
      setEditPhase(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción');
    } finally {
      setBusy(false);
    }
  }

  async function createRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createKind) return;
    const form = new FormData(event.currentTarget);
    const body: Record<string, FormDataEntryValue | number | null> = Object.fromEntries(form.entries());
    for (const key of ['peso_porcentaje', 'porcentaje_avance', 'impacto_costo', 'monto', 'responsable_id']) {
      if (body[key]) body[key] = Number(body[key]);
    }
    if (createKind === 'fases') {
      body.orden = (data?.fases.length || 0) + 1;
      await mutate(() => api.post(`/proyectos/${id}/fases`, body));
      return;
    }
    if (createKind === 'indicadores') {
      body.orden = data?.project.indicadores?.length || 0;
      await mutate(() => api.post(`/proyectos/${id}/indicadores`, body));
      return;
    }
    if (!activePhaseId) {
      setError('Selecciona o crea una fase antes de registrar contenido.');
      return;
    }
    body.fase_id = activePhaseId;
    await mutate(() => api.post(`/proyectos/${id}/gestion/${createKind}`, body));
  }

  async function uploadFile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fileKind || !activePhaseId) return;
    const form = new FormData(event.currentTarget);
    const file = form.get('file') as File;
    if (!file?.size) return setError('Selecciona un archivo');
    const fileBase64 = await readFile(file);
    await mutate(() => api.post(`/proyectos/${id}/gestion/archivos`, {
      titulo: form.get('titulo') || file.name,
      descripcion: form.get('descripcion') || null,
      fase_id: activePhaseId,
      tipo: fileKind,
      file_name: file.name,
      file_base64: fileBase64,
      visibilidad: 'interna',
    }));
  }

  async function savePhase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phase) return;
    const form = new FormData(event.currentTarget);
    const body: Record<string, FormDataEntryValue | number | null> = Object.fromEntries(form.entries());
    for (const key of ['peso_porcentaje', 'porcentaje_avance', 'responsable_id']) {
      body[key] = body[key] ? Number(body[key]) : null;
    }
    await mutate(() => api.put(`/proyectos/${id}/fases/${phase.id}`, body));
  }

  async function updateStatus(kind: string, rowId: number, values: Record<string, unknown>) {
    await mutate(() => api.put(`/proyectos/${id}/gestion/${kind}/${rowId}`, values));
  }

  async function archive(kind: string, rowId: number) {
    if (!window.confirm('¿Confirmas que deseas archivar este registro?')) return;
    await mutate(() => api.delete(`/proyectos/${id}/gestion/${kind}/${rowId}`));
  }

  async function review(kind: 'archivos' | 'avances', rowId: number, action: string) {
    const observation = action === 'aprobar' ? '' : window.prompt('Observación de revisión') || '';
    await mutate(() => api.post(`/proyectos/${id}/gestion/${kind}/${rowId}/revision`, { action, observation }));
  }

  async function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await mutate(() => api.put(`/proyectos/${id}`, Object.fromEntries(new FormData(event.currentTarget).entries())));
    setEditProject(false);
  }

  async function assignTechnician(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const technicianId = Number(new FormData(event.currentTarget).get('tecnico_id'));
    if (!technicianId) return;
    await mutate(() => api.post(`/proyectos/${id}/tecnicos`, {
      tecnico_id: technicianId,
      fecha_asignacion: new Date().toISOString().slice(0, 10),
    }));
    event.currentTarget.reset();
  }

  async function deleteProject() {
    if (!window.confirm('Esta acción eliminará todo el expediente. ¿Deseas continuar?')) return;
    try {
      await api.delete(`/proyectos/${id}`);
      router.push('/admin/proyectos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el proyecto');
    }
  }

  if (!data) return error ? <div className="py-24 text-center text-red-700">{error}</div> : <DataLoadingState label="Cargando expediente..." className="py-24" />;
  const project = data.project;
  const phaseLimitReached = data.fases.length >= MAX_PHASES;
  const projectProgress = weightedProgress(data.fases);
  const phaseMembers = [
    ...(project.supervisor_id ? [{ id: project.supervisor_id, label: project.supervisor_email || 'Supervisor' }] : []),
    ...(project.tecnicos || []).map(person => ({ id: person.user_id, label: `${person.nombre} ${person.apellido}` })),
  ];
  const phaseFinance = financeSummary(phaseRows.finanzas);

  return (
    <>
      <Link href="/admin/proyectos" className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-primary">
        <AppIcon name="arrow_back" className="text-[18px]" /> Portafolio
      </Link>

      <header className="overflow-hidden rounded-3xl bg-[#2b1710] p-7 text-white md:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <Badge>{String(project.clasificacion || 'Proyecto ACARO')}</Badge>
              <Badge>{String(project.estado).replace('_', ' ')}</Badge>
              <Badge>{data.fases.length}/{MAX_PHASES} fases</Badge>
            </div>
            <h1 className="mt-5 font-headline-lg text-[38px] leading-[1.02] tracking-[-0.04em] md:text-[56px]">{String(project.nombre)}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d8cabb] md:text-base">{String(project.descripcion || 'Sin descripción registrada.')}</p>
            <div className="mt-7 flex items-center gap-4">
              <div className="h-1.5 max-w-md flex-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#d7a24a]" style={{ width: `${projectProgress}%` }} /></div>
              <strong className="text-sm">{projectProgress}% global</strong>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {canManage && <button onClick={() => setEditProject(true)} className="rounded-xl border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10">Editar proyecto</button>}
            {can(PERMISSIONS.PROYECTOS_DELETE) && <button onClick={deleteProject} className="rounded-xl bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#2b1710]">Eliminar</button>}
          </div>
        </div>
      </header>

      {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <nav className="mt-6 inline-flex rounded-2xl border border-border bg-card p-1.5">
        <TopNav active={projectView === 'resumen'} onClick={() => setProjectView('resumen')} icon="dashboard">Resumen</TopNav>
        <TopNav active={projectView === 'fases'} onClick={() => setProjectView('fases')} icon="account_tree">Fases</TopNav>
      </nav>

      {projectView === 'resumen' ? (
        <ProjectSummary
          data={data}
          progress={projectProgress}
          technicians={technicians}
          canManage={canManage}
          unassignedCount={unassignedCount}
          onAssign={assignTechnician}
          onRemove={technicianId => mutate(() => api.delete(`/proyectos/${id}/tecnicos/${technicianId}`))}
          onOpenPhases={() => setProjectView('fases')}
          onAddIndicador={() => setCreateKind('indicadores')}
          onRemoveIndicador={indicadorId => mutate(() => api.delete(`/proyectos/${id}/indicadores/${indicadorId}`))}
        />
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="self-start rounded-2xl border border-border bg-card p-4 xl:sticky xl:top-5">
            <div className="flex items-start justify-between gap-3 px-2 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Estructura principal</p>
                <h2 className="mt-1 font-headline-md text-xl">Fases del proyecto</h2>
              </div>
              <span className="rounded-full bg-background px-3 py-1 text-[10px] font-bold">{data.fases.length}/{MAX_PHASES}</span>
            </div>
            <div className="space-y-2">
              {data.fases.map((item, index) => (
                <PhaseSelector
                  key={Number(item.id)}
                  phase={item}
                  index={index}
                  active={Number(item.id) === activePhaseId}
                  responsible={memberName(item.responsable_id, phaseMembers)}
                  onClick={() => {
                    setActivePhaseId(Number(item.id));
                    setPhaseTab('resumen');
                  }}
                />
              ))}
            </div>
            {!data.fases.length && <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Crea la primera fase para comenzar.</div>}
            {canManage && (
              <button
                disabled={phaseLimitReached}
                onClick={() => setCreateKind('fases')}
                className="mt-4 w-full border border-dashed border-accent/50 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-background disabled:cursor-not-allowed disabled:border-border disabled:text-muted"
              >
                {phaseLimitReached ? 'Límite máximo de 6 fases' : '+ Crear nueva fase'}
              </button>
            )}
          </aside>

          {phase ? (
            <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
              <PhaseHeader phase={phase} responsible={memberName(phase.responsable_id, phaseMembers)} canManage={canManage} onEdit={() => setEditPhase(true)} />
              <div className="border-b border-border px-4 md:px-6">
                <div className="flex gap-1 overflow-x-auto py-3">
                  {phaseTabs.map(([key, label, icon]) => (
                    <button key={key} onClick={() => setPhaseTab(key)} className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${phaseTab === key ? 'bg-primary text-primary-foreground' : 'text-muted hover:bg-background'}`}>
                      <AppIcon name={icon} className="text-[17px]" />{label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5 md:p-7">
                <PhaseContent
                  tab={phaseTab}
                  phase={phase}
                  rows={phaseRows}
                  finance={phaseFinance}
                  canManage={canManage}
                  canOperate={canOperate}
                  canReview={canReview}
                  onCreate={kind => setCreateKind(kind)}
                  onFile={kind => setFileKind(kind)}
                  onUpdate={updateStatus}
                  onArchive={archive}
                  onReview={review}
                />
              </div>
            </section>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
              <AppIcon name="account_tree" className="text-[48px] text-muted" />
              <h2 className="mt-3 font-headline-md text-2xl">El proyecto aún no tiene fases</h2>
              <p className="mt-2 text-sm text-muted">Las tareas, archivos y demás registros se gestionan dentro de una fase.</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={Boolean(createKind)} onClose={() => setCreateKind(null)} title={createKind === 'fases' ? 'Crear fase' : createKind === 'indicadores' ? 'Agregar indicador destacado' : `Nuevo registro · ${createKind || ''}`} maxWidth="max-w-3xl">
        {createKind && (
          <form onSubmit={createRecord} className="grid gap-4 md:grid-cols-2">
            {createKind === 'fases' ? (
              <>
                <DynamicField field={{ name: 'nombre', label: 'Nombre de la fase', required: true }} />
                <DynamicField field={{ name: 'estado', label: 'Estado', type: 'select', options: ['pendiente', 'en_progreso', 'completado'] }} />
                <DynamicField field={{ name: 'descripcion', label: 'Descripción', type: 'textarea' }} />
                <DynamicField field={{ name: 'responsable_id', label: 'Responsable', type: 'member' }} members={phaseMembers} />
                <DynamicField field={{ name: 'peso_porcentaje', label: 'Peso porcentual', type: 'number' }} />
                <DynamicField field={{ name: 'porcentaje_avance', label: 'Avance inicial', type: 'number' }} />
                <DynamicField field={{ name: 'fecha_inicio', label: 'Fecha de inicio', type: 'date' }} />
                <DynamicField field={{ name: 'fecha_fin', label: 'Fecha de cierre', type: 'date' }} />
              </>
            ) : createKind === 'indicadores' ? (
              <>
                <DynamicField field={{ name: 'icono', label: 'Ícono', type: 'select', options: INDICADOR_ICONS }} />
                <DynamicField field={{ name: 'valor', label: 'Valor (ej. 99 productores)', required: true }} />
                <DynamicField field={{ name: 'etiqueta', label: 'Etiqueta (ej. beneficiados, 49 mujeres y 50 hombres)', required: true }} />
              </>
            ) : creationFields[createKind].map(field => <DynamicField key={field.name} field={field} />)}
            <ModalActions onCancel={() => setCreateKind(null)} submitLabel="Guardar registro" pending={busy} />
          </form>
        )}
      </Modal>

      <Modal isOpen={Boolean(fileKind)} onClose={() => setFileKind(null)} title={fileKind === 'foto' ? 'Subir evidencia a la fase' : 'Subir archivo a la fase'}>
        <form onSubmit={uploadFile} className="space-y-4">
          <DynamicField field={{ name: 'titulo', label: 'Título' }} />
          <DynamicField field={{ name: 'descripcion', label: 'Descripción', type: 'textarea' }} />
          <FileUploadDropzone
            compact
            name="file"
            label="Archivo"
            required
            maxSizeMb={8}
            accept={fileKind === 'foto' ? 'image/jpeg,image/png,image/webp,image/gif' : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.zip'}
            helperText={fileKind === 'foto' ? 'Evidencia fotográfica de la fase.' : 'Documento asociado a la fase del proyecto.'}
          />
          <ModalActions onCancel={() => setFileKind(null)} submitLabel="Subir a revisión" pending={busy} pendingLabel="Subiendo..." />
        </form>
      </Modal>

      <Modal isOpen={editPhase} onClose={() => setEditPhase(false)} title="Configurar fase" maxWidth="max-w-3xl">
        {phase && <form onSubmit={savePhase} className="grid gap-4 md:grid-cols-2">
          <label><FieldLabel>Nombre</FieldLabel><input name="nombre" defaultValue={String(phase.nombre)} required className="form-control" /></label>
          <label><FieldLabel>Estado</FieldLabel><select name="estado" defaultValue={String(phase.estado)} className="form-control"><option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completado">Completado</option></select></label>
          <label className="md:col-span-2"><FieldLabel>Descripción</FieldLabel><textarea name="descripcion" defaultValue={String(phase.descripcion || '')} rows={3} className="form-control" /></label>
          <label><FieldLabel>Responsable</FieldLabel><select name="responsable_id" defaultValue={String(phase.responsable_id || '')} className="form-control"><option value="">Sin responsable</option>{phaseMembers.map(member => <option key={Number(member.id)} value={Number(member.id)}>{String(member.label)}</option>)}</select></label>
          <label><FieldLabel>Peso porcentual</FieldLabel><input name="peso_porcentaje" type="number" min="0" max="100" defaultValue={Number(phase.peso_porcentaje || 0)} className="form-control" /></label>
          <label><FieldLabel>Progreso</FieldLabel><input name="porcentaje_avance" type="number" min="0" max="100" defaultValue={Number(phase.porcentaje_avance || 0)} className="form-control" /></label>
          <label><FieldLabel>Inicio</FieldLabel><input name="fecha_inicio" type="date" defaultValue={String(phase.fecha_inicio || '').slice(0, 10)} className="form-control" /></label>
          <label><FieldLabel>Fin</FieldLabel><input name="fecha_fin" type="date" defaultValue={String(phase.fecha_fin || '').slice(0, 10)} className="form-control" /></label>
          <ModalActions onCancel={() => setEditPhase(false)} submitLabel="Guardar fase" pending={busy} />
        </form>}
      </Modal>

      <Modal isOpen={editProject} onClose={() => setEditProject(false)} title="Editar proyecto">
        <form onSubmit={saveProject} className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2"><FieldLabel>Nombre</FieldLabel><input name="nombre" defaultValue={String(project.nombre)} required className="form-control" /></label>
          <label className="md:col-span-2"><FieldLabel>Descripción</FieldLabel><textarea name="descripcion" defaultValue={String(project.descripcion || '')} rows={4} className="form-control" /></label>
          <label className="md:col-span-2"><FieldLabel>Impacto (mensaje de cierre, opcional)</FieldLabel><textarea name="impacto" defaultValue={String(project.impacto || '')} rows={2} className="form-control" /></label>
          <label><FieldLabel>Clasificación</FieldLabel><input name="clasificacion" defaultValue={String(project.clasificacion || '')} className="form-control" /></label>
          <label><FieldLabel>Estado</FieldLabel><select name="estado" defaultValue={String(project.estado)} className="form-control"><option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completado">Completado</option><option value="cancelado">Cancelado</option></select></label>
          <label><FieldLabel>Inicio</FieldLabel><input name="fecha_inicio" type="date" defaultValue={String(project.fecha_inicio || '').slice(0, 10)} className="form-control" /></label>
          <label><FieldLabel>Fin</FieldLabel><input name="fecha_fin" type="date" defaultValue={String(project.fecha_fin || '').slice(0, 10)} className="form-control" /></label>
          <ModalActions onCancel={() => setEditProject(false)} submitLabel="Guardar cambios" />
        </form>
      </Modal>
    </>
  );
}

function ProjectSummary({ data, progress, technicians, canManage, unassignedCount, onAssign, onRemove, onOpenPhases, onAddIndicador, onRemoveIndicador }: {
  data: Workspace;
  progress: number;
  technicians: Row[];
  canManage: boolean;
  unassignedCount: number;
  onAssign: (event: React.FormEvent<HTMLFormElement>) => void;
  onRemove: (id: number) => void;
  onOpenPhases: () => void;
  onAddIndicador: () => void;
  onRemoveIndicador: (id: number) => void;
}) {
  const project = data.project;
  const indicadores = project.indicadores || [];
  return <main className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
    <div className="grid gap-5 sm:grid-cols-2">
      <Metric label="Avance ponderado" value={`${progress}%`} helper={`${data.fases.length} de ${MAX_PHASES} fases`} />
      <Metric label="Tareas completadas" value={`${data.report.completedTasks}/${data.tareas.length}`} helper={`${data.report.taskProgress}% del trabajo`} />
      <Metric label="Pendientes de revisión" value={String(data.report.pendingReviews)} helper="Bitácora y archivos" />
      <Metric label="Riesgos abiertos" value={String(data.report.openRisks)} helper={`${data.report.overdueTasks} tareas vencidas`} />
      <section className="sm:col-span-2 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-end justify-between gap-4"><SectionHeading title="Ruta de ejecución" subtitle="Las fases concentran toda la operación del proyecto." /><button onClick={onOpenPhases} className="text-[10px] font-bold uppercase tracking-widest text-primary">Gestionar fases →</button></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">{data.fases.map((phase, index) => <div key={Number(phase.id)} className="rounded-xl bg-background p-4"><span className="text-[10px] font-bold uppercase tracking-widest text-accent">Fase {index + 1}</span><strong className="mt-2 block">{String(phase.nombre)}</strong><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full bg-accent" style={{ width: `${Number(phase.porcentaje_avance || 0)}%` }} /></div></div>)}</div>
        {unassignedCount > 0 && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{unassignedCount} registro(s) antiguo(s) no tienen fase asignada. Se conservan en la base de datos, pero el nuevo flujo crea todo dentro de una fase.</p>}
      </section>
      <section className="sm:col-span-2 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading title="Indicadores destacados" subtitle="Cifras de impacto que se muestran en la ficha pública del proyecto." />
          {canManage && (
            <button
              onClick={onAddIndicador}
              disabled={indicadores.length >= MAX_INDICADORES}
              className="text-[10px] font-bold uppercase tracking-widest text-primary disabled:cursor-not-allowed disabled:text-muted"
            >
              {indicadores.length >= MAX_INDICADORES ? `Límite de ${MAX_INDICADORES}` : '+ Agregar indicador'}
            </button>
          )}
        </div>
        {indicadores.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {indicadores.map(indicador => (
              <div key={Number(indicador.id)} className="relative rounded-xl bg-background p-4 text-center">
                <AppIcon name={String(indicador.icono)} className="text-[22px] text-accent" />
                <strong className="mt-2 block text-xl">{String(indicador.valor)}</strong>
                <span className="mt-1 block text-xs text-muted">{String(indicador.etiqueta)}</span>
                {canManage && (
                  <button
                    onClick={() => onRemoveIndicador(Number(indicador.id))}
                    className="absolute right-2 top-2 text-[10px] font-bold uppercase text-red-700"
                  >
                    Quitar
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Sin indicadores destacados todavía.</div>
        )}
      </section>
      <section className="sm:col-span-2 rounded-2xl border border-border bg-card p-6">
        <SectionHeading title="Equipo del proyecto" subtitle="Personas disponibles como responsables de fase." />
        {canManage && <form onSubmit={onAssign} className="mt-5 flex gap-2"><select name="tecnico_id" className="form-control" defaultValue=""><option value="" disabled>Seleccionar técnico</option>{technicians.filter(candidate => !(project.tecnicos || []).some(person => Number(person.id) === Number(candidate.id))).map(candidate => <option key={Number(candidate.id)} value={Number(candidate.id)}>{candidate.nombre} {candidate.apellido}</option>)}</select><button className="bg-primary px-4 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">Asignar</button></form>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Person label="Supervisor" value={String(project.supervisor_email || 'Sin asignar')} />
          {(project.tecnicos || []).map(person => <div key={Number(person.id)} className="relative"><Person label={String(person.especialidad || 'Técnico')} value={`${person.nombre} ${person.apellido}`} />{canManage && <button onClick={() => onRemove(Number(person.id))} className="absolute right-2 top-2 text-[10px] font-bold uppercase text-red-700">Quitar</button>}</div>)}
        </div>
      </section>
    </div>
    <aside className="rounded-2xl border border-border bg-card p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Semáforo ejecutivo</p>
      <div className="mt-4 flex items-center gap-4"><span className={`h-12 w-12 rounded-full ${healthColor(data.report.health)}`} /><div><strong className="text-xl capitalize">{data.report.health}</strong><p className="text-sm text-muted">Salud del proyecto</p></div></div>
      <div className="mt-6 space-y-3">{data.report.alerts.map(alert => <p key={alert} className="rounded-xl bg-background p-3 text-sm text-muted">{alert}</p>)}</div>
      <div className="mt-7 border-t border-border pt-5 text-sm text-muted"><p><strong className="text-foreground">Inicio:</strong> {date(project.fecha_inicio)}</p><p className="mt-2"><strong className="text-foreground">Cierre:</strong> {date(project.fecha_fin)}</p></div>
      <div className="mt-7 border-t border-border pt-5"><p className="text-[10px] font-bold uppercase tracking-widest text-muted">Actividad reciente</p>{data.auditoria.slice(0, 5).map(item => <p key={Number(item.id)} className="mt-3 text-xs leading-5 text-muted"><strong className="text-foreground">{item.accion}</strong> en {item.modulo}<br />{dateTime(item.created_at)}</p>)}</div>
    </aside>
  </main>;
}

function PhaseContent({ tab, phase, rows, finance, canManage, canOperate, canReview, onCreate, onFile, onUpdate, onArchive, onReview }: {
  tab: PhaseTab;
  phase: Row;
  rows: Record<Exclude<PhaseTab, 'resumen'>, Row[]>;
  finance: Record<string, number>;
  canManage: boolean;
  canOperate: boolean;
  canReview: boolean;
  onCreate: (kind: string) => void;
  onFile: (kind: 'documento' | 'foto') => void;
  onUpdate: (kind: string, id: number, values: Record<string, unknown>) => void;
  onArchive: (kind: string, id: number) => void;
  onReview: (kind: 'archivos' | 'avances', id: number, action: string) => void;
}) {
  if (tab === 'resumen') {
    const completed = rows.tareas.filter(item => item.estado === 'completada').length;
    return <div className="grid gap-4 md:grid-cols-3">
      <PhaseMetric label="Tareas" value={`${completed}/${rows.tareas.length}`} />
      <PhaseMetric label="Bitácora" value={String(rows.avances.length)} />
      <PhaseMetric label="Archivos" value={String(rows.documentos.length + rows.evidencias.length)} />
      <PhaseMetric label="Riesgos abiertos" value={String(rows.riesgos.filter(item => ['abierto', 'en_mitigacion'].includes(String(item.estado))).length)} />
      <PhaseMetric label="Decisiones" value={String(rows.decisiones.length)} />
      <PhaseMetric label="Saldo estimado" value={money(finance.saldo_estimado)} />
      <div className="md:col-span-3 rounded-xl bg-background p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-muted">Descripción y contexto</p><p className="mt-3 text-sm leading-6 text-muted">{String(phase.descripcion || 'Esta fase aún no tiene una descripción detallada.')}</p></div>
    </div>;
  }

  const action = tab === 'documentos' ? () => onFile('documento')
    : tab === 'evidencias' ? () => onFile('foto')
    : tab === 'auditoria' ? undefined
    : tab === 'decisiones' ? (canManage ? () => onCreate(tab) : undefined)
    : canOperate ? () => onCreate(tab) : undefined;

  return <div>
    <div className="mb-5 flex items-end justify-between gap-4"><SectionHeading title={phaseTabTitle(tab)} subtitle={phaseTabSubtitle(tab)} />{action && <button onClick={action} className="bg-primary px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">Añadir</button>}</div>
    {tab === 'tareas' && <List rows={rows.tareas} empty="No hay tareas en esta fase." render={item => <RecordCard key={Number(item.id)} title={String(item.titulo)} description={`${item.descripcion || 'Sin descripción'}${item.fecha_limite ? ` · límite ${date(item.fecha_limite)}` : ''}`} badges={[String(item.prioridad), String(item.estado), `${item.porcentaje_avance || 0}%`]} actions={<>{canOperate && item.estado !== 'completada' && <MiniButton onClick={() => onUpdate('tareas', Number(item.id), { estado: 'completada', porcentaje_avance: 100 })}>Completar</MiniButton>}{canManage && <MiniButton danger onClick={() => onArchive('tareas', Number(item.id))}>Cancelar</MiniButton>}</>} />} />}
    {tab === 'avances' && <List rows={rows.avances} empty="No hay comentarios ni avances en esta fase." render={item => <RecordCard key={Number(item.id)} title={String(item.titulo || 'Actualización de fase')} description={String(item.descripcion)} badges={[String(item.estado), `${item.porcentaje_avance ?? 0}%`]} actions={canReview ? <ReviewActions onReview={actionName => onReview('avances', Number(item.id), actionName)} /> : null} />} />}
    {tab === 'documentos' && <FileList rows={rows.documentos} canManage={canManage} canReview={canReview} onReview={onReview} onArchive={onArchive} />}
    {tab === 'evidencias' && (rows.evidencias.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{rows.evidencias.map(item => <article key={Number(item.id)} className="overflow-hidden rounded-xl border border-border bg-background"><a href={apiAssetUrl(String(item.archivo_url))} target="_blank"><img src={apiAssetUrl(String(item.archivo_url))} alt={String(item.titulo)} className="h-44 w-full object-cover" /></a><div className="p-4"><strong>{String(item.titulo)}</strong><p className="mt-2 text-xs text-muted">{String(item.estado)}</p><div className="mt-3 flex flex-wrap gap-2">{canReview && <ReviewActions onReview={actionName => onReview('archivos', Number(item.id), actionName)} />}{canManage && <MiniButton danger onClick={() => onArchive('archivos', Number(item.id))}>Archivar</MiniButton>}</div></div></article>)}</div> : <Empty text="No hay evidencias en esta fase." />)}
    {tab === 'riesgos' && <List rows={rows.riesgos} empty="No hay riesgos en esta fase." render={item => <RecordCard key={Number(item.id)} title={`${item.tipo}: ${item.titulo}`} description={`${item.descripcion || 'Sin descripción'} · Plan: ${item.plan_respuesta || 'sin definir'}`} badges={[String(item.impacto), String(item.estado)]} actions={<>{canOperate && !['resuelto', 'cerrado'].includes(String(item.estado)) && <MiniButton onClick={() => onUpdate('riesgos', Number(item.id), { estado: 'resuelto' })}>Resolver</MiniButton>}{canManage && <MiniButton danger onClick={() => onArchive('riesgos', Number(item.id))}>Descartar</MiniButton>}</>} />} />}
    {tab === 'decisiones' && <List rows={rows.decisiones} empty="No hay decisiones en esta fase." render={item => <RecordCard key={Number(item.id)} title={String(item.titulo)} description={`${item.decision_tomada} · Motivo: ${item.motivo || 'sin registrar'} · Impacto: ${money(item.impacto_costo)}`} badges={[String(item.estado)]} actions={canManage ? <MiniButton danger onClick={() => onArchive('decisiones', Number(item.id))}>Anular</MiniButton> : null} />} />}
    {tab === 'reuniones' && <List rows={rows.reuniones} empty="No hay reuniones en esta fase." render={item => <RecordCard key={Number(item.id)} title={String(item.titulo)} description={`${date(item.fecha_reunion)} · ${item.lugar || 'sin lugar'} · Acuerdos: ${item.acuerdos || 'sin registrar'}`} badges={[]} actions={canManage ? <MiniButton danger onClick={() => onArchive('reuniones', Number(item.id))}>Eliminar</MiniButton> : null} />} />}
    {tab === 'finanzas' && <><div className="mb-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">{['presupuesto', 'compromiso', 'gasto', 'ingreso', 'ajuste', 'saldo_estimado'].map(key => <div key={key} className="rounded-xl bg-background p-3"><span className="text-[9px] font-bold uppercase tracking-wider text-muted">{key.replace('_', ' ')}</span><strong className="mt-2 block text-sm">{money(finance[key])}</strong></div>)}</div><List rows={rows.finanzas} empty="No hay movimientos en esta fase." render={item => <RecordCard key={Number(item.id)} title={String(item.concepto)} description={`${item.tipo} · ${date(item.fecha_movimiento)} · ${item.descripcion || ''}`} badges={[money(item.monto), String(item.estado)]} actions={<>{canReview && item.estado === 'pendiente' && <MiniButton onClick={() => onUpdate('finanzas', Number(item.id), { estado: 'validado' })}>Validar</MiniButton>}{canManage && <MiniButton danger onClick={() => onArchive('finanzas', Number(item.id))}>Archivar</MiniButton>}</>} />} /></>}
    {tab === 'auditoria' && <List rows={rows.auditoria} empty="No hay eventos de auditoría para esta fase." render={item => <RecordCard key={Number(item.id)} title={`${item.accion} · ${item.modulo}`} description={`${item.usuario_email || 'Sistema'} · ${dateTime(item.created_at)} · ${item.descripcion || ''}`} badges={[]} />} />}
  </div>;
}

function TopNav({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: string; children: React.ReactNode }) { return <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider ${active ? 'bg-primary text-primary-foreground' : 'text-muted'}`}><AppIcon name={icon} className="text-[18px]" />{children}</button>; }
function PhaseSelector({ phase, index, active, responsible, onClick }: { phase: Row; index: number; active: boolean; responsible: string; onClick: () => void }) { const progress = Number(phase.porcentaje_avance || 0); return <button onClick={onClick} className={`w-full rounded-xl border p-4 text-left transition-all ${active ? 'border-accent bg-[#2b1710] text-white shadow-lg' : 'border-border bg-background hover:border-accent/50'}`}><div className="flex items-center justify-between gap-3"><span className={`text-[9px] font-bold uppercase tracking-[0.18em] ${active ? 'text-[#d7a24a]' : 'text-accent'}`}>Fase {index + 1} · {phase.peso_porcentaje || 0}% peso</span><strong className="text-sm">{progress}%</strong></div><h3 className="mt-2 font-bold">{String(phase.nombre)}</h3><p className={`mt-1 truncate text-xs ${active ? 'text-[#d8cabb]' : 'text-muted'}`}>{responsible}</p><div className={`mt-3 h-1 overflow-hidden rounded-full ${active ? 'bg-white/15' : 'bg-border'}`}><div className="h-full bg-accent" style={{ width: `${progress}%` }} /></div></button>; }
function PhaseHeader({ phase, responsible, canManage, onEdit }: { phase: Row; responsible: string; canManage: boolean; onEdit: () => void }) { return <header className="bg-[#f7f3ee] p-5 md:p-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Fase activa</p><h2 className="mt-2 font-headline-md text-3xl tracking-tight">{String(phase.nombre)}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{String(phase.descripcion || 'Sin descripción registrada.')}</p></div>{canManage && <button onClick={onEdit} className="border border-border bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Configurar fase</button>}</div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><PhaseDatum label="Estado" value={String(phase.estado).replace('_', ' ')} /><PhaseDatum label="Responsable" value={responsible} /><PhaseDatum label="Periodo" value={`${date(phase.fecha_inicio)} — ${date(phase.fecha_fin)}`} /><PhaseDatum label="Peso / avance" value={`${phase.peso_porcentaje || 0}% / ${phase.porcentaje_avance || 0}%`} /></div></header>; }
function PhaseDatum({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white p-3"><span className="text-[9px] font-bold uppercase tracking-widest text-muted">{label}</span><strong className="mt-1 block truncate text-xs capitalize">{value}</strong></div>; }
function PhaseMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border bg-background p-5"><span className="text-[9px] font-bold uppercase tracking-widest text-muted">{label}</span><strong className="mt-2 block text-2xl">{value}</strong></div>; }
function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) { return <div><h2 className="font-headline-md text-2xl tracking-tight">{title}</h2><p className="mt-1 text-sm text-muted">{subtitle}</p></div>; }
function Metric({ label, value, helper }: { label: string; value: string; helper: string }) { return <div className="rounded-2xl border border-border bg-card p-6"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{label}</span><strong className="mt-3 block text-4xl font-light tracking-tight">{value}</strong><p className="mt-2 text-sm text-muted">{helper}</p></div>; }
function Person({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-background p-4"><span className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div>; }
function Badge({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ead8c6]">{children}</span>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">{text}</div>; }
function List({ rows, render, empty }: { rows: Row[]; render: (row: Row) => React.ReactNode; empty: string }) { return rows.length ? <div className="space-y-3">{rows.map(render)}</div> : <Empty text={empty} />; }
function RecordCard({ title, description, badges, actions }: { title: string; description: string; badges: string[]; actions?: React.ReactNode }) { return <article className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4 lg:flex-row lg:items-center lg:justify-between"><div><strong className="capitalize">{title}</strong><p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p></div><div className="flex flex-wrap items-center gap-2">{badges.map((badge, index) => <span key={`${badge}-${index}`} className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">{badge}</span>)}{actions}</div></article>; }
function MiniButton({ children, danger, onClick }: { children: React.ReactNode; danger?: boolean; onClick: () => void }) { return <button onClick={onClick} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${danger ? 'bg-red-50 text-red-700' : 'bg-[#2f5d3a]/10 text-[#2f5d3a]'}`}>{children}</button>; }
function ReviewActions({ onReview }: { onReview: (action: string) => void }) { return <div className="flex flex-wrap gap-2"><MiniButton onClick={() => onReview('aprobar')}>Aprobar</MiniButton><MiniButton danger onClick={() => onReview('rechazar')}>Rechazar</MiniButton><MiniButton onClick={() => onReview('correccion')}>Corregir</MiniButton></div>; }
function FileList({ rows, canManage, canReview, onReview, onArchive }: { rows: Row[]; canManage: boolean; canReview: boolean; onReview: (kind: 'archivos' | 'avances', id: number, action: string) => void; onArchive: (kind: string, id: number) => void }) { return <List rows={rows} empty="No hay archivos en esta fase." render={item => <RecordCard key={Number(item.id)} title={String(item.titulo)} description={`${item.tipo} · ${item.nombre_original || ''} · ${date(item.created_at)}`} badges={[String(item.estado)]} actions={<><a href={apiAssetUrl(String(item.archivo_url))} target="_blank" className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">Abrir</a>{canReview && <ReviewActions onReview={action => onReview('archivos', Number(item.id), action)} />}{canManage && <MiniButton danger onClick={() => onArchive('archivos', Number(item.id))}>Archivar</MiniButton>}</>} />} />; }

function DynamicField({ field, members = [] }: { field: { name: string; label: string; type?: string; options?: string[]; required?: boolean }; members?: Array<{ id: string | number | null; label: string | number | null }> }) {
  const shared = { name: field.name, required: field.required, className: 'form-control' };
  let control: React.ReactNode;
  if (field.type === 'textarea') control = <textarea {...shared} rows={3} />;
  else if (field.type === 'select') control = <select {...shared}>{field.options?.map(option => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}</select>;
  else if (field.type === 'member') control = <select {...shared}><option value="">Sin responsable</option>{members.map(member => <option key={String(member.id)} value={String(member.id)}>{String(member.label)}</option>)}</select>;
  else control = <input {...shared} type={field.type || 'text'} min={field.type === 'number' ? 0 : undefined} max={field.name.includes('porcentaje') ? 100 : undefined} step={field.name === 'monto' || field.name === 'impacto_costo' ? '0.01' : undefined} defaultValue={field.name === 'moneda' ? 'USD' : undefined} />;
  return <label className={field.type === 'textarea' ? 'md:col-span-2' : ''}><FieldLabel>{field.label}</FieldLabel>{control}</label>;
}

function FieldLabel({ children }: { children: React.ReactNode }) { return <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted">{children}</span>; }
function memberName(id: string | number | null, members: Array<{ id: string | number | null; label: string | number | null }>) { return String(members.find(member => Number(member.id) === Number(id))?.label || 'Sin responsable'); }
function weightedProgress(phases: Row[]) { if (!phases.length) return 0; const totalWeight = phases.reduce((sum, phase) => sum + Number(phase.peso_porcentaje || 0), 0); if (!totalWeight) return Math.round(phases.reduce((sum, phase) => sum + Number(phase.porcentaje_avance || 0), 0) / phases.length); return Math.round(phases.reduce((sum, phase) => sum + Number(phase.porcentaje_avance || 0) * Number(phase.peso_porcentaje || 0), 0) / totalWeight); }
function financeSummary(rows: Row[]) { const summary: Record<string, number> = { presupuesto: 0, compromiso: 0, gasto: 0, ingreso: 0, ajuste: 0, saldo_estimado: 0 }; rows.forEach(item => { if (!['rechazado', 'archivado'].includes(String(item.estado))) summary[String(item.tipo)] += Number(item.monto || 0); }); summary.saldo_estimado = summary.presupuesto + summary.ingreso + summary.ajuste - summary.compromiso - summary.gasto; return summary; }
function phaseTabTitle(tab: PhaseTab) { return ({ tareas: 'Tareas de la fase', avances: 'Bitácora y comentarios', documentos: 'Archivos de la fase', evidencias: 'Evidencias visuales', riesgos: 'Riesgos y problemas', decisiones: 'Decisiones y cambios', reuniones: 'Reuniones y acuerdos', finanzas: 'Finanzas de la fase', auditoria: 'Auditoría de la fase', resumen: 'Resumen' })[tab]; }
function phaseTabSubtitle(tab: PhaseTab) { return ({ tareas: 'Actividades, responsables y vencimientos.', avances: 'Actualizaciones de campo y revisión institucional.', documentos: 'Informes, actas y documentos relacionados.', evidencias: 'Registro fotográfico contextualizado.', riesgos: 'Amenazas, incidencias y planes de respuesta.', decisiones: 'Acuerdos e impactos trazables.', reuniones: 'Minutas, participantes y próximos pasos.', finanzas: 'Presupuesto y movimientos de esta etapa.', auditoria: 'Historial de acciones realizadas en esta fase.', resumen: '' })[tab]; }
function readFile(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); }); }
function date(value: unknown) { return value ? new Intl.DateTimeFormat('es-PA', { dateStyle: 'medium' }).format(new Date(String(value))) : 'Por definir'; }
function dateTime(value: unknown) { return value ? new Intl.DateTimeFormat('es-PA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(String(value))) : ''; }
function money(value: unknown) { return new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD' }).format(Number(value || 0)); }
function healthColor(value: string) { return value === 'rojo' ? 'bg-red-500' : value === 'amarillo' ? 'bg-amber-400' : 'bg-emerald-500'; }

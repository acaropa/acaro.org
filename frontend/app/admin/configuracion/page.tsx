'use client';

import { AppIcon } from "@/components/ui/AppIcon"

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { LandingMetadataItem, defaultLandingSettings } from '@/lib/settings';

type SettingsTab = 'institucion' | 'documentos' | 'contenido' | 'seguridad';

type AdminSettings = {
  institutionName: string;
  shortName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  facebook: string;
  instagram: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  defaultDocumentLogo: string;
  defaultSignerAcaro: string;
  defaultSignerAcaroRole: string;
  defaultSignerTechnical: string;
  defaultSignerTechnicalRole: string;
  defaultApprovalText: string;
  defaultPreparedBy: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  featuredProjectsLimit: number;
  latestNewsLimit: number;
  publicContactEmail: string;
  landingMetadata: LandingMetadataItem[];
  requireNewsApproval: boolean;
  requireLibraryReview: boolean;
  sessionMinutes: number;
  passwordMinLength: number;
  loginAttemptLimit: number;
  notifyPendingDocuments: boolean;
  notifyPendingNews: boolean;
};

const STORAGE_KEY = 'acaro_admin_settings';

const defaultSettings: AdminSettings = {
  institutionName: 'Asociacion Cafe Robusta OBC',
  shortName: 'ACARO',
  description: 'Organizacion dedicada al desarrollo del cafe robusta en Panama Oeste.',
  email: 'info@acaro.org',
  phone: '',
  address: 'Panama Oeste, Panama',
  website: 'https://acaro.org',
  facebook: '',
  instagram: '',
  logoUrl: '/assets/logos/logo1.png',
  primaryColor: '#2B1710',
  accentColor: '#C28A3A',
  defaultDocumentLogo: '/assets/logos/logo1.png',
  defaultSignerAcaro: '',
  defaultSignerAcaroRole: 'Representante de ACARO',
  defaultSignerTechnical: '',
  defaultSignerTechnicalRole: 'Equipo Tecnico ACARO',
  defaultApprovalText:
    'El presente documento sirve como referencia para la organizacion y desarrollo de la actividad descrita.',
  defaultPreparedBy: '',
  heroTitle: 'Asociacion Cafe Robusta OBC',
  heroSubtitle:
    'Impulsamos el desarrollo del cafe robusta con organizacion, conocimiento tecnico y vision productiva.',
  heroImage: '/assets/landing-hero-v2.jpg',
  featuredProjectsLimit: 3,
  latestNewsLimit: 3,
  publicContactEmail: 'info@acaro.org',
  landingMetadata: defaultLandingSettings.metadata,
  requireNewsApproval: true,
  requireLibraryReview: true,
  sessionMinutes: 120,
  passwordMinLength: 8,
  loginAttemptLimit: 5,
  notifyPendingDocuments: true,
  notifyPendingNews: true,
};

const tabs: Array<{ id: SettingsTab; label: string; icon: string; description: string }> = [
  {
    id: 'institucion',
    label: 'Institucion',
    icon: 'corporate_fare',
    description: 'Datos oficiales, identidad visual y contacto.',
  },
  {
    id: 'documentos',
    label: 'Documentos',
    icon: 'contract_edit',
    description: 'Valores por defecto para notas conceptuales y PDFs.',
  },
  {
    id: 'contenido',
    label: 'Contenido publico',
    icon: 'web',
    description: 'Ajustes generales para landing, noticias y destacados.',
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    icon: 'admin_panel_settings',
    description: 'Revision, sesiones, acceso y notificaciones.',
  },
];

const inputClass =
  'w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary';

function loadSettings(): AdminSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function settingPreview(settings: AdminSettings) {
  return [
    { label: 'Organizacion', value: settings.shortName || settings.institutionName },
    { label: 'Correo', value: settings.email || 'Sin correo' },
    { label: 'Documento', value: settings.defaultSignerAcaro || 'Firmante pendiente' },
    { label: 'Sesion', value: `${settings.sessionMinutes} min` },
  ];
}

export default function AdminConfiguracion() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('institucion');
  const [settings, setSettings] = useState<AdminSettings>(loadSettings);
  const [saved, setSaved] = useState(false);
  const preview = useMemo(() => settingPreview(settings), [settings]);
  const active = tabs.find(tab => tab.id === activeTab) || tabs[0];

  useEffect(() => {
    api.get<Partial<{ heroTitle: string; heroSubtitle: string; heroImage: string; metadata: LandingMetadataItem[] }>>('/settings/landing')
      .then(data => {
        setSettings(current => ({
          ...current,
          heroTitle: data.heroTitle || current.heroTitle,
          heroSubtitle: data.heroSubtitle || current.heroSubtitle,
          heroImage: data.heroImage || current.heroImage,
          landingMetadata: Array.isArray(data.metadata) ? data.metadata : current.landingMetadata,
        }));
      })
      .catch(() => {});
  }, []);

  function update<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setSettings(current => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function saveSettings() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    void api.put('/settings/landing', {
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      heroImage: settings.heroImage,
      metadata: settings.landingMetadata,
    }).catch(() => {});
    setSaved(true);
  }

  function restoreDefaults() {
    setSettings(defaultSettings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    setSaved(true);
  }

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="font-label-caps text-[11px] uppercase tracking-[0.22em] text-accent">Administracion</p>
            <h1 className="mt-3 font-headline-lg text-[40px] leading-tight tracking-tight text-foreground md:text-[56px]">
              Configuracion
            </h1>
            <p className="mt-3 font-body-lg text-[16px] text-muted md:text-[18px]">
              Define valores institucionales, plantillas y reglas operativas que sirven de base para la plataforma.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={restoreDefaults}
              className="border border-border px-5 py-3 font-label-caps text-label-caps uppercase tracking-widest text-foreground transition-colors hover:bg-surface"
            >
              Restaurar
            </button>
            <button
              type="button"
              onClick={saveSettings}
              className="bg-primary px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent"
            >
              Guardar ajustes
            </button>
          </div>
        </div>
      </section>

      {saved && (
        <div className="rounded-lg border border-[#d8cabb] bg-white px-4 py-3 text-sm font-medium text-[#5a3424]">
          Ajustes guardados en este navegador. Cuando exista API de configuracion, estos mismos campos se pueden sincronizar con la base de datos.
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-muted">Secciones</span>
            <div className="mt-4 space-y-2">
              {tabs.map(tab => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-surface'
                    }`}
                  >
                    <AppIcon name={tab.icon} className="mt-0.5 text-[20px]" />
                    <span>
                      <span className="block text-sm font-bold">{tab.label}</span>
                      <span className={`mt-1 block text-xs leading-5 ${isActive ? 'text-primary-foreground/75' : 'text-muted'}`}>
                        {tab.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-muted">Resumen</span>
            <div className="mt-4 space-y-3">
              {preview.map(item => (
                <div key={item.label} className="border-t border-border pt-3">
                  <span className="block text-[11px] font-bold uppercase tracking-widest text-muted">{item.label}</span>
                  <span className="mt-1 block text-sm text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <AppIcon name={active.icon} className="text-[24px] text-accent" />
              <div>
                <h2 className="font-headline-md text-2xl text-foreground">{active.label}</h2>
                <p className="mt-1 text-sm text-muted">{active.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'institucion' && <InstitutionSettings settings={settings} update={update} />}
            {activeTab === 'documentos' && <DocumentSettings settings={settings} update={update} />}
            {activeTab === 'contenido' && <ContentSettings settings={settings} update={update} />}
            {activeTab === 'seguridad' && <SecuritySettings settings={settings} update={update} />}
          </div>
        </main>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-label-caps text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-label-caps text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <textarea value={value} rows={rows} onChange={event => onChange(event.target.value)} className={`${inputClass} resize-y`} />
    </label>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-border px-4 py-4 text-left transition-colors hover:bg-surface"
    >
      <span>
        <span className="block text-sm font-bold text-foreground">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </button>
  );
}

function InstitutionSettings({ settings, update }: SettingsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Field label="Nombre oficial" value={settings.institutionName} onChange={value => update('institutionName', value)} />
      <Field label="Nombre corto" value={settings.shortName} onChange={value => update('shortName', value)} />
      <div className="md:col-span-2">
        <TextArea label="Descripcion institucional" value={settings.description} onChange={value => update('description', value)} />
      </div>
      <Field label="Correo institucional" value={settings.email} onChange={value => update('email', value)} type="email" />
      <Field label="Telefono" value={settings.phone} onChange={value => update('phone', value)} />
      <Field label="Direccion" value={settings.address} onChange={value => update('address', value)} />
      <Field label="Sitio web" value={settings.website} onChange={value => update('website', value)} />
      <Field label="Facebook" value={settings.facebook} onChange={value => update('facebook', value)} />
      <Field label="Instagram" value={settings.instagram} onChange={value => update('instagram', value)} />
      <Field label="Logo principal" value={settings.logoUrl} onChange={value => update('logoUrl', value)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Color principal" value={settings.primaryColor} onChange={value => update('primaryColor', value)} type="color" />
        <Field label="Color acento" value={settings.accentColor} onChange={value => update('accentColor', value)} type="color" />
      </div>
    </div>
  );
}

function DocumentSettings({ settings, update }: SettingsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Field label="Logo para documentos" value={settings.defaultDocumentLogo} onChange={value => update('defaultDocumentLogo', value)} />
      <Field label="Documento realizado por" value={settings.defaultPreparedBy} onChange={value => update('defaultPreparedBy', value)} />
      <Field label="Firmante ACARO" value={settings.defaultSignerAcaro} onChange={value => update('defaultSignerAcaro', value)} />
      <Field label="Cargo firmante ACARO" value={settings.defaultSignerAcaroRole} onChange={value => update('defaultSignerAcaroRole', value)} />
      <Field label="Firmante tecnico" value={settings.defaultSignerTechnical} onChange={value => update('defaultSignerTechnical', value)} />
      <Field label="Cargo firmante tecnico" value={settings.defaultSignerTechnicalRole} onChange={value => update('defaultSignerTechnicalRole', value)} />
      <div className="md:col-span-2">
        <TextArea label="Texto de aprobacion por defecto" value={settings.defaultApprovalText} onChange={value => update('defaultApprovalText', value)} rows={5} />
      </div>
      <Toggle
        label="Revision de biblioteca"
        description="Mantener documentos nuevos en revision antes de quedar visibles."
        checked={settings.requireLibraryReview}
        onChange={value => update('requireLibraryReview', value)}
      />
      <Toggle
        label="Aprobacion de noticias"
        description="Exigir revision antes de publicar noticias creadas por usuarios internos."
        checked={settings.requireNewsApproval}
        onChange={value => update('requireNewsApproval', value)}
      />
    </div>
  );
}

function ContentSettings({ settings, update }: SettingsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Field label="Titulo del hero" value={settings.heroTitle} onChange={value => update('heroTitle', value)} />
      <Field label="Imagen principal" value={settings.heroImage} onChange={value => update('heroImage', value)} />
      <div className="md:col-span-2">
        <TextArea label="Texto del hero" value={settings.heroSubtitle} onChange={value => update('heroSubtitle', value)} />
      </div>
      <Field
        label="Proyectos destacados"
        value={settings.featuredProjectsLimit}
        type="number"
        onChange={value => update('featuredProjectsLimit', Number(value))}
      />
      <Field
        label="Noticias recientes"
        value={settings.latestNewsLimit}
        type="number"
        onChange={value => update('latestNewsLimit', Number(value))}
      />
      <Field label="Correo publico de contacto" value={settings.publicContactEmail} onChange={value => update('publicContactEmail', value)} type="email" />
      <div className="md:col-span-2 border-t border-border pt-6">
        <h3 className="font-headline-md text-xl text-foreground">Barra institucional del landing</h3>
        <p className="mt-1 text-sm text-muted">Estos datos aparecen debajo del hero principal.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {settings.landingMetadata.slice(0, 4).map((item, index) => (
            <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border border-border p-4 md:grid-cols-2">
              <Field
                label={`Etiqueta ${index + 1}`}
                value={item.label}
                onChange={value => {
                  const next = [...settings.landingMetadata];
                  next[index] = { ...next[index], label: value };
                  update('landingMetadata', next);
                }}
              />
              <Field
                label={`Valor ${index + 1}`}
                value={item.value}
                onChange={value => {
                  const next = [...settings.landingMetadata];
                  next[index] = { ...next[index], value };
                  update('landingMetadata', next);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecuritySettings({ settings, update }: SettingsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Field
        label="Duracion de sesion en minutos"
        value={settings.sessionMinutes}
        type="number"
        onChange={value => update('sessionMinutes', Number(value))}
      />
      <Field
        label="Longitud minima de contrasena"
        value={settings.passwordMinLength}
        type="number"
        onChange={value => update('passwordMinLength', Number(value))}
      />
      <Field
        label="Intentos de acceso"
        value={settings.loginAttemptLimit}
        type="number"
        onChange={value => update('loginAttemptLimit', Number(value))}
      />
      <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Toggle
          label="Notificar documentos pendientes"
          description="Mostrar alertas internas cuando biblioteca tenga documentos por revisar."
          checked={settings.notifyPendingDocuments}
          onChange={value => update('notifyPendingDocuments', value)}
        />
        <Toggle
          label="Notificar noticias pendientes"
          description="Mostrar alertas internas cuando existan noticias por aprobar."
          checked={settings.notifyPendingNews}
          onChange={value => update('notifyPendingNews', value)}
        />
      </div>
    </div>
  );
}

type SettingsProps = {
  settings: AdminSettings;
  update: <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => void;
};

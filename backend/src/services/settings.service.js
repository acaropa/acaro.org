const db = require('../config/db');
const cache = require('../utils/memoryCache');
const { saveBase64Upload, IMAGE_EXTENSIONS } = require('../utils/uploads');

const PUBLIC_TTL_MS = 300 * 1000;

const DEFAULT_LANDING_SETTINGS = {
  heroTitle: 'Asociacion Cafe Robusta OBC',
  heroSubtitle: 'Impulsamos el desarrollo del cafe robusta con organizacion, conocimiento tecnico y vision productiva.',
  heroImage: '/assets/landing-hero-v2.jpg',
  metadata: [
    { label: 'Altitud Promedio', value: '0 - 800 msnm' },
    { label: 'Precipitacion Anual', value: '2,000 - 3,000 mm' },
    { label: 'Variedades', value: 'Coffea canephora' },
    { label: 'Estandar de Calidad', value: 'OBC Premium' },
  ],
};

function parseValue(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function getSetting(key) {
  return cache.getOrSet(
    `settings:${key}`,
    async () => {
      const [rows] = await db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', [key]);
      return parseValue(rows[0]?.setting_value);
    },
    PUBLIC_TTL_MS
  );
}

async function getLanding() {
  const value = await getSetting('landing');
  return { ...DEFAULT_LANDING_SETTINGS, ...(value || {}) };
}

async function updateLanding(data, user) {
  const next = {
    heroTitle: String(data.heroTitle || DEFAULT_LANDING_SETTINGS.heroTitle).trim(),
    heroSubtitle: String(data.heroSubtitle || DEFAULT_LANDING_SETTINGS.heroSubtitle).trim(),
    heroImage: String(data.heroImage || DEFAULT_LANDING_SETTINGS.heroImage).trim(),
    metadata: Array.isArray(data.metadata)
      ? data.metadata
          .map(item => ({
            label: String(item?.label || '').trim(),
            value: String(item?.value || '').trim(),
          }))
          .filter(item => item.label && item.value)
          .slice(0, 6)
      : DEFAULT_LANDING_SETTINGS.metadata,
  };

  await db.query(
    `INSERT INTO site_settings (setting_key, setting_value, updated_by)
     VALUES ('landing', ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
    [JSON.stringify(next), user?.id || null]
  );
  cache.invalidatePrefix('settings:');
  return next;
}

const DEFAULT_LIBRARY_THEMES = {
  Institucional: null,
  Proyectos: null,
  Formacion: null,
  'Guias tecnicas': null,
};

async function getLibraryThemes() {
  const value = await getSetting('library_themes');
  return { ...DEFAULT_LIBRARY_THEMES, ...(value || {}) };
}

async function updateLibraryThemes(data, user) {
  const allowed = new Set(Object.keys(DEFAULT_LIBRARY_THEMES));
  const current = await getLibraryThemes();
  const next = { ...current };

  for (const [key, val] of Object.entries(data)) {
    if (!allowed.has(key)) continue;
    if (val === null) {
      next[key] = null;
    } else if (val && typeof val === 'object' && val.base64 && val.fileName) {
      const result = await saveBase64Upload({
        base64: val.base64,
        fileName: val.fileName,
        subdir: 'settings',
        maxBytes: 8 * 1024 * 1024,
        allowedExtensions: IMAGE_EXTENSIONS,
      });
      next[key] = result.url;
    } else if (typeof val === 'string') {
      next[key] = val.trim() || null;
    }
  }

  await db.query(
    `INSERT INTO site_settings (setting_key, setting_value, updated_by)
     VALUES ('library_themes', ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
    [JSON.stringify(next), user?.id || null]
  );
  cache.invalidatePrefix('settings:');
  return next;
}

module.exports = {
  DEFAULT_LANDING_SETTINGS,
  getLanding,
  updateLanding,
  DEFAULT_LIBRARY_THEMES,
  getLibraryThemes,
  updateLibraryThemes,
};

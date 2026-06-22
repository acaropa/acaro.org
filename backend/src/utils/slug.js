const db = require('../config/db');

const SLUGGABLE_TABLES = new Set(['noticias', 'biblioteca', 'proyectos', 'productores', 'encuestas']);

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

async function generateUniqueSlug(table, baseText, excludeId = null) {
  if (!SLUGGABLE_TABLES.has(table)) {
    throw new Error(`Tabla no permitida para slugs: ${table}`);
  }
  const base = slugify(baseText) || 'item';
  let slug = base;
  let counter = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [rows] = excludeId
      ? await db.query(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`, [slug, excludeId])
      : await db.query(`SELECT id FROM ${table} WHERE slug = ?`, [slug]);
    if (!rows.length) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}

module.exports = { slugify, generateUniqueSlug };

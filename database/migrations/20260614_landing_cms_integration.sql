USE acaro_db;

-- ─────────────────────────────────────────
-- NOTICIAS: slug, categoria, imagen_portada, nuevo estado "pendiente"
-- ─────────────────────────────────────────
ALTER TABLE noticias
  ADD COLUMN slug VARCHAR(220) NULL AFTER titulo,
  ADD COLUMN categoria VARCHAR(100) NOT NULL DEFAULT 'General' AFTER contenido,
  ADD COLUMN imagen_portada VARCHAR(500) NULL AFTER categoria,
  MODIFY estado ENUM('borrador','pendiente','publicada','archivada') NOT NULL DEFAULT 'borrador';

-- ─────────────────────────────────────────
-- BIBLIOTECA: slug
-- ─────────────────────────────────────────
ALTER TABLE biblioteca
  ADD COLUMN slug VARCHAR(220) NULL AFTER titulo;

-- ─────────────────────────────────────────
-- PROYECTOS: slug, imagen_portada
-- ─────────────────────────────────────────
ALTER TABLE proyectos
  ADD COLUMN slug VARCHAR(220) NULL AFTER nombre,
  ADD COLUMN imagen_portada VARCHAR(500) NULL AFTER clasificacion;

-- ─────────────────────────────────────────
-- Backfill de slugs para filas existentes
-- (normaliza acentos comunes, minúsculas, guiones)
-- ─────────────────────────────────────────
UPDATE noticias
SET slug = COALESCE(NULLIF(TRIM(BOTH '-' FROM
  REGEXP_REPLACE(
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      LOWER(titulo),
    'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u'),'ñ','n'),'ü','u'),
  '[^a-z0-9]+', '-')
), ''), CONCAT('noticia-', id))
WHERE slug IS NULL;

UPDATE noticias n
JOIN noticias n2 ON n2.slug = n.slug AND n2.id < n.id
SET n.slug = CONCAT(n.slug, '-', n.id);

ALTER TABLE noticias
  ADD UNIQUE INDEX uq_noticias_slug (slug);

UPDATE biblioteca
SET slug = COALESCE(NULLIF(TRIM(BOTH '-' FROM
  REGEXP_REPLACE(
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      LOWER(titulo),
    'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u'),'ñ','n'),'ü','u'),
  '[^a-z0-9]+', '-')
), ''), CONCAT('documento-', id))
WHERE slug IS NULL;

UPDATE biblioteca b
JOIN biblioteca b2 ON b2.slug = b.slug AND b2.id < b.id
SET b.slug = CONCAT(b.slug, '-', b.id);

ALTER TABLE biblioteca
  ADD UNIQUE INDEX uq_biblioteca_slug (slug);

UPDATE proyectos
SET slug = COALESCE(NULLIF(TRIM(BOTH '-' FROM
  REGEXP_REPLACE(
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      LOWER(nombre),
    'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u'),'ñ','n'),'ü','u'),
  '[^a-z0-9]+', '-')
), ''), CONCAT('proyecto-', id))
WHERE slug IS NULL;

UPDATE proyectos p
JOIN proyectos p2 ON p2.slug = p.slug AND p2.id < p.id
SET p.slug = CONCAT(p.slug, '-', p.id);

ALTER TABLE proyectos
  ADD UNIQUE INDEX uq_proyectos_slug (slug);

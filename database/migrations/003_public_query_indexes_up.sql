-- =============================================================
-- ACARO OBC — Migracion 003: Indices para consultas públicas
-- Base de datos: u271420828_acaro_db
-- Ejecutar en: phpMyAdmin de Hostinger (pestaña SQL)
-- Fecha: 2026-06-27
--
-- Propósito: Agregar índices en tablas existentes (noticias,
-- proyectos, biblioteca, productores) para acelerar los queries
-- de lectura pública más frecuentes.
--
-- Prerequisito: schema.sql aplicado (tablas base existentes).
-- Rollback: ejecutar 003_public_query_indexes_down.sql
-- =============================================================

USE u271420828_acaro_db;

-- ─── noticias ────────────────────────────────────────────────
-- WHERE estado = 'publicada' AND visibilidad = 'publica'
CREATE INDEX IF NOT EXISTS idx_noticias_estado_vis
  ON noticias(estado, visibilidad);

-- ORDER BY COALESCE(fecha_publicacion, fecha_creacion) DESC
-- Mejora el sort del listado público
CREATE INDEX IF NOT EXISTS idx_noticias_fecha_pub
  ON noticias(fecha_publicacion);

-- ─── proyectos ───────────────────────────────────────────────
-- WHERE tipo = 'publico' AND estado != 'cancelado'
CREATE INDEX IF NOT EXISTS idx_proyectos_tipo_estado
  ON proyectos(tipo, estado);

-- ─── biblioteca ──────────────────────────────────────────────
-- WHERE estado = 'aprobado' AND visibilidad = 'publica'
CREATE INDEX IF NOT EXISTS idx_biblioteca_estado_vis
  ON biblioteca(estado, visibilidad);

-- WHERE serie = ? AND estado = 'aprobado' AND visibilidad = 'publica'
-- ORDER BY orden_lectura ASC
CREATE INDEX IF NOT EXISTS idx_biblioteca_serie_estado_vis
  ON biblioteca(serie, estado, visibilidad);

-- ─── productores ─────────────────────────────────────────────
-- WHERE activo = TRUE ORDER BY destacado DESC, created_at DESC
CREATE INDEX IF NOT EXISTS idx_productores_activo_destacado
  ON productores(activo, destacado);

-- =============================================================
-- ACARO OBC — Migracion 003: Rollback de índices públicos
-- =============================================================

USE u271420828_acaro_db;

DROP INDEX IF EXISTS idx_noticias_estado_vis     ON noticias;
DROP INDEX IF EXISTS idx_noticias_fecha_pub      ON noticias;
DROP INDEX IF EXISTS idx_proyectos_tipo_estado   ON proyectos;
DROP INDEX IF EXISTS idx_biblioteca_estado_vis   ON biblioteca;
DROP INDEX IF EXISTS idx_biblioteca_serie_estado_vis ON biblioteca;
DROP INDEX IF EXISTS idx_productores_activo_destacado ON productores;

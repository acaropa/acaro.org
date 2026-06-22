-- Migration: Add etiquetas, serie, and orden_lectura to biblioteca
-- Run this against the production/dev database

ALTER TABLE biblioteca
  ADD COLUMN etiquetas JSON DEFAULT NULL AFTER imagen_portada,
  ADD COLUMN serie VARCHAR(200) DEFAULT NULL AFTER etiquetas,
  ADD COLUMN orden_lectura SMALLINT UNSIGNED DEFAULT NULL AFTER serie;

CREATE INDEX idx_biblioteca_serie ON biblioteca(serie);

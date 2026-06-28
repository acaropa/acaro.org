-- Biblioteca: portada editorial y busqueda filtrada
-- Agrega control manual de destacados para la portada publica.

ALTER TABLE biblioteca
  ADD COLUMN destacado BOOLEAN NOT NULL DEFAULT FALSE AFTER orden_lectura,
  ADD COLUMN orden_portada SMALLINT UNSIGNED DEFAULT NULL AFTER destacado;

CREATE INDEX idx_biblioteca_portada
  ON biblioteca(estado, visibilidad, destacado, orden_portada, fecha_creacion);

CREATE INDEX idx_biblioteca_categoria_fecha
  ON biblioteca(categoria, fecha_creacion);

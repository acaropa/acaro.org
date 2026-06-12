USE acaro_db;

ALTER TABLE proyectos
  ADD COLUMN supervisor_id INT UNSIGNED NULL AFTER responsable_id,
  ADD CONSTRAINT fk_proyectos_supervisor
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS supervisor_tecnicos (
  supervisor_id INT UNSIGNED NOT NULL,
  tecnico_id INT UNSIGNED NOT NULL UNIQUE,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (supervisor_id, tecnico_id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE biblioteca
  ADD COLUMN archivo_url VARCHAR(1000) NULL AFTER descripcion,
  ADD COLUMN categoria VARCHAR(150) NULL AFTER archivo_url,
  ADD COLUMN estado ENUM(
    'borrador',
    'pendiente_revision',
    'requiere_correccion',
    'aprobado',
    'rechazado',
    'archivado'
  ) NOT NULL DEFAULT 'aprobado' AFTER categoria,
  ADD COLUMN visibilidad ENUM('publica','interna') NOT NULL DEFAULT 'publica' AFTER estado,
  ADD COLUMN creado_por INT UNSIGNED NULL AFTER visibilidad,
  ADD COLUMN revisado_por INT UNSIGNED NULL AFTER creado_por,
  ADD COLUMN fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER revisado_por,
  ADD COLUMN fecha_revision TIMESTAMP NULL AFTER fecha_creacion,
  ADD COLUMN observacion_revision TEXT NULL AFTER fecha_revision;

UPDATE biblioteca
SET archivo_url = link,
    categoria = 'General',
    estado = IF(activo = TRUE, 'aprobado', 'archivado'),
    visibilidad = 'publica',
    creado_por = (SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1),
    revisado_por = (SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1),
    fecha_revision = created_at
WHERE archivo_url IS NULL;

ALTER TABLE biblioteca
  MODIFY archivo_url VARCHAR(1000) NOT NULL,
  MODIFY categoria VARCHAR(150) NOT NULL,
  MODIFY creado_por INT UNSIGNED NOT NULL,
  DROP COLUMN autor,
  DROP COLUMN fecha,
  DROP COLUMN link,
  DROP COLUMN activo,
  DROP COLUMN created_at,
  ADD CONSTRAINT fk_biblioteca_creador
    FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_biblioteca_revisor
    FOREIGN KEY (revisado_por) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS noticias (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  resumen TEXT DEFAULT NULL,
  contenido LONGTEXT NOT NULL,
  estado ENUM('borrador','publicada','archivada') NOT NULL DEFAULT 'borrador',
  visibilidad ENUM('publica','interna') NOT NULL DEFAULT 'publica',
  creado_por INT UNSIGNED NOT NULL,
  publicado_por INT UNSIGNED DEFAULT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_publicacion TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (publicado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

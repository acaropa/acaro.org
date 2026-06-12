-- ACARO OBC - Migracion para la base existente de Hostinger.
-- Base esperada: u271420828_acaro_db
-- Selecciona esa base en phpMyAdmin antes de importar este archivo.
-- Ejecutar una sola vez y conservar un respaldo previo.

SET @acaro_admin_id := (
  SELECT id
  FROM users
  WHERE role = 'admin' AND activo = 1
  ORDER BY id
  LIMIT 1
);

ALTER TABLE proyectos
  ADD COLUMN supervisor_id INT(10) UNSIGNED NULL AFTER responsable_id,
  ADD KEY idx_proyectos_supervisor_id (supervisor_id),
  ADD CONSTRAINT fk_proyectos_supervisor
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE supervisor_tecnicos (
  supervisor_id INT(10) UNSIGNED NOT NULL,
  tecnico_id INT(10) UNSIGNED NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (supervisor_id, tecnico_id),
  UNIQUE KEY uq_supervisor_tecnicos_tecnico (tecnico_id),
  KEY idx_supervisor_tecnicos_supervisor (supervisor_id),
  CONSTRAINT fk_supervisor_tecnicos_supervisor
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_supervisor_tecnicos_tecnico
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
  ADD COLUMN visibilidad ENUM('publica','interna')
    NOT NULL DEFAULT 'publica' AFTER estado,
  ADD COLUMN creado_por INT(10) UNSIGNED NULL AFTER visibilidad,
  ADD COLUMN revisado_por INT(10) UNSIGNED NULL AFTER creado_por,
  ADD COLUMN fecha_creacion TIMESTAMP
    NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER revisado_por,
  ADD COLUMN fecha_revision TIMESTAMP NULL DEFAULT NULL AFTER fecha_creacion,
  ADD COLUMN observacion_revision TEXT NULL AFTER fecha_revision;

UPDATE biblioteca
SET archivo_url = link,
    categoria = 'General',
    estado = IF(activo = 1, 'aprobado', 'archivado'),
    visibilidad = 'publica',
    creado_por = @acaro_admin_id,
    revisado_por = @acaro_admin_id,
    fecha_creacion = created_at,
    fecha_revision = created_at
WHERE archivo_url IS NULL;

ALTER TABLE biblioteca
  MODIFY archivo_url VARCHAR(1000) NOT NULL,
  MODIFY categoria VARCHAR(150) NOT NULL,
  MODIFY creado_por INT(10) UNSIGNED NOT NULL,
  ADD KEY idx_biblioteca_estado_visibilidad (estado, visibilidad),
  ADD KEY idx_biblioteca_creado_por (creado_por),
  ADD KEY idx_biblioteca_revisado_por (revisado_por),
  ADD CONSTRAINT fk_biblioteca_creador
    FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_biblioteca_revisor
    FOREIGN KEY (revisado_por) REFERENCES users(id) ON DELETE SET NULL,
  DROP COLUMN autor,
  DROP COLUMN fecha,
  DROP COLUMN link,
  DROP COLUMN activo,
  DROP COLUMN created_at;

CREATE TABLE noticias (
  id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  resumen TEXT DEFAULT NULL,
  contenido LONGTEXT NOT NULL,
  estado ENUM('borrador','publicada','archivada')
    NOT NULL DEFAULT 'borrador',
  visibilidad ENUM('publica','interna')
    NOT NULL DEFAULT 'publica',
  creado_por INT(10) UNSIGNED NOT NULL,
  publicado_por INT(10) UNSIGNED DEFAULT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_publicacion TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP
    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_noticias_estado_visibilidad (estado, visibilidad),
  KEY idx_noticias_creado_por (creado_por),
  KEY idx_noticias_publicado_por (publicado_por),
  CONSTRAINT fk_noticias_creador
    FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_noticias_publicador
    FOREIGN KEY (publicado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ACARO OBC - MIGRACION MAPA TERRITORIAL DE CADENA DE VALOR
-- MariaDB 11.8.x / InnoDB / utf8mb4_unicode_ci
-- ============================================================

USE u271420828_acaro_db;

-- 1. Crear tabla de distritos
CREATE TABLE IF NOT EXISTS distritos_panama (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_distrito VARCHAR(10) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_distritos_panama_codigo (codigo_distrito),
  KEY idx_distritos_panama_provincia (provincia),
  KEY idx_distritos_panama_nombre (distrito)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Crear tabla de tipos de actor
CREATE TABLE IF NOT EXISTS tipos_actor (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tipos_actor_codigo (codigo),
  KEY idx_tipos_actor_activo_orden (activo, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Crear tabla de actores cadena de valor
CREATE TABLE IF NOT EXISTS actores_cadena_valor (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(200) NOT NULL,
  tipo_entidad ENUM('persona', 'empresa', 'organizacion', 'institucion') NOT NULL DEFAULT 'persona',
  distrito_id INT UNSIGNED NOT NULL,
  comunidad VARCHAR(150) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_por INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_actores_cadena_distrito (distrito_id),
  KEY idx_actores_cadena_activo_distrito (activo, distrito_id),
  KEY idx_actores_cadena_creado_por (creado_por),
  CONSTRAINT fk_actores_cadena_distrito FOREIGN KEY (distrito_id) REFERENCES distritos_panama(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_actores_cadena_creado_por FOREIGN KEY (creado_por) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Crear tabla pivot actor_tipos
CREATE TABLE IF NOT EXISTS actor_tipos (
  actor_id INT UNSIGNED NOT NULL,
  tipo_actor_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (actor_id, tipo_actor_id),
  KEY idx_actor_tipos_tipo_actor (tipo_actor_id, actor_id),
  CONSTRAINT fk_actor_tipos_actor FOREIGN KEY (actor_id) REFERENCES actores_cadena_valor(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_actor_tipos_tipo FOREIGN KEY (tipo_actor_id) REFERENCES tipos_actor(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Alterar productores para añadir distrito_id
ALTER TABLE productores
  ADD COLUMN distrito_id INT UNSIGNED NULL AFTER comunidad,
  ADD KEY idx_productores_activo_distrito (activo, distrito_id),
  ADD CONSTRAINT fk_productores_distrito FOREIGN KEY (distrito_id) REFERENCES distritos_panama(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- 6. Insertar tipos de actores iniciales
INSERT INTO tipos_actor (codigo, nombre, orden)
VALUES
  ('comercializador', 'Comercializadores', 10),
  ('procesador', 'Procesadores', 20),
  ('viverista', 'Viveristas', 30),
  ('tostador', 'Tostadores', 40),
  ('transportista', 'Transportistas', 50),
  ('proveedor', 'Proveedores', 60),
  ('investigador', 'Investigadores', 70),
  ('institucion', 'Instituciones', 80),
  ('aliado', 'Aliados', 90)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  orden = VALUES(orden);

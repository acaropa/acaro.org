-- ACARO Web — Database Schema
-- Engine: InnoDB | Charset: utf8mb4

CREATE DATABASE IF NOT EXISTS acaro_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE acaro_db;

-- ─────────────────────────────────────────
-- USERS (autenticación y roles)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('admin','supervisor','tecnico','visitante') NOT NULL DEFAULT 'visitante',
  activo        BOOLEAN         NOT NULL DEFAULT TRUE,
  failed_login_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until  DATETIME                 DEFAULT NULL,
  last_failed_login DATETIME             DEFAULT NULL,
  last_login_at DATETIME                 DEFAULT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id            INT UNSIGNED NOT NULL,
  refresh_token_hash CHAR(64) NOT NULL,
  previous_token_hash CHAR(64) DEFAULT NULL,
  rotated_at         DATETIME DEFAULT NULL,
  user_agent         VARCHAR(500) DEFAULT NULL,
  ip_address         VARCHAR(45) DEFAULT NULL,
  expires_at         DATETIME NOT NULL,
  last_used_at       DATETIME DEFAULT NULL,
  revoked_at         DATETIME DEFAULT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_sessions_refresh_hash (refresh_token_hash),
  KEY idx_user_sessions_user_active (user_id, revoked_at, expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- SOCIOS (miembros de la asociación)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS socios (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED             DEFAULT NULL UNIQUE,
  nombre        VARCHAR(100)    NOT NULL,
  apellido      VARCHAR(100)    NOT NULL,
  dni           VARCHAR(20)              DEFAULT NULL UNIQUE,
  telefono      VARCHAR(20)              DEFAULT NULL,
  email         VARCHAR(255)             DEFAULT NULL,
  direccion     VARCHAR(255)             DEFAULT NULL,
  estado        ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
  fecha_ingreso DATE            NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- TECNICOS (perfil extendido del técnico)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tecnicos (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED    NOT NULL UNIQUE,
  nombre        VARCHAR(100)    NOT NULL,
  apellido      VARCHAR(100)    NOT NULL,
  especialidad  VARCHAR(150)             DEFAULT NULL,
  telefono      VARCHAR(20)              DEFAULT NULL,
  disponible    BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- BIBLIOTECA (documentos alojados en la nube)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS biblioteca (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(255)    NOT NULL,
  slug          VARCHAR(220)             DEFAULT NULL,
  descripcion   TEXT                     DEFAULT NULL,
  archivo_url   VARCHAR(1000)   NOT NULL,
  categoria     VARCHAR(150)    NOT NULL,
  imagen_portada VARCHAR(500)            DEFAULT NULL,
  estado        ENUM('borrador','pendiente_revision','requiere_correccion','aprobado','rechazado','archivado') NOT NULL DEFAULT 'pendiente_revision',
  visibilidad   ENUM('publica','interna') NOT NULL DEFAULT 'interna',
  creado_por    INT UNSIGNED    NOT NULL,
  revisado_por  INT UNSIGNED             DEFAULT NULL,
  fecha_creacion TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_revision TIMESTAMP               DEFAULT NULL,
  observacion_revision TEXT               DEFAULT NULL,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
  ,UNIQUE KEY uq_biblioteca_slug (slug)
  ,FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE RESTRICT
  ,FOREIGN KEY (revisado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS noticias (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo          VARCHAR(255) NOT NULL,
  slug            VARCHAR(220) DEFAULT NULL,
  resumen         TEXT DEFAULT NULL,
  contenido       LONGTEXT NOT NULL,
  categoria       VARCHAR(100) NOT NULL DEFAULT 'General',
  imagen_portada  VARCHAR(500) DEFAULT NULL,
  estado          ENUM('borrador','pendiente','publicada','archivada') NOT NULL DEFAULT 'borrador',
  visibilidad     ENUM('publica','interna') NOT NULL DEFAULT 'publica',
  creado_por      INT UNSIGNED NOT NULL,
  publicado_por   INT UNSIGNED DEFAULT NULL,
  fecha_creacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_publicacion TIMESTAMP NULL DEFAULT NULL,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_noticias_slug (slug),
  FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (publicado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- PROYECTOS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proyectos (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(200)    NOT NULL,
  slug            VARCHAR(220)             DEFAULT NULL,
  descripcion     TEXT                     DEFAULT NULL,
  tipo            ENUM('publico','privado') NOT NULL DEFAULT 'publico',
  clasificacion   VARCHAR(100)             DEFAULT NULL,
  imagen_portada  VARCHAR(500)             DEFAULT NULL,
  estado          ENUM('pendiente','en_progreso','completado','cancelado') NOT NULL DEFAULT 'pendiente',
  fecha_inicio    DATE                     DEFAULT NULL,
  fecha_fin       DATE                     DEFAULT NULL,
  responsable_id  INT UNSIGNED             DEFAULT NULL,
  supervisor_id   INT UNSIGNED             DEFAULT NULL,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_proyectos_slug (slug),
  FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS supervisor_tecnicos (
  supervisor_id INT UNSIGNED NOT NULL,
  tecnico_id INT UNSIGNED NOT NULL UNIQUE,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (supervisor_id, tecnico_id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- PROYECTO_TECNICOS (pivot)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proyecto_tecnicos (
  proyecto_id       INT UNSIGNED  NOT NULL,
  tecnico_id        INT UNSIGNED  NOT NULL,
  fecha_asignacion  DATE          NOT NULL,
  PRIMARY KEY (proyecto_id, tecnico_id),
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  FOREIGN KEY (tecnico_id)  REFERENCES tecnicos(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- PROYECTO_FASES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proyecto_fases (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  proyecto_id   INT UNSIGNED    NOT NULL,
  nombre        VARCHAR(200)    NOT NULL,
  descripcion   TEXT                     DEFAULT NULL,
  orden         TINYINT UNSIGNED NOT NULL DEFAULT 1,
  estado        ENUM('pendiente','en_progreso','completado') NOT NULL DEFAULT 'pendiente',
  fecha_inicio  DATE                     DEFAULT NULL,
  fecha_fin     DATE                     DEFAULT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- FASE_IMAGENES (imágenes por fase)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fase_imagenes (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  fase_id     INT UNSIGNED    NOT NULL,
  url         VARCHAR(1000)   NOT NULL,
  descripcion VARCHAR(255)             DEFAULT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
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
  descripcion   TEXT                     DEFAULT NULL,
  autor         VARCHAR(150)    NOT NULL,
  fecha         DATE            NOT NULL,
  link          VARCHAR(1000)   NOT NULL,
  activo        BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- PROYECTOS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proyectos (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(200)    NOT NULL,
  descripcion     TEXT                     DEFAULT NULL,
  tipo            ENUM('publico','privado') NOT NULL DEFAULT 'publico',
  clasificacion   VARCHAR(100)             DEFAULT NULL,
  estado          ENUM('pendiente','en_progreso','completado','cancelado') NOT NULL DEFAULT 'pendiente',
  fecha_inicio    DATE                     DEFAULT NULL,
  fecha_fin       DATE                     DEFAULT NULL,
  responsable_id  INT UNSIGNED             DEFAULT NULL,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE SET NULL
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

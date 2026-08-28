USE acaro_db;

-- ─────────────────────────────────────────
-- PRODUCTORES (perfiles públicos de productores asociados)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productores (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre            VARCHAR(150)    NOT NULL,
  slug              VARCHAR(220)             DEFAULT NULL,
  descripcion       TEXT                     DEFAULT NULL,
  frase_corta       VARCHAR(180)             DEFAULT NULL,
  imagen_url        VARCHAR(500)             DEFAULT NULL,
  imagenes          JSON                     DEFAULT NULL,
  comunidad         VARCHAR(150)             DEFAULT NULL,
  rol               VARCHAR(100)             DEFAULT NULL,
  anios_experiencia SMALLINT UNSIGNED        DEFAULT NULL,
  activo            BOOLEAN         NOT NULL DEFAULT TRUE,
  destacado         BOOLEAN         NOT NULL DEFAULT FALSE,
  creado_por        INT UNSIGNED    NOT NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_productores_slug (slug),
  FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

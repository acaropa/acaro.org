-- =============================================================
-- ACARO OBC — Modulo de Encuestas
-- Migracion 001: Creacion de tablas principales
-- Base de datos: u271420828_acaro_db
-- Motor: InnoDB | Charset: utf8mb4_unicode_ci
-- Ejecutar en: phpMyAdmin de Hostinger (pestana SQL)
-- Fecha: 2026-06-21
--
-- IMPORTANTE: Este script SOLO crea tablas nuevas del modulo
-- de encuestas. No modifica, no elimina ni altera ninguna tabla
-- existente de ACARO (users, user_sessions, auditoria, proyectos,
-- biblioteca, noticias, productores, socios, tecnicos, etc.).
--
-- Rollback: ejecutar 001_encuestas_down.sql
-- =============================================================

USE u271420828_acaro_db;

-- ---------------------------------------------------------
-- 1. ENCUESTAS
--    Tabla principal. Una fila = una encuesta.
--    El slug se usa para la URL publica: /encuestas/{slug}
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS encuestas (
  id                            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  titulo                        VARCHAR(255)  NOT NULL,
  descripcion                   TEXT                   DEFAULT NULL,
  slug                          VARCHAR(220)  NOT NULL,
  estado                        ENUM(
                                  'borrador',
                                  'pendiente_revision',
                                  'publicada',
                                  'cerrada',
                                  'archivada'
                                ) NOT NULL DEFAULT 'borrador',
  visibilidad                   ENUM(
                                  'publica',
                                  'interna',
                                  'enlace_privado'
                                ) NOT NULL DEFAULT 'publica',
  logo_url                      VARCHAR(1000)          DEFAULT NULL,
  created_by_user_id            INT UNSIGNED  NOT NULL
                                COMMENT 'FK a users.id — quien creo la encuesta',
  reviewed_by_user_id           INT UNSIGNED           DEFAULT NULL
                                COMMENT 'FK a users.id — quien reviso/aprobo',
  published_by_user_id          INT UNSIGNED           DEFAULT NULL
                                COMMENT 'FK a users.id — quien publico',
  fecha_inicio                  DATE                   DEFAULT NULL,
  fecha_cierre                  DATE                   DEFAULT NULL,
  requiere_login                TINYINT(1)    NOT NULL DEFAULT 0
                                COMMENT '1 = solo usuarios ACARO autenticados pueden responder',
  permitir_multiples_respuestas TINYINT(1)    NOT NULL DEFAULT 0
                                COMMENT '1 = un usuario/IP puede responder mas de una vez',
  mensaje_confirmacion          TEXT                   DEFAULT NULL
                                COMMENT 'Texto que ve el respondente al finalizar',
  configuracion_json            JSON                   DEFAULT NULL
                                COMMENT 'Opciones adicionales (tema, color, etc.)',
  created_at                    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_encuestas_slug (slug),

  CONSTRAINT fk_encuestas_creador
    FOREIGN KEY (created_by_user_id)
    REFERENCES users(id) ON DELETE RESTRICT,

  CONSTRAINT fk_encuestas_revisor
    FOREIGN KEY (reviewed_by_user_id)
    REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT fk_encuestas_publicador
    FOREIGN KEY (published_by_user_id)
    REFERENCES users(id) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Encuestas del sistema ACARO OBC';


-- ---------------------------------------------------------
-- 2. ENCUESTA_SECCIONES
--    Agrupa preguntas en bloques con titulo propio.
--    Una encuesta sin secciones usa una seccion por defecto.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS encuesta_secciones (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  encuesta_id   INT UNSIGNED    NOT NULL,
  titulo        VARCHAR(255)             DEFAULT NULL,
  descripcion   TEXT                     DEFAULT NULL,
  posicion      SMALLINT UNSIGNED NOT NULL DEFAULT 0
                COMMENT 'Orden de aparicion dentro de la encuesta',
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_enc_secciones_encuesta
    FOREIGN KEY (encuesta_id)
    REFERENCES encuestas(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Secciones que agrupan preguntas dentro de una encuesta';


-- ---------------------------------------------------------
-- 3. ENCUESTA_PREGUNTAS
--    Una fila = una pregunta. Puede pertenecer a una seccion.
--    seccion_id NULL = pregunta sin seccion asignada.
--    encuesta_id siempre presente para referencia directa.
--    reglas_validacion: JSON con condiciones de visibilidad y
--    obligatoriedad condicional.
--    Ejemplo:
--    { "visible_si": { "codigo_pregunta": "P1", "valor": "Si" } }
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS encuesta_preguntas (
  id                INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  encuesta_id       INT UNSIGNED      NOT NULL
                    COMMENT 'FK a encuestas.id — referencia directa',
  seccion_id        INT UNSIGNED               DEFAULT NULL
                    COMMENT 'FK a encuesta_secciones.id — NULL si no tiene seccion',
  codigo_pregunta   VARCHAR(50)                DEFAULT NULL
                    COMMENT 'Codigo corto para reglas (ej: P1, SATISFACCION)',
  texto_pregunta    TEXT              NOT NULL,
  tipo_pregunta     ENUM(
                      'texto_corto',
                      'texto_largo',
                      'numero',
                      'booleano',
                      'opcion_unica',
                      'opcion_multiple',
                      'fecha'
                    ) NOT NULL,
  posicion          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  texto_ayuda       TEXT                       DEFAULT NULL
                    COMMENT 'Texto de ayuda mostrado bajo la pregunta',
  reglas_validacion JSON                       DEFAULT NULL,
  es_obligatoria    TINYINT(1)        NOT NULL DEFAULT 0,
  created_at        TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_enc_preguntas_encuesta
    FOREIGN KEY (encuesta_id)
    REFERENCES encuestas(id) ON DELETE CASCADE,

  CONSTRAINT fk_enc_preguntas_seccion
    FOREIGN KEY (seccion_id)
    REFERENCES encuesta_secciones(id) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Preguntas de cada encuesta';


-- ---------------------------------------------------------
-- 4. ENCUESTA_OPCIONES
--    Solo aplica a preguntas de tipo opcion_unica / opcion_multiple.
--    valor_opcion: valor interno (puede ser igual a etiqueta).
--    etiqueta_opcion: texto visible al usuario en la interfaz.
--    permite_texto_libre: cuando es 1, al seleccionar esta opcion
--    aparece un campo de texto libre adicional ("Otro: ___").
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS encuesta_opciones (
  id                  INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  pregunta_id         INT UNSIGNED      NOT NULL,
  valor_opcion        VARCHAR(255)      NOT NULL,
  etiqueta_opcion     VARCHAR(255)      NOT NULL,
  posicion            SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  permite_texto_libre TINYINT(1)        NOT NULL DEFAULT 0,

  PRIMARY KEY (id),

  CONSTRAINT fk_enc_opciones_pregunta
    FOREIGN KEY (pregunta_id)
    REFERENCES encuesta_preguntas(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Opciones de respuesta para preguntas de seleccion';


-- ---------------------------------------------------------
-- 5. ENCUESTA_RESPUESTAS
--    Un registro por envio completo de encuesta (submission).
--    user_id: NULL si la encuesta es publica y anonima.
--    ip_hash: SHA-256 de la IP del respondente (no la IP directa)
--    para deteccion de abuso sin exponer datos personales.
--    token_acceso: para encuestas de tipo enlace_privado.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS encuesta_respuestas (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  encuesta_id   INT UNSIGNED  NOT NULL,
  user_id       INT UNSIGNED           DEFAULT NULL
                COMMENT 'NULL si anonimo; FK a users si requiere_login=1',
  estado        ENUM('borrador','enviada','anulada') NOT NULL DEFAULT 'enviada'
                COMMENT 'Estado de la respuesta',
  ip_hash       CHAR(64)               DEFAULT NULL
                COMMENT 'SHA-256 de la IP para control de abuso (no se guarda la IP)',
  origen        VARCHAR(50)   NOT NULL DEFAULT 'web'
                COMMENT 'Canal de origen: web, enlace, qr, interno',
  token_acceso  VARCHAR(100)           DEFAULT NULL
                COMMENT 'Token de invitacion para encuestas de enlace_privado',
  datos_crudos  JSON                   DEFAULT NULL
                COMMENT 'Snapshot JSON de todas las respuestas tal como se enviaron',
  fecha_inicio  DATETIME               DEFAULT NULL
                COMMENT 'Cuando el respondente abrio la encuesta',
  fecha_envio   DATETIME               DEFAULT NULL
                COMMENT 'Cuando el respondente envio la encuesta',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_enc_resp_encuesta
    FOREIGN KEY (encuesta_id)
    REFERENCES encuestas(id) ON DELETE CASCADE,

  CONSTRAINT fk_enc_resp_usuario
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Un registro por envio completo de encuesta';


-- ---------------------------------------------------------
-- 6. ENCUESTA_RESPUESTAS_DETALLE
--    Una fila por pregunta respondida dentro de un envio.
--    Solo se usa la columna que corresponde al tipo:
--      - respuesta_texto:    texto_corto, texto_largo
--      - respuesta_numero:   numero
--      - respuesta_booleano: booleano
--      - respuesta_fecha:    fecha
--    Para opcion_unica/opcion_multiple tambien se registran en
--    encuesta_respuestas_opciones (para facilitar conteos JOIN).
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS encuesta_respuestas_detalle (
  id                     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  respuesta_encuesta_id  INT UNSIGNED  NOT NULL,
  pregunta_id            INT UNSIGNED  NOT NULL,
  respuesta_texto        TEXT                   DEFAULT NULL,
  respuesta_numero       DECIMAL(15,4)          DEFAULT NULL,
  respuesta_booleano     TINYINT(1)             DEFAULT NULL,
  respuesta_fecha        DATE                   DEFAULT NULL,
  created_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                         ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_enc_det_respuesta
    FOREIGN KEY (respuesta_encuesta_id)
    REFERENCES encuesta_respuestas(id) ON DELETE CASCADE,

  CONSTRAINT fk_enc_det_pregunta
    FOREIGN KEY (pregunta_id)
    REFERENCES encuesta_preguntas(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Respuesta individual por pregunta dentro de un envio';


-- ---------------------------------------------------------
-- 7. ENCUESTA_RESPUESTAS_OPCIONES
--    Solo para preguntas de tipo opcion_unica / opcion_multiple.
--    Una fila por opcion seleccionada.
--    texto_libre: contenido extra cuando permite_texto_libre=1.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS encuesta_respuestas_opciones (
  id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  respuesta_detalle_id INT UNSIGNED NOT NULL,
  opcion_id           INT UNSIGNED  NOT NULL,
  texto_libre         TEXT                   DEFAULT NULL,

  PRIMARY KEY (id),

  CONSTRAINT fk_enc_resp_opc_detalle
    FOREIGN KEY (respuesta_detalle_id)
    REFERENCES encuesta_respuestas_detalle(id) ON DELETE CASCADE,

  CONSTRAINT fk_enc_resp_opc_opcion
    FOREIGN KEY (opcion_id)
    REFERENCES encuesta_opciones(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Opciones seleccionadas en respuestas de tipo seleccion';


-- ---------------------------------------------------------
-- 8. ENCUESTA_TOKENS
--    Tokens de acceso para encuestas de tipo enlace_privado.
--    Cada token es de un solo uso (usado=1 tras responder).
--    Se pueden enviar por correo o generar en lote.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS encuesta_tokens (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  encuesta_id     INT UNSIGNED  NOT NULL,
  token           VARCHAR(100)  NOT NULL,
  email_destino   VARCHAR(255)           DEFAULT NULL
                  COMMENT 'Correo al que se envio el token (opcional)',
  usado           TINYINT(1)    NOT NULL DEFAULT 0,
  expires_at      DATETIME               DEFAULT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_enc_tokens_token (token),

  CONSTRAINT fk_enc_tokens_encuesta
    FOREIGN KEY (encuesta_id)
    REFERENCES encuestas(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tokens de acceso unico para encuestas de enlace privado';

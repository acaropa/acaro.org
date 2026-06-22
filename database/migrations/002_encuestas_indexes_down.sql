-- =============================================================
-- ACARO OBC — Modulo de Encuestas
-- Migracion 002: ROLLBACK — Eliminar indices de rendimiento
-- Base de datos: u271420828_acaro_db
-- Ejecutar en: phpMyAdmin de Hostinger (pestana SQL)
-- Fecha: 2026-06-21
--
-- Ejecutar ANTES de 001_encuestas_down.sql si se hace rollback
-- completo, o de forma independiente si solo se quieren remover
-- los indices secundarios.
-- =============================================================

USE u271420828_acaro_db;

-- encuestas
DROP INDEX idx_enc_estado          ON encuestas;
DROP INDEX idx_enc_estado_vis      ON encuestas;
DROP INDEX idx_enc_creador         ON encuestas;
DROP INDEX idx_enc_fechas          ON encuestas;

-- encuesta_secciones
DROP INDEX idx_enc_sec_encuesta_pos  ON encuesta_secciones;

-- encuesta_preguntas
DROP INDEX idx_enc_preg_encuesta_pos ON encuesta_preguntas;
DROP INDEX idx_enc_preg_seccion_pos  ON encuesta_preguntas;
DROP INDEX idx_enc_preg_codigo       ON encuesta_preguntas;

-- encuesta_opciones
DROP INDEX idx_enc_opc_pregunta_pos  ON encuesta_opciones;

-- encuesta_respuestas
DROP INDEX idx_enc_resp_encuesta  ON encuesta_respuestas;
DROP INDEX idx_enc_resp_usuario   ON encuesta_respuestas;
DROP INDEX idx_enc_resp_created   ON encuesta_respuestas;
DROP INDEX idx_enc_resp_fecha_envio ON encuesta_respuestas;
DROP INDEX idx_enc_resp_ip        ON encuesta_respuestas;
DROP INDEX idx_enc_resp_token     ON encuesta_respuestas;
DROP INDEX idx_enc_resp_estado    ON encuesta_respuestas;

-- encuesta_respuestas_detalle
DROP INDEX idx_enc_det_respuesta  ON encuesta_respuestas_detalle;
DROP INDEX idx_enc_det_pregunta   ON encuesta_respuestas_detalle;

-- encuesta_respuestas_opciones
DROP INDEX idx_enc_resp_opc_detalle  ON encuesta_respuestas_opciones;
DROP INDEX idx_enc_resp_opc_opcion   ON encuesta_respuestas_opciones;

-- encuesta_tokens
DROP INDEX idx_enc_tokens_encuesta  ON encuesta_tokens;
DROP INDEX idx_enc_tokens_expires   ON encuesta_tokens;
DROP INDEX idx_enc_tokens_usado     ON encuesta_tokens;

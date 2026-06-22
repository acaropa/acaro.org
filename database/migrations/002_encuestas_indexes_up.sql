-- =============================================================
-- ACARO OBC — Modulo de Encuestas
-- Migracion 002: Indices de rendimiento
-- Base de datos: u271420828_acaro_db
-- Ejecutar en: phpMyAdmin de Hostinger (pestana SQL)
-- Fecha: 2026-06-21
--
-- Prerequisito: ejecutar 001_encuestas_up.sql primero.
-- Rollback: ejecutar 002_encuestas_indexes_down.sql
-- =============================================================

USE u271420828_acaro_db;

-- --- encuestas -------------------------------------------------
-- Filtrado por estado para listados publicos y admin
CREATE INDEX idx_enc_estado
  ON encuestas(estado);

-- Filtrado por visibilidad (combo frecuente con estado)
CREATE INDEX idx_enc_estado_vis
  ON encuestas(estado, visibilidad);

-- Busqueda por creador en panel admin
CREATE INDEX idx_enc_creador
  ON encuestas(created_by_user_id);

-- Filtrado de encuestas vigentes por fecha
CREATE INDEX idx_enc_fechas
  ON encuestas(fecha_inicio, fecha_cierre);

-- --- encuesta_secciones ----------------------------------------
-- JOIN desde encuesta + orden de secciones
CREATE INDEX idx_enc_sec_encuesta_pos
  ON encuesta_secciones(encuesta_id, posicion);

-- --- encuesta_preguntas ----------------------------------------
-- JOIN desde encuesta + orden de preguntas
CREATE INDEX idx_enc_preg_encuesta_pos
  ON encuesta_preguntas(encuesta_id, posicion);

-- JOIN desde seccion + orden de preguntas
CREATE INDEX idx_enc_preg_seccion_pos
  ON encuesta_preguntas(seccion_id, posicion);

-- Busqueda por codigo de pregunta (usado en reglas condicionales)
CREATE INDEX idx_enc_preg_codigo
  ON encuesta_preguntas(codigo_pregunta);

-- --- encuesta_opciones -----------------------------------------
-- JOIN desde pregunta + orden de opciones
CREATE INDEX idx_enc_opc_pregunta_pos
  ON encuesta_opciones(pregunta_id, posicion);

-- --- encuesta_respuestas ---------------------------------------
-- Conteo de respuestas por encuesta (estadisticas)
CREATE INDEX idx_enc_resp_encuesta
  ON encuesta_respuestas(encuesta_id);

-- Busqueda de respuestas de un usuario (encuestas internas)
CREATE INDEX idx_enc_resp_usuario
  ON encuesta_respuestas(user_id);

-- Filtrado por fecha para estadisticas con rango temporal
CREATE INDEX idx_enc_resp_created
  ON encuesta_respuestas(created_at);

-- Filtrado por fecha de envio
CREATE INDEX idx_enc_resp_fecha_envio
  ON encuesta_respuestas(fecha_envio);

-- Control de abuso por hash de IP
CREATE INDEX idx_enc_resp_ip
  ON encuesta_respuestas(ip_hash);

-- Verificacion de token de acceso (encuestas privadas)
CREATE INDEX idx_enc_resp_token
  ON encuesta_respuestas(token_acceso);

-- Filtrado por estado de respuesta
CREATE INDEX idx_enc_resp_estado
  ON encuesta_respuestas(estado);

-- --- encuesta_respuestas_detalle -------------------------------
-- JOIN principal desde respuesta (carga de detalle)
CREATE INDEX idx_enc_det_respuesta
  ON encuesta_respuestas_detalle(respuesta_encuesta_id);

-- JOIN desde pregunta (conteo de respuestas por pregunta)
CREATE INDEX idx_enc_det_pregunta
  ON encuesta_respuestas_detalle(pregunta_id);

-- --- encuesta_respuestas_opciones ------------------------------
-- JOIN desde detalle (carga de opciones seleccionadas)
CREATE INDEX idx_enc_resp_opc_detalle
  ON encuesta_respuestas_opciones(respuesta_detalle_id);

-- Conteo de votos por opcion (estadisticas de barras/torta)
CREATE INDEX idx_enc_resp_opc_opcion
  ON encuesta_respuestas_opciones(opcion_id);

-- --- encuesta_tokens -------------------------------------------
-- Busqueda por encuesta (listar tokens emitidos)
CREATE INDEX idx_enc_tokens_encuesta
  ON encuesta_tokens(encuesta_id);

-- Limpieza automatica de tokens expirados
CREATE INDEX idx_enc_tokens_expires
  ON encuesta_tokens(expires_at);

-- Filtrado de tokens usados vs disponibles
CREATE INDEX idx_enc_tokens_usado
  ON encuesta_tokens(usado);

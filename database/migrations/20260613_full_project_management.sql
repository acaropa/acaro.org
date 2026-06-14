-- Selecciona la base de datos correspondiente antes de importar este archivo.
-- En Hostinger normalmente se llama, por ejemplo, u271420828_acaro_db.

CREATE TABLE IF NOT EXISTS proyecto_archivos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id INT UNSIGNED NOT NULL,
  fase_id INT UNSIGNED DEFAULT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  tipo ENUM('documento','evidencia','foto','informe','cotizacion','factura','acta','plano','otro') NOT NULL DEFAULT 'documento',
  proveedor_nube ENUM('onedrive','sharepoint','google_drive','local','otro') NOT NULL DEFAULT 'local',
  archivo_url VARCHAR(1000) DEFAULT NULL,
  nombre_original VARCHAR(255) DEFAULT NULL,
  nombre_guardado VARCHAR(255) DEFAULT NULL,
  extension VARCHAR(20) DEFAULT NULL,
  mime_type VARCHAR(150) DEFAULT NULL,
  size_bytes BIGINT UNSIGNED DEFAULT NULL,
  estado ENUM('borrador','pendiente_revision','requiere_correccion','aprobado','rechazado','archivado') NOT NULL DEFAULT 'pendiente_revision',
  visibilidad ENUM('publica','interna') NOT NULL DEFAULT 'interna',
  subido_por INT UNSIGNED NOT NULL,
  revisado_por INT UNSIGNED DEFAULT NULL,
  fecha_revision DATETIME DEFAULT NULL,
  observacion_revision TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_proyecto_archivos_proyecto (proyecto_id),
  CONSTRAINT fk_proyecto_archivos_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  CONSTRAINT fk_proyecto_archivos_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_archivos_subido_por FOREIGN KEY (subido_por) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_proyecto_archivos_revisado_por FOREIGN KEY (revisado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED DEFAULT NULL,
  modulo VARCHAR(100) NOT NULL,
  accion VARCHAR(100) NOT NULL,
  entidad_id INT UNSIGNED DEFAULT NULL,
  proyecto_id INT UNSIGNED DEFAULT NULL,
  fase_id INT UNSIGNED DEFAULT NULL,
  descripcion TEXT DEFAULT NULL,
  valor_anterior JSON DEFAULT NULL,
  valor_nuevo JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_auditoria_proyecto (proyecto_id),
  KEY idx_auditoria_fase (fase_id),
  CONSTRAINT fk_auditoria_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_auditoria_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL,
  CONSTRAINT fk_auditoria_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proyecto_avances (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id INT UNSIGNED NOT NULL,
  fase_id INT UNSIGNED DEFAULT NULL,
  creado_por INT UNSIGNED NOT NULL,
  titulo VARCHAR(200) DEFAULT NULL,
  descripcion TEXT NOT NULL,
  porcentaje_avance TINYINT UNSIGNED DEFAULT NULL,
  estado ENUM('pendiente_revision','aprobado','rechazado','requiere_correccion','archivado') NOT NULL DEFAULT 'pendiente_revision',
  revisado_por INT UNSIGNED DEFAULT NULL,
  fecha_revision DATETIME DEFAULT NULL,
  observacion_revision TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_proyecto_avances_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  CONSTRAINT fk_proyecto_avances_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_avances_creado_por FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_proyecto_avances_revisado_por FOREIGN KEY (revisado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proyecto_tareas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id INT UNSIGNED NOT NULL,
  fase_id INT UNSIGNED DEFAULT NULL,
  titulo VARCHAR(220) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  responsable_id INT UNSIGNED DEFAULT NULL,
  prioridad ENUM('baja','media','alta','critica') NOT NULL DEFAULT 'media',
  estado ENUM('pendiente','en_proceso','bloqueada','en_revision','completada','cancelada') NOT NULL DEFAULT 'pendiente',
  fecha_inicio DATE DEFAULT NULL,
  fecha_limite DATE DEFAULT NULL,
  porcentaje_avance TINYINT UNSIGNED NOT NULL DEFAULT 0,
  creado_por INT UNSIGNED NOT NULL,
  actualizado_por INT UNSIGNED DEFAULT NULL,
  completado_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_proyecto_tareas_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  CONSTRAINT fk_proyecto_tareas_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_tareas_responsable FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_tareas_creado_por FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_proyecto_tareas_actualizado_por FOREIGN KEY (actualizado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proyecto_riesgos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id INT UNSIGNED NOT NULL,
  fase_id INT UNSIGNED DEFAULT NULL,
  tipo ENUM('riesgo','problema') NOT NULL DEFAULT 'riesgo',
  titulo VARCHAR(220) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  probabilidad ENUM('baja','media','alta') DEFAULT NULL,
  impacto ENUM('bajo','medio','alto','critico') NOT NULL DEFAULT 'medio',
  estado ENUM('abierto','en_mitigacion','resuelto','cerrado','descartado') NOT NULL DEFAULT 'abierto',
  plan_respuesta TEXT DEFAULT NULL,
  responsable_id INT UNSIGNED DEFAULT NULL,
  reportado_por INT UNSIGNED NOT NULL,
  cerrado_por INT UNSIGNED DEFAULT NULL,
  fecha_cierre DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_proyecto_riesgos_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  CONSTRAINT fk_proyecto_riesgos_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_riesgos_responsable FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_riesgos_reportado_por FOREIGN KEY (reportado_por) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_proyecto_riesgos_cerrado_por FOREIGN KEY (cerrado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proyecto_decisiones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id INT UNSIGNED NOT NULL,
  fase_id INT UNSIGNED DEFAULT NULL,
  titulo VARCHAR(220) NOT NULL,
  decision_tomada TEXT NOT NULL,
  motivo TEXT DEFAULT NULL,
  impacto_tiempo VARCHAR(255) DEFAULT NULL,
  impacto_costo DECIMAL(12,2) DEFAULT NULL,
  impacto_alcance TEXT DEFAULT NULL,
  estado ENUM('registrada','aprobada','rechazada','anulada') NOT NULL DEFAULT 'registrada',
  tomada_por INT UNSIGNED NOT NULL,
  aprobada_por INT UNSIGNED DEFAULT NULL,
  fecha_decision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_proyecto_decisiones_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  CONSTRAINT fk_proyecto_decisiones_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_decisiones_tomada_por FOREIGN KEY (tomada_por) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_proyecto_decisiones_aprobada_por FOREIGN KEY (aprobada_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proyecto_reuniones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id INT UNSIGNED NOT NULL,
  fase_id INT UNSIGNED DEFAULT NULL,
  titulo VARCHAR(220) NOT NULL,
  fecha_reunion DATETIME NOT NULL,
  lugar VARCHAR(255) DEFAULT NULL,
  participantes TEXT DEFAULT NULL,
  temas TEXT DEFAULT NULL,
  acuerdos TEXT DEFAULT NULL,
  proximos_pasos TEXT DEFAULT NULL,
  creada_por INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_proyecto_reuniones_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  CONSTRAINT fk_proyecto_reuniones_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_reuniones_creada_por FOREIGN KEY (creada_por) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proyecto_finanzas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id INT UNSIGNED NOT NULL,
  fase_id INT UNSIGNED DEFAULT NULL,
  tipo ENUM('presupuesto','compromiso','gasto','ingreso','ajuste') NOT NULL DEFAULT 'gasto',
  concepto VARCHAR(255) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  monto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  moneda CHAR(3) NOT NULL DEFAULT 'USD',
  fecha_movimiento DATE NOT NULL,
  documento_archivo_id INT UNSIGNED DEFAULT NULL,
  estado ENUM('pendiente','validado','rechazado','archivado') NOT NULL DEFAULT 'pendiente',
  registrado_por INT UNSIGNED NOT NULL,
  validado_por INT UNSIGNED DEFAULT NULL,
  fecha_validacion DATETIME DEFAULT NULL,
  observacion_revision TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_proyecto_finanzas_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  CONSTRAINT fk_proyecto_finanzas_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_finanzas_archivo FOREIGN KEY (documento_archivo_id) REFERENCES proyecto_archivos(id) ON DELETE SET NULL,
  CONSTRAINT fk_proyecto_finanzas_registrado_por FOREIGN KEY (registrado_por) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_proyecto_finanzas_validado_por FOREIGN KEY (validado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @schema_name := DATABASE();
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='proyecto_fases' AND COLUMN_NAME='porcentaje_avance')=0,
  'ALTER TABLE proyecto_fases ADD COLUMN porcentaje_avance TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER estado', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='proyecto_reuniones' AND COLUMN_NAME='fase_id')=0,
  'ALTER TABLE proyecto_reuniones ADD COLUMN fase_id INT UNSIGNED DEFAULT NULL AFTER proyecto_id, ADD KEY idx_proyecto_reuniones_fase (fase_id), ADD CONSTRAINT fk_proyecto_reuniones_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='auditoria' AND COLUMN_NAME='fase_id')=0,
  'ALTER TABLE auditoria ADD COLUMN fase_id INT UNSIGNED DEFAULT NULL AFTER proyecto_id, ADD KEY idx_auditoria_fase (fase_id), ADD CONSTRAINT fk_auditoria_fase FOREIGN KEY (fase_id) REFERENCES proyecto_fases(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='proyecto_fases' AND COLUMN_NAME='peso_porcentaje')=0,
  'ALTER TABLE proyecto_fases ADD COLUMN peso_porcentaje TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER porcentaje_avance', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='proyecto_fases' AND COLUMN_NAME='responsable_id')=0,
  'ALTER TABLE proyecto_fases ADD COLUMN responsable_id INT UNSIGNED DEFAULT NULL AFTER peso_porcentaje, ADD KEY idx_proyecto_fases_responsable (responsable_id), ADD CONSTRAINT fk_proyecto_fases_responsable FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Indicadores destacados por proyecto (ej. "99 productores beneficiados", "30 hectareas reforestadas")
-- y campo de impacto/cierre para la ficha publica del proyecto.

CREATE TABLE IF NOT EXISTS proyecto_indicadores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id INT UNSIGNED NOT NULL,
  icono VARCHAR(50) NOT NULL DEFAULT 'sparkles',
  valor VARCHAR(100) NOT NULL,
  etiqueta VARCHAR(255) NOT NULL,
  orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_proyecto_indicadores_proyecto (proyecto_id),
  CONSTRAINT fk_proyecto_indicadores_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @schema_name := DATABASE();
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='proyectos' AND COLUMN_NAME='impacto')=0,
  'ALTER TABLE proyectos ADD COLUMN impacto TEXT DEFAULT NULL AFTER descripcion', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

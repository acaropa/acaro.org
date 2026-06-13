-- ACARO OBC - Sesiones seguras con refresh token HttpOnly.
-- Selecciona u271420828_acaro_db en phpMyAdmin antes de importar.
-- Ejecutar una sola vez antes de desplegar el commit de sesiones.

CREATE TABLE user_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT(10) UNSIGNED NOT NULL,
  refresh_token_hash CHAR(64) NOT NULL,
  previous_token_hash CHAR(64) DEFAULT NULL,
  rotated_at DATETIME DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  expires_at DATETIME NOT NULL,
  last_used_at DATETIME DEFAULT NULL,
  revoked_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_sessions_refresh_hash (refresh_token_hash),
  KEY idx_user_sessions_user_active (user_id, revoked_at, expires_at),
  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

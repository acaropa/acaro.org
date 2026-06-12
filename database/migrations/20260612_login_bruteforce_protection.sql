-- ACARO OBC - Proteccion persistente contra fuerza bruta.
-- Selecciona u271420828_acaro_db en phpMyAdmin antes de importar.
-- Ejecutar una sola vez.

ALTER TABLE users
  ADD COLUMN failed_login_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER activo,
  ADD COLUMN locked_until DATETIME NULL DEFAULT NULL AFTER failed_login_attempts,
  ADD COLUMN last_failed_login DATETIME NULL DEFAULT NULL AFTER locked_until,
  ADD COLUMN last_login_at DATETIME NULL DEFAULT NULL AFTER last_failed_login,
  ADD KEY idx_users_locked_until (locked_until);

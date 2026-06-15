USE acaro_db;

-- ─────────────────────────────────────────
-- USERS: nombre visible público (autor/responsable de contenido)
-- ─────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN full_name VARCHAR(150) NULL AFTER email;

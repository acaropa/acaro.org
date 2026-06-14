USE acaro_db;

-- ─────────────────────────────────────────
-- BIBLIOTECA: imagen_portada (opcional)
-- ─────────────────────────────────────────
ALTER TABLE biblioteca
  ADD COLUMN imagen_portada VARCHAR(500) NULL AFTER categoria;

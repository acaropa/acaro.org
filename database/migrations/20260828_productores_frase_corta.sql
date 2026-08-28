-- Frase breve para destacar al productor en el landing sin reutilizar su biografía completa.
ALTER TABLE productores
  ADD COLUMN frase_corta VARCHAR(180) NULL AFTER descripcion;

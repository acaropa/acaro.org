-- Frase breve para destacar al productor en el landing sin reutilizar su biografía completa.
ALTER TABLE productores
  ADD COLUMN frase_corta TEXT NULL AFTER descripcion;

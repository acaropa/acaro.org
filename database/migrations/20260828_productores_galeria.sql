-- Galería complementaria del perfil público del productor.
ALTER TABLE productores
  ADD COLUMN imagenes JSON NULL AFTER imagen_url;

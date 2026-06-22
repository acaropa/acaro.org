-- Migration: Add column 'imagenes' to 'noticias' table
-- Run this script against the production database to support multiple photos in news articles.

ALTER TABLE noticias ADD COLUMN imagenes JSON DEFAULT NULL AFTER imagen_portada;

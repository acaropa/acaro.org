-- =============================================================
-- ACARO OBC — Modulo de Encuestas
-- Migracion 001: ROLLBACK — Eliminar tablas del modulo
-- Base de datos: u271420828_acaro_db
-- Ejecutar en: phpMyAdmin de Hostinger (pestana SQL)
-- Fecha: 2026-06-21
--
-- ADVERTENCIA: Este script elimina TODAS las tablas del modulo
-- de encuestas y sus datos. Usarlo solo si se necesita revertir
-- completamente la migracion 001_encuestas_up.sql.
--
-- NO afecta ninguna tabla existente de ACARO.
-- NO ejecutar en produccion si ya hay datos de encuestas.
-- =============================================================

USE u271420828_acaro_db;

-- Deshabilitar FK temporalmente para poder eliminar en cualquier orden
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS encuesta_tokens;
DROP TABLE IF EXISTS encuesta_respuestas_opciones;
DROP TABLE IF EXISTS encuesta_respuestas_detalle;
DROP TABLE IF EXISTS encuesta_respuestas;
DROP TABLE IF EXISTS encuesta_opciones;
DROP TABLE IF EXISTS encuesta_preguntas;
DROP TABLE IF EXISTS encuesta_secciones;
DROP TABLE IF EXISTS encuestas;

-- Restaurar FK
SET FOREIGN_KEY_CHECKS = 1;

-- ACARO Web — Seed inicial
-- Contraseña de todos los usuarios de prueba: Admin1234!
-- Genera el hash real con: bcrypt.hash('Admin1234!', 10)

USE acaro_db;

INSERT INTO users (email, password_hash, role) VALUES
  ('admin@acaro.org',      '$2a$10$REEMPLAZA_CON_HASH_REAL', 'admin'),
  ('supervisor@acaro.org', '$2a$10$REEMPLAZA_CON_HASH_REAL', 'supervisor'),
  ('tecnico@acaro.org',    '$2a$10$REEMPLAZA_CON_HASH_REAL', 'tecnico');

INSERT INTO tecnicos (user_id, nombre, apellido, especialidad, telefono) VALUES
  (3, 'Juan', 'Pérez', 'Electricidad', '099-000-001');

INSERT INTO biblioteca
  (titulo, descripcion, archivo_url, categoria, estado, visibilidad, creado_por, revisado_por, fecha_revision)
VALUES
  ('Manual de instalaciones eléctricas', 'Guía técnica para instalaciones residenciales',
   'https://drive.google.com/ejemplo', 'Manuales', 'aprobado', 'publica', 1, 1, CURRENT_TIMESTAMP);

INSERT INTO proyectos (nombre, descripcion, tipo, clasificacion, estado, fecha_inicio, responsable_id) VALUES
  ('Instalación Oficina Central', 'Cableado estructurado sede principal', 'privado', 'Infraestructura', 'en_progreso', '2026-06-10', 1);

INSERT INTO proyecto_tecnicos (proyecto_id, tecnico_id, fecha_asignacion) VALUES
  (1, 1, '2026-06-10');

INSERT INTO proyecto_fases (proyecto_id, nombre, descripcion, orden, estado, fecha_inicio) VALUES
  (1, 'Relevamiento', 'Medición y planificación del espacio', 1, 'completado',   '2026-06-10'),
  (1, 'Instalación',  'Tendido de cables y conexiones',      2, 'en_progreso',  '2026-06-15'),
  (1, 'Pruebas',      'Verificación y certificación',        3, 'pendiente',    NULL);

INSERT INTO fase_imagenes (fase_id, url, descripcion) VALUES
  (1, 'https://storage.ejemplo.com/acaro/fase1-plano.jpg',  'Plano del relevamiento'),
  (2, 'https://storage.ejemplo.com/acaro/fase2-cables.jpg', 'Instalación en curso');

const { loginSchema, registerSchema } = require('../src/schemas/auth');
const { createUsuarioSchema, assignRoleSchema } = require('../src/schemas/usuarios');
const { createNoticiaSchema, updateNoticiaSchema } = require('../src/schemas/noticias');
const { createBibliotecaSchema, reviewBibliotecaSchema } = require('../src/schemas/biblioteca');
const { createProyectoSchema, createFaseSchema, assignTecnicoSchema, addImagenSchema } = require('../src/schemas/proyectos');
const { createProductorSchema } = require('../src/schemas/productores');
const { createSocioSchema, updateSocioSchema } = require('../src/schemas/socios');
const { createTecnicoSchema, updateTecnicoSchema, assignSupervisorSchema } = require('../src/schemas/tecnicos');
const { createEncuestaSchema, changeEstadoSchema, submitResponseSchema } = require('../src/schemas/encuestas');
const { idParamSchema, slugParamSchema, paginationSchema } = require('../src/schemas/common');

// ── Autenticación ──────────────────────────────────────────────────────────────
describe('loginSchema', () => {
  test('acepta credenciales válidas', () => {
    expect(loginSchema.safeParse({ email: 'user@acaro.org', password: 'Pass123' }).success).toBe(true);
  });
  test('rechaza email inválido', () => {
    expect(loginSchema.safeParse({ email: 'noemail', password: 'Pass123' }).success).toBe(false);
  });
  test('rechaza contraseña demasiado larga', () => {
    expect(loginSchema.safeParse({ email: 'u@a.com', password: 'x'.repeat(73) }).success).toBe(false);
  });
  test('rechaza campos ausentes', () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});

describe('registerSchema', () => {
  test('acepta registro válido', () => {
    expect(registerSchema.safeParse({ email: 'new@acaro.org', password: 'SecurePass123!' }).success).toBe(true);
  });
  test('rechaza contraseña menor a 12 caracteres', () => {
    expect(registerSchema.safeParse({ email: 'a@b.com', password: 'short' }).success).toBe(false);
  });
});

// ── Usuarios ───────────────────────────────────────────────────────────────────
describe('createUsuarioSchema', () => {
  test('acepta usuario válido', () => {
    expect(createUsuarioSchema.safeParse({ email: 'u@a.org', password: 'ValidPass1234!', role: 'tecnico' }).success).toBe(true);
  });
  test('rechaza rol inválido', () => {
    expect(createUsuarioSchema.safeParse({ email: 'u@a.org', password: 'ValidPass1234!', role: 'hacker' }).success).toBe(false);
  });
});

describe('assignRoleSchema', () => {
  test('acepta rol admin', () => {
    expect(assignRoleSchema.safeParse({ role: 'admin' }).success).toBe(true);
  });
  test('rechaza rol desconocido', () => {
    expect(assignRoleSchema.safeParse({ role: 'superadmin' }).success).toBe(false);
  });
});

// ── Noticias ───────────────────────────────────────────────────────────────────
describe('createNoticiaSchema', () => {
  test('acepta noticia válida', () => {
    expect(createNoticiaSchema.safeParse({ titulo: 'Mi noticia', contenido: 'Contenido aquí' }).success).toBe(true);
  });
  test('rechaza sin titulo', () => {
    expect(createNoticiaSchema.safeParse({ contenido: 'Solo contenido' }).success).toBe(false);
  });
  test('rechaza estado inválido', () => {
    expect(createNoticiaSchema.safeParse({ titulo: 'T', contenido: 'C', estado: 'publicado' }).success).toBe(false); // debe ser 'publicada'
  });
  test('acepta estado publicada (femenino, igual que el ENUM de MySQL)', () => {
    expect(createNoticiaSchema.safeParse({ titulo: 'T', contenido: 'C', estado: 'publicada' }).success).toBe(true);
  });
  test('rechaza titulo demasiado largo', () => {
    expect(createNoticiaSchema.safeParse({ titulo: 'x'.repeat(256), contenido: 'C' }).success).toBe(false);
  });
  test('acepta imagenes_base64 válidas', () => {
    const data = {
      titulo: 'Test',
      contenido: 'Texto',
      imagenes_base64: [{ base64: 'data:image/jpeg;base64,abc', fileName: 'photo.jpg' }],
    };
    expect(createNoticiaSchema.safeParse(data).success).toBe(true);
  });
  test('rechaza más de 10 imágenes secundarias', () => {
    const imgs = Array.from({ length: 11 }, (_, i) => ({ base64: 'data:', fileName: `f${i}.jpg` }));
    expect(createNoticiaSchema.safeParse({ titulo: 'T', contenido: 'C', imagenes_base64: imgs }).success).toBe(false);
  });
});

describe('updateNoticiaSchema', () => {
  test('acepta update parcial', () => {
    expect(updateNoticiaSchema.safeParse({ titulo: 'Nuevo título' }).success).toBe(true);
  });
  test('acepta objeto vacío', () => {
    expect(updateNoticiaSchema.safeParse({}).success).toBe(true);
  });
});

// ── Biblioteca ─────────────────────────────────────────────────────────────────
describe('createBibliotecaSchema', () => {
  test('acepta documento válido', () => {
    expect(createBibliotecaSchema.safeParse({
      titulo: 'Manual', categoria: 'informe', visibilidad: 'publica',
    }).success).toBe(true);
  });
  test('rechaza visibilidad inválida', () => {
    expect(createBibliotecaSchema.safeParse({
      titulo: 'T', categoria: 'C', visibilidad: 'secreta',
    }).success).toBe(false);
  });
  test('rechaza más de 20 etiquetas', () => {
    const tags = Array.from({ length: 21 }, (_, i) => `tag${i}`);
    expect(createBibliotecaSchema.safeParse({
      titulo: 'T', categoria: 'C', visibilidad: 'publica', etiquetas: tags,
    }).success).toBe(false);
  });
});

describe('reviewBibliotecaSchema', () => {
  test('acepta acción approve', () => {
    expect(reviewBibliotecaSchema.safeParse({ action: 'approve' }).success).toBe(true);
  });
  test('rechaza acción desconocida', () => {
    expect(reviewBibliotecaSchema.safeParse({ action: 'delete_all' }).success).toBe(false);
  });
});

// ── Proyectos ──────────────────────────────────────────────────────────────────
describe('createProyectoSchema', () => {
  test('acepta proyecto mínimo', () => {
    expect(createProyectoSchema.safeParse({ nombre: 'Proyecto A' }).success).toBe(true);
  });
  test('rechaza fecha con formato incorrecto', () => {
    expect(createProyectoSchema.safeParse({ nombre: 'P', fecha_inicio: '01/01/2025' }).success).toBe(false);
  });
  test('acepta fecha en formato YYYY-MM-DD', () => {
    expect(createProyectoSchema.safeParse({ nombre: 'P', fecha_inicio: '2025-01-01' }).success).toBe(true);
  });
  test('rechaza estados que no existen en el ENUM de MySQL', () => {
    expect(createProyectoSchema.safeParse({ nombre: 'P', estado: 'planificacion' }).success).toBe(false);
    expect(createProyectoSchema.safeParse({ nombre: 'P', estado: 'suspendido' }).success).toBe(false);
  });
  test('acepta estados válidos de la BD', () => {
    expect(createProyectoSchema.safeParse({ nombre: 'P', estado: 'pendiente' }).success).toBe(true);
    expect(createProyectoSchema.safeParse({ nombre: 'P', estado: 'en_progreso' }).success).toBe(true);
  });
});

describe('assignTecnicoSchema', () => {
  test('acepta asignación válida', () => {
    expect(assignTecnicoSchema.safeParse({ tecnico_id: 5, fecha_asignacion: '2025-06-01' }).success).toBe(true);
  });
  test('rechaza tecnico_id no numérico', () => {
    expect(assignTecnicoSchema.safeParse({ tecnico_id: 'abc', fecha_asignacion: '2025-06-01' }).success).toBe(false);
  });
  test('rechaza sin fecha', () => {
    expect(assignTecnicoSchema.safeParse({ tecnico_id: 1 }).success).toBe(false);
  });
});

describe('addImagenSchema', () => {
  test('acepta URL válida', () => {
    expect(addImagenSchema.safeParse({ url: 'https://cdn.example.com/img.jpg' }).success).toBe(true);
  });
  test('rechaza URL inválida', () => {
    expect(addImagenSchema.safeParse({ url: 'no-es-url' }).success).toBe(false);
  });
  test('rechaza sin url', () => {
    expect(addImagenSchema.safeParse({}).success).toBe(false);
  });
});

// ── Productores ────────────────────────────────────────────────────────────────
describe('createProductorSchema', () => {
  test('acepta productor mínimo', () => {
    expect(createProductorSchema.safeParse({ nombre: 'Juan Pérez' }).success).toBe(true);
  });
  test('rechaza años de experiencia negativos', () => {
    expect(createProductorSchema.safeParse({ nombre: 'J', anios_experiencia: -1 }).success).toBe(false);
  });
  test('rechaza nombre vacío', () => {
    expect(createProductorSchema.safeParse({ nombre: '' }).success).toBe(false);
  });
});

// ── Socios ─────────────────────────────────────────────────────────────────────
describe('createSocioSchema', () => {
  test('acepta socio válido', () => {
    expect(createSocioSchema.safeParse({
      nombre: 'Ana', apellido: 'García', fecha_ingreso: '2024-03-15',
    }).success).toBe(true);
  });
  test('rechaza sin apellido', () => {
    expect(createSocioSchema.safeParse({ nombre: 'Ana', fecha_ingreso: '2024-03-15' }).success).toBe(false);
  });
  test('rechaza fecha con formato incorrecto', () => {
    expect(createSocioSchema.safeParse({ nombre: 'A', apellido: 'B', fecha_ingreso: '15/03/2024' }).success).toBe(false);
  });
  test('rechaza email inválido si se provee', () => {
    expect(createSocioSchema.safeParse({
      nombre: 'A', apellido: 'B', fecha_ingreso: '2024-01-01', email: 'noemail',
    }).success).toBe(false);
  });
});

describe('updateSocioSchema', () => {
  test('acepta estado activo', () => {
    expect(updateSocioSchema.safeParse({ estado: 'activo' }).success).toBe(true);
  });
  test('acepta estado inactivo', () => {
    expect(updateSocioSchema.safeParse({ estado: 'inactivo' }).success).toBe(true);
  });
  test('rechaza estado inválido', () => {
    expect(updateSocioSchema.safeParse({ estado: 'suspendido' }).success).toBe(false);
  });
});

// ── Técnicos ───────────────────────────────────────────────────────────────────
describe('createTecnicoSchema', () => {
  test('acepta técnico válido', () => {
    expect(createTecnicoSchema.safeParse({
      email: 'tec@acaro.org', password: 'Secure12345!', nombre: 'Luis', apellido: 'Rojas',
    }).success).toBe(true);
  });
  test('acepta con campo especialidad (columna real de la BD)', () => {
    expect(createTecnicoSchema.safeParse({
      email: 'tec@acaro.org', password: 'Secure12345!', nombre: 'Luis', apellido: 'Rojas',
      especialidad: 'Café orgánico',
    }).success).toBe(true);
  });
  test('rechaza contraseña corta', () => {
    expect(createTecnicoSchema.safeParse({
      email: 't@a.org', password: 'short', nombre: 'L', apellido: 'R',
    }).success).toBe(false);
  });
  test('rechaza email inválido', () => {
    expect(createTecnicoSchema.safeParse({
      email: 'noemail', password: 'Secure12345!', nombre: 'L', apellido: 'R',
    }).success).toBe(false);
  });
});

describe('updateTecnicoSchema', () => {
  test('acepta disponible boolean', () => {
    expect(updateTecnicoSchema.safeParse({ disponible: false }).success).toBe(true);
  });
  test('acepta especialidad', () => {
    expect(updateTecnicoSchema.safeParse({ especialidad: 'Agroecología' }).success).toBe(true);
  });
});

describe('assignSupervisorSchema', () => {
  test('acepta supervisor_id válido', () => {
    expect(assignSupervisorSchema.safeParse({ supervisor_id: 3 }).success).toBe(true);
  });
  test('rechaza 0', () => {
    expect(assignSupervisorSchema.safeParse({ supervisor_id: 0 }).success).toBe(false);
  });
  test('rechaza string no numérico', () => {
    expect(assignSupervisorSchema.safeParse({ supervisor_id: 'abc' }).success).toBe(false);
  });
});

// ── Encuestas ──────────────────────────────────────────────────────────────────
describe('createEncuestaSchema', () => {
  test('acepta encuesta mínima', () => {
    expect(createEncuestaSchema.safeParse({ titulo: 'Mi encuesta' }).success).toBe(true);
  });
  test('rechaza sin titulo', () => {
    expect(createEncuestaSchema.safeParse({ descripcion: 'Solo desc' }).success).toBe(false);
  });
  test('rechaza estado inválido', () => {
    expect(createEncuestaSchema.safeParse({ titulo: 'T', estado: 'activa' }).success).toBe(false);
  });
});

describe('changeEstadoSchema', () => {
  test('acepta estado publicada', () => {
    expect(changeEstadoSchema.safeParse({ estado: 'publicada' }).success).toBe(true);
  });
  test('rechaza estado desconocido', () => {
    expect(changeEstadoSchema.safeParse({ estado: 'activo' }).success).toBe(false);
  });
  test('rechaza sin estado', () => {
    expect(changeEstadoSchema.safeParse({}).success).toBe(false);
  });
});

describe('submitResponseSchema', () => {
  test('acepta respuesta válida', () => {
    expect(submitResponseSchema.safeParse({
      respuestas: [{ pregunta_id: 1, texto: 'Mi respuesta' }],
    }).success).toBe(true);
  });
  test('rechaza array vacío', () => {
    expect(submitResponseSchema.safeParse({ respuestas: [] }).success).toBe(false);
  });
  test('rechaza sin respuestas', () => {
    expect(submitResponseSchema.safeParse({}).success).toBe(false);
  });
  test('rechaza pregunta_id negativo', () => {
    expect(submitResponseSchema.safeParse({
      respuestas: [{ pregunta_id: -1, texto: 'R' }],
    }).success).toBe(false);
  });
});

// ── Schemas comunes ────────────────────────────────────────────────────────────
describe('idParamSchema', () => {
  test('acepta ID numérico positivo como string', () => {
    expect(idParamSchema.safeParse({ id: '42' }).success).toBe(true);
  });
  test('rechaza ID 0', () => {
    expect(idParamSchema.safeParse({ id: '0' }).success).toBe(false);
  });
  test('rechaza ID negativo', () => {
    expect(idParamSchema.safeParse({ id: '-5' }).success).toBe(false);
  });
  test('rechaza ID no numérico', () => {
    expect(idParamSchema.safeParse({ id: 'abc' }).success).toBe(false);
  });
  test('rechaza ID con inyección SQL', () => {
    expect(idParamSchema.safeParse({ id: "1' OR '1'='1" }).success).toBe(false);
  });
});

describe('slugParamSchema', () => {
  test('acepta slug válido', () => {
    expect(slugParamSchema.safeParse({ slug: 'mi-noticia-2025' }).success).toBe(true);
  });
  test('rechaza slug con mayúsculas', () => {
    expect(slugParamSchema.safeParse({ slug: 'Mi-Noticia' }).success).toBe(false);
  });
  test('rechaza slug con espacios', () => {
    expect(slugParamSchema.safeParse({ slug: 'mi noticia' }).success).toBe(false);
  });
  test('rechaza slug demasiado largo', () => {
    expect(slugParamSchema.safeParse({ slug: 'a'.repeat(301) }).success).toBe(false);
  });
});

describe('paginationSchema', () => {
  test('acepta query de paginación válida', () => {
    expect(paginationSchema.safeParse({ page: '2', limit: '20' }).success).toBe(true);
  });
  test('rechaza limit mayor a 100', () => {
    expect(paginationSchema.safeParse({ limit: '200' }).success).toBe(false);
  });
  test('acepta sin parámetros (todos opcionales)', () => {
    expect(paginationSchema.safeParse({}).success).toBe(true);
  });
  test('rechaza sort inválido', () => {
    expect(paginationSchema.safeParse({ sort: 'random' }).success).toBe(false);
  });
});

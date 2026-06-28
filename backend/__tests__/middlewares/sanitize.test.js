const sanitize = require('../../src/middlewares/sanitize');

function run(body) {
  const req = { body };
  sanitize(req, {}, () => {});
  return req.body;
}

describe('sanitize middleware', () => {
  test('elimina etiquetas HTML y su contenido peligroso', () => {
    // sanitize-html elimina <script> junto con su contenido (no solo la etiqueta)
    const result = run({ titulo: '<script>alert(1)</script>Hola' });
    expect(result.titulo).toBe('Hola');
  });

  test('elimina etiquetas HTML pero preserva el texto visible', () => {
    const result = run({ titulo: '<b>Título</b> de la noticia' });
    expect(result.titulo).toBe('Título de la noticia');
  });

  test('elimina HTML de campos anidados', () => {
    const result = run({ datos: { nombre: '<b>Juan</b>' } });
    expect(result.datos.nombre).toBe('Juan');
  });

  test('elimina HTML dentro de arrays', () => {
    const result = run({ tags: ['<em>uno</em>', '<b>dos</b>'] });
    expect(result.tags).toEqual(['uno', 'dos']);
  });

  test('hace trim de espacios en strings', () => {
    const result = run({ nombre: '  Juan  ' });
    expect(result.nombre).toBe('Juan');
  });

  test('NO modifica campos de password', () => {
    const result = run({ password: '  MiClave!  ' });
    expect(result.password).toBe('  MiClave!  ');
  });

  test('NO modifica campos que contienen "password" en el nombre', () => {
    const result = run({ current_password: '  abc  ', new_password: '<b>clave</b>' });
    expect(result.current_password).toBe('  abc  ');
    expect(result.new_password).toBe('<b>clave</b>');
  });

  test('NO modifica campos base64', () => {
    const b64 = 'data:image/png;base64,ABC123==';
    const result = run({ imagen_base64: b64 });
    expect(result.imagen_base64).toBe(b64);
  });

  test('NO modifica campos base64 dentro de arrays de objetos', () => {
    const b64 = 'data:image/jpeg;base64,XYZ==';
    const result = run({ imagenes_base64: [{ base64: b64, fileName: '  foto.jpg  ' }] });
    expect(result.imagenes_base64[0].base64).toBe(b64);
    expect(result.imagenes_base64[0].fileName).toBe('foto.jpg');
  });

  test('no cambia números ni booleanos', () => {
    const result = run({ activo: true, anios: 5 });
    expect(result.activo).toBe(true);
    expect(result.anios).toBe(5);
  });

  test('no rompe si body está vacío', () => {
    const result = run({});
    expect(result).toEqual({});
  });
});

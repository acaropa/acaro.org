const { validateDocumentUrl, validateDocumentMetadata } = require('../../src/utils/library-validation');

test.each(['https://acaro.org/document.PDF?download=1', 'http://acaro.org/document.pdf'])('accepts PDF URL %s', url => {
  expect(validateDocumentUrl({ archivo_url: url }, false)).toBeNull();
});
test.each(['javascript:alert(1)', 'file:///secret.pdf', 'https://acaro.org/page', 'not a url'])('rejects unsafe or non-PDF URL %s', url => {
  expect(validateDocumentUrl({ archivo_url: url }, false)).toEqual(expect.any(String));
});
test('trusted uploaded paths and omitted URLs can be retained', () => {
  expect(validateDocumentUrl({ archivo_url: '/uploads/safe.pdf' }, true)).toBeNull();
  expect(validateDocumentUrl({}, false)).toBeNull();
});
test.each([
  { destacado: 'false' }, { etiquetas: [123] }, { etiquetas: 'tag' },
  { serie: {} }, { descripcion: [] }, { imagen_portada: 42 },
  { orden_lectura: 0 }, { orden_portada: 1.5 }, { orden_portada: 'invalid' }, { visibilidad: 'other' },
])('rejects invalid metadata %#', data => {
  expect(validateDocumentMetadata(data, ['publica', 'interna'])).toEqual(expect.any(String));
});
test('accepts partial metadata and nullable optional fields', () => {
  expect(validateDocumentMetadata({}, ['publica', 'interna'])).toBeNull();
  expect(validateDocumentMetadata({ serie: null, etiquetas: ['café'], orden_lectura: '2', orden_portada: null, destacado: false }, ['publica', 'interna'])).toBeNull();
});

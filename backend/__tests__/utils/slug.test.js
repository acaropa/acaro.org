jest.mock('../../src/config/db', () => ({ query: jest.fn() }));
const { slugify } = require('../../src/utils/slug');

test.each([
  [' -- Café de Panamá -- ', 'cafe-de-panama'],
  ['---', ''],
  ['A   B', 'a-b'],
  ['á'.repeat(250), 'a'.repeat(200)],
])('normalizes slug %s', (value, expected) => {
  expect(slugify(value)).toBe(expected);
});

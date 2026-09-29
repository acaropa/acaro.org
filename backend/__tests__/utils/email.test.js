const { isContactEmail } = require('../../src/utils/email');

describe('contact email validation', () => {
  test.each(['persona@acaro.org', 'persona+noticias@sub.acaro.org'])('accepts %s', value => {
    expect(isContactEmail(value)).toBe(true);
  });
  test.each(['', 'persona', '@acaro.org', 'persona@', 'a@@acaro.org', 'a@acaro', 'a@acaro..org', 'a @acaro.org', 'a@acaro.org\n', 'a'.repeat(65) + '@acaro.org', 'a@' + 'a'.repeat(100000)])('rejects malformed or oversized email %#', value => {
    expect(isContactEmail(value)).toBe(false);
  });
});

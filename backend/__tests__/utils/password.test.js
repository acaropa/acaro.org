const { validateNewPassword, isLoginPasswordValid, MIN_PASSWORD_LENGTH, MAX_PASSWORD_BYTES } = require('../../src/utils/password');

describe('validateNewPassword', () => {
  test('acepta contraseña válida de 12+ caracteres', () => {
    expect(validateNewPassword('Contraseña123!')).toBeNull();
  });

  test('rechaza contraseña corta', () => {
    const result = validateNewPassword('corta');
    expect(result).toContain(`${MIN_PASSWORD_LENGTH}`);
  });

  test('rechaza no-string', () => {
    expect(validateNewPassword(null)).not.toBeNull();
    expect(validateNewPassword(12345678901234)).not.toBeNull();
  });

  test('rechaza contraseña que supera 72 bytes', () => {
    const larga = 'a'.repeat(MAX_PASSWORD_BYTES + 1);
    expect(validateNewPassword(larga)).not.toBeNull();
  });

  test('acepta contraseña exactamente en el límite de 12 chars', () => {
    expect(validateNewPassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBeNull();
  });
});

describe('isLoginPasswordValid', () => {
  test('acepta contraseña no vacía', () => {
    expect(isLoginPasswordValid('cualquierCosa')).toBe(true);
  });

  test('rechaza cadena vacía', () => {
    expect(isLoginPasswordValid('')).toBe(false);
  });

  test('rechaza no-string', () => {
    expect(isLoginPasswordValid(null)).toBe(false);
    expect(isLoginPasswordValid(undefined)).toBe(false);
    expect(isLoginPasswordValid(123)).toBe(false);
  });

  test('rechaza contraseña que supera 72 bytes', () => {
    expect(isLoginPasswordValid('a'.repeat(MAX_PASSWORD_BYTES + 1))).toBe(false);
  });
});

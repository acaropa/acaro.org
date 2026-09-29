const { isLocalOrigin } = require('../../src/utils/local-origin');

test.each(['http://localhost:3001', 'https://127.0.0.1:4000', 'http://192.168.1.4', 'http://10.0.0.1', 'http://172.16.0.1', 'http://172.31.255.255'])('allows local development origin %s', origin => {
  expect(isLocalOrigin(origin)).toBe(true);
});
test.each(['https://acaro.org', 'https://localhost.evil.test', 'http://172.15.0.1', 'http://172.32.0.1', 'http://192.169.0.1', 'http://192.168.999.1', 'ftp://localhost', 'http://localhost/path', 'http://user@localhost', 'not a URL'])('rejects nonlocal or malformed origin %s', origin => {
  expect(isLocalOrigin(origin)).toBe(false);
});

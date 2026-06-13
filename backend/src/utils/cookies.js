function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};

  return header.split(';').reduce((cookies, item) => {
    const separator = item.indexOf('=');
    if (separator === -1) return cookies;
    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

module.exports = { parseCookies };

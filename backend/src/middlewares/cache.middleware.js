'use strict';

/**
 * Marca la respuesta como cacheable públicamente.
 * Solo usar en endpoints GET que devuelven el MISMO contenido a TODOS los visitantes
 * sin importar quién los llama (sin autenticación en juego).
 */
function publicCache(maxAge = 300, swr = 600) {
  return (_req, res, next) => {
    res.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`);
    next();
  };
}

/**
 * Marca la respuesta como privada y no cacheable.
 * Usar en endpoints autenticados, admin, o cualquier respuesta personalizada.
 */
function privateNoStore(_req, res, next) {
  res.set('Cache-Control', 'private, no-store, max-age=0');
  next();
}

/**
 * Estrategia inteligente para endpoints con optionalAuth.
 *
 * - Sin Authorization header → contenido público → cacheable por CDN
 *   (CDN de Hostinger/LiteSpeed no cachea requests con Authorization por defecto,
 *    así que solo el flujo sin auth llega aquí con s-maxage)
 * - Con Authorization header → contenido específico del rol → nunca cachear
 */
function smartCache(maxAge = 300, swr = 600) {
  return (req, res, next) => {
    if (req.headers.authorization) {
      res.set('Cache-Control', 'private, no-store, max-age=0');
    } else {
      res.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`);
      res.set('Vary', 'Authorization');
    }
    next();
  };
}

module.exports = { publicCache, privateNoStore, smartCache };

# Seguridad y operaciones de ACARO

Esta guia resume los controles DevOps y security que deben mantenerse para `acaro.org`. Esta basada en practicas de CI/CD, hardening, gestion de secretos, respuesta a incidentes y supply chain security.

## Controles actuales

- Backend Express con Helmet, CORS allowlist, rate limiting, WAF basico, sanitizacion de payloads y manejo centralizado de errores.
- Sesiones con access token en memoria, refresh via cookie y limpieza periodica de sesiones antiguas.
- Validacion de variables criticas en arranque del backend.
- `Cache-Control: no-store` por defecto en API, con excepciones explicitas para contenido publico.
- Tests automatizados para autenticacion, CORS, sanitizacion, WAF, schemas y utilidades de password.
- Frontend Next con API base configurable mediante `NEXT_PUBLIC_API_URL`.

## CI/CD minimo

El workflow `.github/workflows/ci.yml` debe pasar antes de mezclar cambios:

- `backend`: instala con `npm ci` y corre `npm test`.
- `frontend`: instala con `npm ci`, corre `npm run lint` y `npm run build`.

No agregues secretos reales al workflow. Los valores definidos alli son datos de prueba para inicializar la app y los tests.

## Dependencias

Dependabot esta configurado para revisar semanalmente:

- Paquete raiz.
- `backend`.
- `frontend`.
- GitHub Actions.

Cuando Dependabot abra PRs, prioriza actualizaciones de seguridad y paquetes que toquen autenticacion, parsing, uploads, sanitizacion, correo, base de datos o framework web.

## Secretos y entorno

Usa `backend/.env.example` y `frontend/.env.example` como referencia. Nunca subas archivos `.env` reales.

Variables criticas de produccion:

- `JWT_SECRET`: minimo 64 caracteres aleatorios.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: credenciales de MySQL.
- `FRONTEND_URL`: origen publico permitido para CORS.
- `UPLOAD_ROOT`: ruta persistente fuera del directorio desplegado, si el hosting no conserva archivos entre releases.
- `SMTP_*`: credenciales de correo para contacto.

Rotacion recomendada:

- `JWT_SECRET`: al sospechar exposicion, cambio de proveedor o salida de personal con acceso.
- Credenciales MySQL y SMTP: al menos cada 90 dias o al detectar exposicion.
- Tokens de despliegue/hosting: despues de cualquier incidente de repositorio o CI.

## Checklist antes de produccion

- `NODE_ENV=production` en backend y frontend.
- `FRONTEND_URL=https://acaro.org` o el dominio final exacto.
- HTTPS terminado en el proxy/hosting.
- Endpoint `/api/health` monitoreado.
- Backups automaticos de MySQL verificados con una restauracion de prueba.
- `UPLOAD_ROOT` respaldado si contiene archivos de usuarios.
- Logs de aplicacion retenidos y revisables para eventos de auth, WAF, CORS y rate limit.
- Usuarios administrativos revisados y permisos minimos aplicados.

## Respuesta a incidentes

1. Contener: deshabilitar credenciales expuestas, bloquear origen/IP si aplica y pausar despliegues automaticos.
2. Preservar evidencia: guardar logs de API, proxy, hosting, base de datos y GitHub Actions.
3. Erradicar: revertir el cambio vulnerable o aplicar hotfix, rotar secretos y actualizar dependencias afectadas.
4. Recuperar: desplegar desde una revision limpia, validar `/api/health`, login, panel admin, uploads y formularios publicos.
5. Aprender: registrar causa, impacto, ventana temporal, datos afectados y cambios preventivos.

## Revisiones periodicas

- Semanal: revisar PRs de Dependabot y estado de CI.
- Mensual: revisar usuarios admin, logs de errores 4xx/5xx, WAF y rate limits.
- Trimestral: probar restauracion de backup, rotar secretos sensibles y revisar permisos de hosting/GitHub.
- Antes de cambios grandes: correr tests, lint, build y revisar rutas nuevas por auth, validacion, rate limit y sanitizacion.

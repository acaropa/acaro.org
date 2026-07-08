const nodemailer = require('nodemailer');
const pool = require('../config/db');

const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'contacto@acaro.org';

async function initTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mensajes_contacto (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      nombre      VARCHAR(255) NOT NULL,
      correo      VARCHAR(255) NOT NULL,
      asunto      VARCHAR(255) NOT NULL,
      mensaje     TEXT NOT NULL,
      leido       TINYINT(1) NOT NULL DEFAULT 0,
      respondido  TINYINT(1) NOT NULL DEFAULT 0,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

initTable().catch(err => console.error('[contact] Error creando tabla:', err));

function required(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    const err = new Error(`${field} es requerido`);
    err.status = 400;
    throw err;
  }
  return value.trim();
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    const err = new Error('SMTP no configurado');
    err.status = 503;
    throw err;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendContactMessage(data = {}) {
  const nombre = required(data.nombre, 'nombre');
  const correo = required(data.correo, 'correo');
  const asunto = required(data.asunto, 'asunto');
  const mensaje = required(data.mensaje, 'mensaje');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    const err = new Error('correo debe ser valido');
    err.status = 400;
    throw err;
  }

  // Guardar en DB
  await pool.query(
    'INSERT INTO mensajes_contacto (nombre, correo, asunto, mensaje) VALUES (?, ?, ?, ?)',
    [nombre, correo, asunto, mensaje]
  );

  // Enviar correo (sin bloquear si SMTP no está configurado)
  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: CONTACT_TO,
      replyTo: correo,
      subject: `[ACARO Contacto] ${asunto}`,
      text: [`Nombre: ${nombre}`, `Correo: ${correo}`, `Asunto: ${asunto}`, '', mensaje].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#271310">
          <h2>Nuevo mensaje desde acaro.org</h2>
          <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
          <p><strong>Correo:</strong> ${escapeHtml(correo)}</p>
          <p><strong>Asunto:</strong> ${escapeHtml(asunto)}</p>
          <hr />
          <p>${escapeHtml(mensaje).replace(/\n/g, '<br />')}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[contact] SMTP error (mensaje guardado en DB):', err.message);
  }

  return { ok: true };
}

async function listMessages() {
  const [rows] = await pool.query(
    'SELECT id, nombre, correo, asunto, leido, respondido, created_at FROM mensajes_contacto ORDER BY created_at DESC'
  );
  return rows;
}

async function getMessage(id) {
  const [[row]] = await pool.query(
    'SELECT * FROM mensajes_contacto WHERE id = ?',
    [id]
  );
  if (!row) {
    const err = new Error('Mensaje no encontrado');
    err.status = 404;
    throw err;
  }
  if (!row.leido) {
    await pool.query('UPDATE mensajes_contacto SET leido = 1 WHERE id = ?', [id]);
    row.leido = 1;
  }
  return row;
}

async function replyMessage(id, { respuesta }) {
  if (!respuesta || !respuesta.trim()) {
    const err = new Error('La respuesta no puede estar vacía');
    err.status = 400;
    throw err;
  }

  const [[row]] = await pool.query(
    'SELECT nombre, correo, asunto FROM mensajes_contacto WHERE id = ?',
    [id]
  );
  if (!row) {
    const err = new Error('Mensaje no encontrado');
    err.status = 404;
    throw err;
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: row.correo,
    subject: `Re: ${row.asunto}`,
    text: respuesta.trim(),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#271310">
        <p>${escapeHtml(respuesta.trim()).replace(/\n/g, '<br />')}</p>
        <hr style="margin-top:24px"/>
        <p style="color:#888;font-size:12px">Respuesta de ACARO OBC a tu mensaje: "${escapeHtml(row.asunto)}"</p>
      </div>
    `,
  });

  await pool.query('UPDATE mensajes_contacto SET respondido = 1, leido = 1 WHERE id = ?', [id]);
  return { ok: true };
}

async function deleteMessage(id) {
  const [result] = await pool.query('DELETE FROM mensajes_contacto WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    const err = new Error('Mensaje no encontrado');
    err.status = 404;
    throw err;
  }
  return { ok: true };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { sendContactMessage, listMessages, getMessage, replyMessage, deleteMessage };

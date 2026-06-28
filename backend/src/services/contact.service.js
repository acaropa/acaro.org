const nodemailer = require('nodemailer');

const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'contacto@acaro.org';

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

  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: CONTACT_TO,
    replyTo: correo,
    subject: `[ACARO Contacto] ${asunto}`,
    text: [
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      `Asunto: ${asunto}`,
      '',
      mensaje,
    ].join('\n'),
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

module.exports = { sendContactMessage };

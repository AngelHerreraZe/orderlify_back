'use strict';
const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Nodemailer transporter — configured via environment variables.
 *
 * Required env vars:
 *   MAIL_HOST     SMTP host  (e.g. smtp.gmail.com)
 *   MAIL_PORT     SMTP port  (e.g. 587)
 *   MAIL_USER     SMTP user  (e.g. no-reply@orderlify.net)
 *   MAIL_PASS     SMTP password or app password
 *   MAIL_FROM     From address (e.g. "Orderlify <no-reply@orderlify.net>")
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT ?? '587', 10),
  secure: process.env.MAIL_SECURE === 'true', // true for port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Sends the welcome / credentials email to a newly registered company admin.
 *
 * @param {Object} opts
 * @param {string} opts.to         Recipient email address
 * @param {string} opts.companyName
 * @param {string} opts.subdomain
 * @param {string} opts.username
 * @param {string} opts.password   Plain-text generated password (before hashing)
 */
async function sendWelcomeEmail({ to, companyName, subdomain, username, password }) {
  const appUrl = process.env.APP_URL ?? 'https://orderlify.net';
  const loginUrl = `https://${subdomain}.orderlify.net/login`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: #FF6B35; padding: 32px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 26px; }
    .body { padding: 32px 40px; }
    .body p { color: #444; line-height: 1.6; margin: 0 0 16px; }
    .credentials { background: #f8f8f8; border-left: 4px solid #FF6B35; border-radius: 6px; padding: 20px 24px; margin: 24px 0; }
    .credentials p { margin: 6px 0; font-size: 15px; color: #333; }
    .credentials strong { color: #111; }
    .btn { display: inline-block; margin-top: 24px; background: #FF6B35; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; }
    .footer { text-align: center; padding: 20px 40px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>¡Bienvenido a Orderlify!</h1>
    </div>
    <div class="body">
      <p>Hola,</p>
      <p>Tu empresa <strong>${companyName}</strong> ha sido registrada exitosamente en Orderlify. A continuación encontrarás las credenciales de acceso para tu cuenta administrador:</p>
      <div class="credentials">
        <p><strong>Subdominio:</strong> ${subdomain}.orderlify.net</p>
        <p><strong>Usuario:</strong> ${username}</p>
        <p><strong>Contraseña temporal:</strong> ${password}</p>
      </div>
      <p>Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
      <a class="btn" href="${loginUrl}">Iniciar sesión ahora</a>
      <p style="margin-top: 28px;">Si tienes alguna duda, contáctanos en <a href="mailto:soporte@orderlify.net">soporte@orderlify.net</a>.</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Orderlify · Todos los derechos reservados
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? `"Orderlify" <${process.env.MAIL_USER}>`,
    to,
    subject: `¡Bienvenido a Orderlify! Tus credenciales de acceso — ${companyName}`,
    html,
  });
}

module.exports = { sendWelcomeEmail };

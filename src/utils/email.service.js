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

// ── Shared HTML components ────────────────────────────────────────────────────

const EMAIL_STYLES = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background-color: #f0f4f8; }
    .email-wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }

    /* Header */
    .email-header { background: linear-gradient(135deg, #1a4a3a 0%, #2d7a5c 60%, #4caf80 100%); padding: 36px 40px; text-align: center; }
    .email-header img.logo { width: 140px; max-width: 100%; }
    .email-header h1 { color: #ffffff; font-size: 22px; margin-top: 14px; font-weight: 700; letter-spacing: 0.3px; }
    .email-header p.subtitle { color: #c8f0e0; font-size: 14px; margin-top: 6px; }

    /* Body */
    .email-body { padding: 36px 40px; }
    .email-body p { color: #444444; font-size: 15px; line-height: 1.7; margin-bottom: 16px; }

    /* Section cards */
    .card { background: #f7faf9; border-left: 4px solid #2d7a5c; border-radius: 8px; padding: 20px 24px; margin: 20px 0; }
    .card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #2d7a5c; margin-bottom: 12px; }
    .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8f0ec; font-size: 14px; color: #333; }
    .card-row:last-child { border-bottom: none; }
    .card-row .label { color: #666; }
    .card-row .value { font-weight: 600; color: #111; text-align: right; max-width: 60%; word-break: break-all; }

    /* Payment badge */
    .payment-status { display: inline-block; background: #e6f7ee; color: #1a7a45; border: 1px solid #a3d9b8; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }

    /* CTA Button */
    .btn-wrapper { text-align: center; margin: 28px 0 8px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2d7a5c, #4caf80); color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; }

    /* Warning box */
    .warning { background: #fffbea; border-left: 4px solid #f0b429; border-radius: 6px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #7a5c00; line-height: 1.6; }

    /* Divider */
    .divider { border: none; border-top: 1px solid #e8f0ec; margin: 24px 0; }

    /* Footer / Signature */
    .email-footer { background: linear-gradient(135deg, #0d2e22 0%, #1a4a3a 50%, #2d7a5c 100%); padding: 0; }
    .footer-wave { background: #f0f4f8; border-radius: 0 0 0 0; }
    .signature-wrapper { padding: 28px 40px; }
    .signature-logo { display: block; width: 140px; margin-bottom: 14px; filter: brightness(0) invert(1); }
    .signature-contact { color: #c8f0e0; font-size: 13px; line-height: 2; }
    .signature-contact a { color: #6ee7b7; text-decoration: none; }
    .signature-social { margin-top: 10px; }
    .signature-social a { display: inline-block; color: #6ee7b7; font-size: 13px; margin-right: 16px; text-decoration: none; }
    .signature-legal { background: #0d2e22; padding: 12px 40px; text-align: center; font-size: 11px; color: #5a8a78; }
    .signature-legal a { color: #4caf80; text-decoration: none; }
  </style>
`;

/**
 * Builds the shared email signature/footer HTML block.
 */
function buildSignatureFooter() {
  const year = new Date().getFullYear();
  return `
    <div class="email-footer">
      <div class="signature-wrapper">
        <img
          src="https://orderlify.net/orderlify-logo.png"
          alt="Orderlify"
          class="signature-logo"
          onerror="this.style.display='none'"
        />
        <div class="signature-contact">
          📧 <a href="mailto:contacto@orderlify.net">contacto@orderlify.net</a><br/>
          🌐 <a href="https://www.orderlify.net">https://www.orderlify.net</a>
        </div>
        <div class="signature-social">
          <a href="https://instagram.com/Orderlify">📷 @Orderlify</a>
          <a href="https://facebook.com/Orderlify">👤 Orderlify</a>
          <a href="https://twitter.com/Orderlify">🐦 Orderlify</a>
        </div>
      </div>
      <div class="signature-legal">
        © ${year} Orderlify · Todos los derechos reservados ·
        <a href="https://www.orderlify.net/privacidad">Privacidad</a> ·
        <a href="https://www.orderlify.net/terminos">Términos</a>
      </div>
    </div>
  `;
}

// ── Plan labels and price lookup ──────────────────────────────────────────────

const PLAN_LABELS = {
  free:          { name: 'Gratuito',        color: '#6b7280' },
  basic:         { name: 'Básico',          color: '#2d7a5c' },
  pro:           { name: 'Pro',             color: '#1d4ed8' },
  business:      { name: 'Business',        color: '#7c3aed' },
  uniestacion:   { name: 'Uniestación',     color: '#2d7a5c' },
  unisucursal:   { name: 'Unisucursal',     color: '#1d4ed8' },
  multisucursal: { name: 'Multisucursal',   color: '#7c3aed' },
};

const PLAN_PRICES = {
  basic:    { monthly: 699,  annual: 399  },
  pro:      { monthly: 1499, annual: 899  },
  business: { monthly: 3499, annual: 1999 },
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

// ── Welcome email (credentials only) ─────────────────────────────────────────

/**
 * Sends the welcome / credentials email to a newly registered company admin.
 *
 * @param {Object} opts
 * @param {string} opts.to          Recipient email address
 * @param {string} opts.companyName
 * @param {string} opts.subdomain
 * @param {string} opts.username
 * @param {string} opts.password    Plain-text generated password (before hashing)
 */
async function sendWelcomeEmail({ to, companyName, subdomain, username, password }) {
  const loginUrl = `https://${subdomain}.orderlify.net/login`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${EMAIL_STYLES}
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <img src="https://orderlify.net/orderlify-logo.png" alt="Orderlify" class="logo" />
      <h1>¡Bienvenido a Orderlify!</h1>
      <p class="subtitle">Tu cuenta ha sido creada exitosamente</p>
    </div>

    <div class="email-body">
      <p>Hola,</p>
      <p>
        Tu empresa <strong>${companyName}</strong> ha sido registrada exitosamente en Orderlify.
        A continuación encontrarás las credenciales de acceso para tu cuenta administrador:
      </p>

      <div class="card">
        <div class="card-title">🔑 Credenciales de Acceso</div>
        <div class="card-row"><span class="label">Subdominio</span><span class="value">${subdomain}.orderlify.net</span></div>
        <div class="card-row"><span class="label">Usuario</span><span class="value">${username}</span></div>
        <div class="card-row"><span class="label">Contraseña temporal</span><span class="value">${password}</span></div>
      </div>

      <div class="warning">
        ⚠️ <strong>Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña
        inmediatamente después del primer inicio de sesión.
      </div>

      <div class="btn-wrapper">
        <a class="btn" href="${loginUrl}">Iniciar sesión ahora →</a>
      </div>

      <hr class="divider" />
      <p style="font-size: 13px; color: #888;">
        Si tienes alguna duda, escríbenos a
        <a href="mailto:contacto@orderlify.net" style="color: #2d7a5c;">contacto@orderlify.net</a>.
      </p>
    </div>

    ${buildSignatureFooter()}
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? `"Orderlify" <no-reply@orderlify.net>`,
    to,
    subject: `¡Bienvenido a Orderlify! Tus credenciales de acceso — ${companyName}`,
    html,
  });
}

// ── Registration + Payment confirmation email ─────────────────────────────────

/**
 * Sends a combined registration + payment confirmation email after a
 * successful Stripe payment and company registration.
 *
 * @param {Object} opts
 * @param {string}  opts.to              Recipient email address
 * @param {string}  opts.companyName     Registered company name
 * @param {string}  opts.subdomain       Assigned subdomain (without .orderlify.net)
 * @param {string}  opts.username        Admin username generated
 * @param {string}  opts.password        Plain-text temp password
 * @param {string}  opts.plan            Plan key: basic | pro | business | uniestacion | ...
 * @param {string}  [opts.billing]       'monthly' | 'annual' (default: 'monthly')
 * @param {number}  [opts.amountPaid]    Amount charged in MXN (override auto-lookup)
 * @param {string}  [opts.stripePaymentId] Stripe PaymentIntent ID (pi_xxx)
 * @param {string}  [opts.invoiceDate]   ISO date string (default: now)
 */
async function sendRegistrationAndPaymentEmail({
  to,
  companyName,
  subdomain,
  username,
  password,
  plan,
  billing = 'monthly',
  amountPaid,
  stripePaymentId,
  invoiceDate,
}) {
  const loginUrl  = `https://${subdomain}.orderlify.net/login`;
  const planInfo  = PLAN_LABELS[plan] ?? { name: plan, color: '#2d7a5c' };
  const prices    = PLAN_PRICES[plan];
  const amount    = amountPaid ?? (prices ? prices[billing] : 0);
  const dateLabel = invoiceDate
    ? new Date(invoiceDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const billingLabel = billing === 'annual' ? 'Anual' : 'Mensual';

  const paymentSection = plan !== 'free' ? `
    <div class="payment-status">✅ Pago confirmado</div>

    <div class="card">
      <div class="card-title">💳 Detalle del Pago</div>
      <div class="card-row">
        <span class="label">Plan</span>
        <span class="value" style="color: ${planInfo.color}; font-weight: 700;">${planInfo.name}</span>
      </div>
      <div class="card-row">
        <span class="label">Facturación</span>
        <span class="value">${billingLabel}</span>
      </div>
      <div class="card-row">
        <span class="label">Monto cobrado</span>
        <span class="value">${formatCurrency(amount)} MXN</span>
      </div>
      <div class="card-row">
        <span class="label">Fecha</span>
        <span class="value">${dateLabel}</span>
      </div>
      ${stripePaymentId ? `
      <div class="card-row">
        <span class="label">ID de transacción</span>
        <span class="value" style="font-size: 12px; font-family: monospace;">${stripePaymentId}</span>
      </div>` : ''}
    </div>
  ` : `
    <div class="payment-status" style="background:#f0f4ff; color:#1d4ed8; border-color:#93c5fd;">
      ✨ Plan Gratuito activado
    </div>
  `;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${EMAIL_STYLES}
</head>
<body>
  <div class="email-wrapper">

    <!-- Header -->
    <div class="email-header">
      <img src="https://orderlify.net/orderlify-logo.png" alt="Orderlify" class="logo" />
      <h1>¡Alta y pago confirmados!</h1>
      <p class="subtitle">Gracias por elegir Orderlify, ${companyName}</p>
    </div>

    <!-- Body -->
    <div class="email-body">
      <p>Hola,</p>
      <p>
        Tu empresa <strong>${companyName}</strong> ha sido registrada y activada exitosamente.
        ${plan !== 'free' ? 'Hemos procesado tu pago de forma segura a través de Stripe.' : ''}
        A continuación encontrarás el resumen de tu alta y los datos de acceso a tu plataforma.
      </p>

      <!-- Payment info -->
      ${paymentSection}

      <hr class="divider" />

      <!-- Registration / credentials -->
      <div class="card">
        <div class="card-title">🏢 Datos de tu Cuenta</div>
        <div class="card-row"><span class="label">Empresa</span><span class="value">${companyName}</span></div>
        <div class="card-row"><span class="label">Subdominio</span><span class="value">${subdomain}.orderlify.net</span></div>
        <div class="card-row"><span class="label">Usuario administrador</span><span class="value">${username}</span></div>
        <div class="card-row"><span class="label">Contraseña temporal</span><span class="value">${password}</span></div>
      </div>

      <div class="warning">
        ⚠️ <strong>Importante:</strong> Esta contraseña es temporal. Por seguridad, cámbiala
        inmediatamente al iniciar sesión por primera vez.
      </div>

      <div class="btn-wrapper">
        <a class="btn" href="${loginUrl}">Acceder a mi cuenta →</a>
      </div>

      <hr class="divider" />
      <p style="font-size: 13px; color: #888; text-align: center;">
        ¿Tienes preguntas? Escríbenos a
        <a href="mailto:contacto@orderlify.net" style="color: #2d7a5c;">contacto@orderlify.net</a>
      </p>
    </div>

    <!-- Footer / Firma -->
    ${buildSignatureFooter()}
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? `"Orderlify" <no-reply@orderlify.net>`,
    to,
    subject: `✅ Cuenta activada — ${companyName} ya está en Orderlify`,
    html,
  });
}

module.exports = { sendWelcomeEmail, sendRegistrationAndPaymentEmail };

'use strict';
const crypto = require('crypto');
const db = require('../database/models/index');
const { sendWelcomeEmail } = require('../utils/email.service');

const ALPHANUM =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// PAYPAL CHANGE: Catálogo centralizado de precios compartido entre Stripe y PayPal.
const PLAN_PRICES = {
  basic: { monthly: 699 * 100, annual: 399 * 12 * 100 },
  pro: { monthly: 1499 * 100, annual: 899 * 12 * 100 },
  business: { monthly: 3499 * 100, annual: 1999 * 12 * 100 },
};
// PAYPAL CHANGE: Configuración de PayPal vía variables de entorno para no hardcodear llaves.
const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || 'MXN';
const PAYPAL_BRAND_NAME = process.env.PAYPAL_BRAND_NAME || 'Orderlify';
// PAYPAL CHANGE: Price IDs y Plan IDs para suscripciones reales mensual/anual.
const STRIPE_PRICE_IDS = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    annual: process.env.STRIPE_PRICE_BASIC_ANNUAL,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    annual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL,
  },
};
const PAYPAL_PLAN_IDS = {
  basic: {
    monthly: process.env.PAYPAL_PLAN_BASIC_MONTHLY,
    annual: process.env.PAYPAL_PLAN_BASIC_ANNUAL,
  },
  pro: {
    monthly: process.env.PAYPAL_PLAN_PRO_MONTHLY,
    annual: process.env.PAYPAL_PLAN_PRO_ANNUAL,
  },
  business: {
    monthly: process.env.PAYPAL_PLAN_BUSINESS_MONTHLY,
    annual: process.env.PAYPAL_PLAN_BUSINESS_ANNUAL,
  },
};

/**
 * Generates a random 10-character alphanumeric password.
 */
function generatePassword() {
  const bytes = crypto.randomBytes(10);
  let pass = '';
  for (let i = 0; i < 10; i++) {
    pass += ALPHANUM[bytes[i] % ALPHANUM.length];
  }
  return pass;
}

// PAYPAL CHANGE: Helper para reutilizar la validación de monto en ambos gateways.
function getPlanAmount(plan, billing = 'monthly') {
  if (!PLAN_PRICES[plan]) {
    const err = new Error('Plan inválido.');
    err.statusCode = 400;
    throw err;
  }

  if (!['monthly', 'annual'].includes(billing)) {
    const err = new Error('Ciclo de facturación inválido.');
    err.statusCode = 400;
    throw err;
  }

  return PLAN_PRICES[plan][billing];
}

// PAYPAL CHANGE: resuelve el identificador real del plan de suscripción según gateway y ciclo.
function getGatewayPlanId(provider, plan, billing = 'monthly') {
  getPlanAmount(plan, billing);

  const catalog = provider === 'stripe' ? STRIPE_PRICE_IDS : PAYPAL_PLAN_IDS;
  const planId = catalog?.[plan]?.[billing];

  // Log para facilitar diagnóstico en desarrollo — se ve en la consola del servidor.
  if (!planId) {
    const envKey =
      provider === 'stripe'
        ? `STRIPE_PRICE_${plan.toUpperCase()}_${billing.toUpperCase()}`
        : `PAYPAL_PLAN_${plan.toUpperCase()}_${billing.toUpperCase()}`;
    console.error(
      `[payment config] Variable de entorno faltante o vacía: ${envKey}. ` +
        `Revisa tu archivo .env y asegúrate de que el ID exista en el ambiente correcto ` +
        `(${provider === 'paypal' ? process.env.PAYPAL_ENV || 'sandbox' : 'stripe'}).`,
    );
    const err = new Error(
      provider === 'stripe'
        ? `Falta configurar el Price ID de Stripe para el plan "${plan}" (${billing}). Revisa las variables de entorno del servidor.`
        : `Falta configurar el Plan ID de PayPal para el plan "${plan}" (${billing}). Revisa las variables de entorno del servidor.`,
    );
    err.statusCode = 500;
    throw err;
  }

  return planId;
}

// PAYPAL CHANGE: Stripe ahora crea una suscripción real e incompleta para cobrar el primer invoice.
async function createStripeSubscription({ plan, billing = 'monthly' }) {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Stripe no está configurado en el servidor.');
    err.statusCode = 500;
    throw err;
  }

  const priceId = getGatewayPlanId('stripe', plan, billing);
  const keyMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test';
  console.log(`[Stripe] plan=${plan} billing=${billing} priceId=${priceId} keyMode=${keyMode}`);

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const customer = await stripe.customers.create({
    metadata: { plan, billing, source: 'public_registration' },
  });
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: { plan, billing, source: 'public_registration' },
  });
  const paymentIntent = subscription.latest_invoice?.payment_intent;

  if (!paymentIntent?.client_secret) {
    console.error(
      '[Stripe] La suscripción no trajo payment_intent.client_secret.',
      {
        subscriptionId: subscription.id,
        status: subscription.status,
        latestInvoice: subscription.latest_invoice?.id,
        paymentIntentStatus: paymentIntent?.status,
      },
    );
    const err = new Error(
      'Stripe no devolvió el client secret. Verifica que el Price ID sea de tipo "recurring" y que la cuenta Stripe esté activa.',
    );
    err.statusCode = 500;
    throw err;
  }

  return {
    clientSecret: paymentIntent.client_secret,
    amountMXN: getPlanAmount(plan, billing) / 100,
    subscriptionId: subscription.id,
    customerId: customer.id,
  };
}

// PAYPAL CHANGE: valida en servidor la suscripción creada en Stripe.
async function verifyStripeSubscription(subscriptionId) {
  if (!subscriptionId) {
    const err = new Error(
      'El identificador de la suscripción Stripe es requerido.',
    );
    err.statusCode = 400;
    throw err;
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    customerId: subscription.customer,
  };
}

// PAYPAL CHANGE: Token OAuth2 para hablar con la API de PayPal.
async function getPaypalAccessToken() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    const err = new Error('PayPal no está configurado en el servidor.');
    err.statusCode = 500;
    throw err;
  }

  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const payload = await response.json();

  if (!response.ok || !payload.access_token) {
    const err = new Error(
      payload.error_description || 'No se pudo autenticar con PayPal.',
    );
    err.statusCode = response.status || 500;
    throw err;
  }

  return payload.access_token;
}

// PAYPAL CHANGE: Wrapper pequeño para unificar manejo de errores de PayPal.
async function paypalRequest(path, options = {}) {
  const accessToken = await getPaypalAccessToken();
  const response = await fetch(`${PAYPAL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const detail = payload?.details?.[0]?.description || payload?.message;
    const err = new Error(
      detail || 'PayPal devolvió un error al procesar la solicitud.',
    );
    err.statusCode = response.status || 500;
    throw err;
  }

  return payload;
}

// PAYPAL CHANGE: el frontend solicita el Plan ID correcto para crear la suscripción oficial de PayPal.
async function getPaypalSubscriptionPlan({ plan, billing = 'monthly' }) {
  return {
    planId: getGatewayPlanId('paypal', plan, billing),
    amountMXN: getPlanAmount(plan, billing) / 100,
  };
}

// PAYPAL CHANGE: valida la suscripción PayPal aprobada por el cliente.
async function verifyPaypalSubscription(subscriptionId) {
  if (!subscriptionId) {
    const err = new Error(
      'El identificador de la suscripción PayPal es requerido.',
    );
    err.statusCode = 400;
    throw err;
  }

  const payload = await paypalRequest(
    `/v1/billing/subscriptions/${subscriptionId}`,
  );

  return {
    subscriptionId: payload.id,
    status: payload.status,
    planId: payload.plan_id || null,
    payerId: payload.subscriber?.payer_id || null,
  };
}

/**
 * Registers a new company with its admin user in a single transaction.
 *
 * Steps:
 *  1. Validate subdomain uniqueness
 *  2. Create the Company record
 *  3. Create the admin User (random 10-char password)
 *  4. Resolve the Admin role (create if it doesn't exist yet in the tenant DB)
 *  5. Assign UsersRoles { userId, roleId, isPrimary: true }
 *  6. Send welcome email with credentials
 *
 * @param {Object} data
 * @param {string}  data.name
 * @param {string}  [data.legalName]
 * @param {string}  [data.phone]
 * @param {string}  data.email       Contact / admin email
 * @param {string}  [data.address]
 * @param {string}  data.subdomain
 * @param {string}  data.plan        'uniestacion' | 'unisucursal' | 'multisucursal'
 */
async function registerCompany(data) {
  const { name, legalName, phone, email, address, subdomain, plan } = data;

  // 1. Check subdomain uniqueness
  const existing = await db.Company.findOne({
    where: { subdomain: subdomain.toLowerCase() },
  });
  if (existing) {
    const err = new Error('El subdominio ya está en uso. Elige otro.');
    err.statusCode = 409;
    throw err;
  }

  // Generate credentials before the transaction
  const rawPassword = generatePassword();
  const adminUsername = `admin.${subdomain.toLowerCase()}`;

  // Check username uniqueness (very unlikely to collide, but let's be safe)
  const existingUser = await db.User.findOne({
    where: { username: adminUsername },
  });
  if (existingUser) {
    const err = new Error('Ya existe un administrador con ese subdominio.');
    err.statusCode = 409;
    throw err;
  }

  const t = await db.sequelize.transaction();

  try {
    // 2. Create company
    const company = await db.Company.create(
      {
        name,
        legalName: legalName || null,
        phone: phone || null,
        email,
        address: address || null,
        subdomain: subdomain.toLowerCase(),
        plan: plan || 'free',
        active: true,
        status: 'active',
      },
      { transaction: t },
    );

    // 3. Create admin user — password is hashed via the User beforeCreate hook
    const adminUser = await db.User.create(
      {
        username: adminUsername,
        password: rawPassword,
        name: 'Administrador',
        lastname: name,
        companyId: company.id,
        passwordChanged: false,
        active: true,
      },
      { transaction: t },
    );

    // 4. Resolve Admin role (find or create within the transaction)
    const [adminRole] = await db.Roles.findOrCreate({
      where: { name: 'Admin' },
      defaults: { name: 'Admin' },
      transaction: t,
    });

    // 5. Assign Admin role as primary
    await db.UsersRoles.create(
      {
        userId: adminUser.id,
        roleId: adminRole.id,
        isPrimary: true,
      },
      { transaction: t },
    );

    await t.commit();

    // 6. Send email (outside transaction — not a DB operation)
    try {
      await sendWelcomeEmail({
        to: email,
        companyName: name,
        subdomain: subdomain.toLowerCase(),
        username: adminUsername,
        password: rawPassword,
      });
    } catch (mailErr) {
      // Log but don't fail the registration if email sending fails
      console.error('[registration] Email send failed:', mailErr.message);
    }

    return {
      companyId: company.id,
      subdomain: company.subdomain,
      username: adminUsername,
    };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

module.exports = {
  registerCompany,
  createStripeSubscription,
  verifyStripeSubscription,
  getPaypalSubscriptionPlan,
  verifyPaypalSubscription,
  getPlanAmount,
};

'use strict';
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  registerCompany,
  createStripeSubscription: createStripeSubscriptionService,
  verifyStripeSubscription: verifyStripeSubscriptionService,
  getPaypalSubscriptionPlan: getPaypalSubscriptionPlanService,
  verifyPaypalSubscription: verifyPaypalSubscriptionService,
} = require('../services/registration.service');

const VALID_PLANS = ['free', 'basic', 'pro', 'business', 'uniestacion', 'unisucursal', 'multisucursal'];
const SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

exports.register = catchAsync(async (req, res, next) => {
  const {
    name,
    legalName,
    phone,
    email,
    address,
    subdomain,
    plan,
    paymentProvider,
    stripeSubscriptionId,
    paypalSubscriptionId,
  } = req.body;

  // ── Basic validation ───────────────────────────────────────────────────────
  if (!name || !name.trim()) {
    return next(new AppError('El nombre de la empresa es requerido', 400));
  }
  if (!email || !email.trim()) {
    return next(new AppError('El correo electrónico es requerido', 400));
  }
  if (!subdomain || !subdomain.trim()) {
    return next(new AppError('El subdominio es requerido', 400));
  }
  if (!SUBDOMAIN_RE.test(subdomain.trim().toLowerCase())) {
    return next(
      new AppError(
        'El subdominio solo puede contener letras minúsculas, números y guiones, y no puede empezar ni terminar con guión.',
        400,
      ),
    );
  }
  if (plan && !VALID_PLANS.includes(plan)) {
    return next(new AppError('Plan inválido', 400));
  }

  // PAYPAL CHANGE: Para planes pagados validamos qué pasarela confirmó el cobro.
  if ((plan || 'free') !== 'free') {
    if (!['stripe', 'paypal'].includes(paymentProvider)) {
      return next(new AppError('Selecciona un método de pago válido.', 400));
    }
    if (paymentProvider === 'stripe' && !stripeSubscriptionId) {
      return next(new AppError('No se recibió la confirmación de la suscripción con Stripe.', 400));
    }
    if (paymentProvider === 'paypal' && !paypalSubscriptionId) {
      return next(new AppError('No se recibió la confirmación de la suscripción con PayPal.', 400));
    }
    // PAYPAL CHANGE: Validación real contra el gateway antes de registrar la empresa.
    if (paymentProvider === 'stripe') {
      const stripeSubscription = await verifyStripeSubscriptionService(stripeSubscriptionId);
      const allowedStatuses = ['active', 'trialing', 'past_due', 'incomplete'];
      if (!allowedStatuses.includes(stripeSubscription.status)) {
        return next(new AppError('La suscripción de Stripe aún no está activa.', 400));
      }
    }
    if (paymentProvider === 'paypal') {
      const paypalSubscription = await verifyPaypalSubscriptionService(paypalSubscriptionId);
      const allowedStatuses = ['ACTIVE', 'APPROVAL_PENDING', 'APPROVED'];
      if (!allowedStatuses.includes(paypalSubscription.status)) {
        return next(new AppError('La suscripción de PayPal aún no está activa.', 400));
      }
    }
  }

  const result = await registerCompany({
    name: name.trim(),
    legalName: legalName?.trim() || null,
    phone: phone?.trim() || null,
    email: email.trim().toLowerCase(),
    address: address?.trim() || null,
    subdomain: subdomain.trim().toLowerCase(),
    plan: plan || 'free',
  });

  return res.status(201).json({
    status: 'success',
    message: 'Empresa registrada exitosamente. Revisa tu correo para las credenciales de acceso.',
    data: {
      subdomain: result.subdomain,
    },
  });
});

// PAYPAL CHANGE: Endpoint para crear la suscripción real de Stripe según plan y ciclo.
exports.createStripeSubscription = catchAsync(async (req, res) => {
  const { plan, billing = 'monthly' } = req.body;
  const result = await createStripeSubscriptionService({ plan, billing });
  return res.json(result);
});

// PAYPAL CHANGE: Devuelve el Plan ID de PayPal que debe usar el botón oficial.
exports.getPaypalSubscriptionPlan = catchAsync(async (req, res) => {
  const { plan, billing = 'monthly' } = req.body;
  const result = await getPaypalSubscriptionPlanService({ plan, billing });
  return res.json(result);
});

// PAYPAL CHANGE: Verifica el estado de la suscripción PayPal aprobada en frontend.
exports.verifyPaypalSubscription = catchAsync(async (req, res) => {
  const { subscriptionId } = req.body;

  if (!subscriptionId) {
    throw new AppError('El identificador de la suscripción PayPal es requerido.', 400);
  }

  const result = await verifyPaypalSubscriptionService(subscriptionId);
  return res.json(result);
});

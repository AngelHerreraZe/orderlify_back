'use strict';
const { Router } = require('express');
const registrationController = require('../controllers/registration.controller');

const router = Router();

// ── Registro público de empresa — no requiere autenticación ni subdominio ──
router.post('/companies/register', registrationController.register);

// ── Stripe: crear PaymentIntent para planes de pago ─────────────────────────
/* PAYPAL CHANGE: referencia del catálogo antiguo de Stripe.
const PLAN_PRICES = {
  basic:    { monthly: 699 * 100,  annual: 399 * 12 * 100  },
  pro:      { monthly: 1499 * 100, annual: 899 * 12 * 100  },
  business: { monthly: 3499 * 100, annual: 1999 * 12 * 100 },
};
*/

router.post('/payments/stripe/create-subscription', registrationController.createStripeSubscription);
// PAYPAL CHANGE: Nuevos endpoints públicos para crear y capturar órdenes PayPal.
router.post('/payments/paypal/plan-id', registrationController.getPaypalSubscriptionPlan);
router.post('/payments/paypal/verify-subscription', registrationController.verifyPaypalSubscription);
/* PAYPAL CHANGE: el bloque legacy de Stripe se deja desactivado para ubicar rápido el cambio.
router.post('/payments/create-payment-intent', async (req, res) => {
  const { plan, billing = 'monthly' } = req.body;

  if (!PLAN_PRICES[plan]) {
    return res.status(400).json({ message: 'Plan inválido.' });
  }
  if (!['monthly', 'annual'].includes(billing)) {
    return res.status(400).json({ message: 'Ciclo de facturación inválido.' });
  }

  const amount = PLAN_PRICES[plan][billing];

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'mxn',
      automatic_payment_methods: { enabled: true },
      metadata: { plan, billing },
    });
    return res.json({ clientSecret: intent.client_secret, amountMXN: amount / 100 });
  } catch (err) {
    console.error('[Stripe] create intent error:', err.message);
    return res.status(500).json({ message: 'No se pudo iniciar el pago. Intenta de nuevo.' });
  }
});
*/

module.exports = router;

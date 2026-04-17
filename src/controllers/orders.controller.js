'use strict';
const catchAsync     = require('../utils/catchAsync');
const AppError       = require('../utils/appError');
const ordersServices = require('../services/orders.services');
const { emitToTenant } = require('../socket');

const VALID_STATUSES = ['Pendiente', 'Preparando', 'Completado', 'Cancelado'];

// Mapa para traducir comandos de voz en español → status BD
const VOICE_STATUS_MAP = {
  // Pendiente
  'pendiente':     'Pendiente',
  'pending':       'Pendiente',
  // Preparando
  'preparando':    'Preparando',
  'en preparacion': 'Preparando',
  'en preparación': 'Preparando',
  'preparacion':   'Preparando',
  'preparing':     'Preparando',
  // Completado / lista
  'lista':         'Completado',
  'listo':         'Completado',
  'completado':    'Completado',
  'completada':    'Completado',
  'ready':         'Completado',
  'done':          'Completado',
  // Cancelado
  'cancelada':     'Cancelado',
  'cancelado':     'Cancelado',
  'cancelled':     'Cancelado',
  'canceled':      'Cancelado',
};

exports.createOrder = catchAsync(async (req, res) => {
  const { tableId, userId, status, total, serviceType } = req.body;
  const order = await ordersServices.createOrder(tableId, userId, status, total, req.tenant, serviceType ?? null);
  return res.status(201).json({ order });
});

exports.getOrders = catchAsync(async (req, res) => {
  const orders = await ordersServices.getOrders(req.tenant);
  return res.json({ orders });
});

exports.getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const order = await ordersServices.getOrderById(id);
  return res.json({ order });
});

exports.updateOrder = catchAsync(async (req, res) => {
  const { tableId, userId, status, total } = req.body;
  const { id } = req.params;
  await ordersServices.updateOrder(tableId, userId, status, total, id);
  return res.sendStatus(204);
});

exports.deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ordersServices.deleteOrder(id);
  return res.sendStatus(204);
});

exports.addItemsToOrder = catchAsync(async (req, res) => {
  const items   = req.body;
  const orderId = req.params.orderId;
  const itemsArray = Object.values(items).map((item) => ({
    ...item,
    orderId: parseInt(orderId),
    excludedIngredients: item.excludedIngredients ?? null,
  }));
  await ordersServices.addItemsToOrder(itemsArray);
  return res.sendStatus(200);
});

exports.editOrderItems = catchAsync(async (req, res) => {
  const { orderId, productId } = req.params;
  const { quantity, price }    = req.body;
  await ordersServices.editOrderItems(orderId, productId, quantity, price);
  return res.sendStatus(204);
});

exports.deleteOrderItem = catchAsync(async (req, res) => {
  const { orderId, productId } = req.params;
  await ordersServices.deleteOrderItem(orderId, productId);
  return res.sendStatus(204);
});

/**
 * PATCH /orders/:id/voice-status
 *
 * Permite al Chef actualizar el estado de una orden mediante comando de voz.
 * Body: { rawCommand: "orden 42 lista" } | { status: "Completado" }
 *
 * La UI envía el transcript crudo del Web Speech API y el backend lo parsea.
 */
exports.voiceUpdateStatus = catchAsync(async (req, res, next) => {
  const { id }         = req.params;
  const { rawCommand, status: directStatus } = req.body;

  let resolvedStatus = directStatus;

  if (!resolvedStatus && rawCommand) {
    // Parsear el comando de voz crudo
    const normalised = rawCommand.toLowerCase().trim();
    for (const [keyword, mapped] of Object.entries(VOICE_STATUS_MAP)) {
      if (normalised.includes(keyword)) {
        resolvedStatus = mapped;
        break;
      }
    }
  }

  if (!resolvedStatus) {
    return next(new AppError(
      `Comando no reconocido. Estados válidos: ${Object.keys(VOICE_STATUS_MAP).join(', ')}`,
      400,
    ));
  }

  if (!VALID_STATUSES.includes(resolvedStatus)) {
    return next(new AppError(`Estado inválido: ${resolvedStatus}`, 400));
  }

  // Obtener la orden para verificar que existe y extraer tenant
  const db = require('../database/models/index');
  const order = await db.Orders.findByPk(id);
  if (!order) return next(new AppError('Orden no encontrada', 404));

  await ordersServices.updateOrder(order.tableId, order.userId, resolvedStatus, order.total, id);

  // Notificar en tiempo real a los sockets del tenant
  emitToTenant(order.companyId, 'order:status_updated', {
    orderId:  parseInt(id),
    status:   resolvedStatus,
    updatedBy: req.user.username,
    channel:  'voice',
  });

  return res.json({
    status:  'success',
    message: `Orden #${id} actualizada a "${resolvedStatus}"`,
    orderId: parseInt(id),
    newStatus: resolvedStatus,
  });
});

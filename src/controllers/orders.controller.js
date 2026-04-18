'use strict';
const catchAsync     = require('../utils/catchAsync');
const AppError       = require('../utils/appError');
const ordersServices = require('../services/orders.services');
const { emitToTenant } = require('../socket');

const VALID_STATUSES      = ['Pendiente', 'Preparando', 'Completado', 'Cancelado'];
const VALID_ITEM_STATUSES = ['Pendiente', 'Preparando', 'Listo'];

// Mapa para traducir comandos de voz en español → status BD
const VOICE_STATUS_MAP = {
  'pendiente':      'Pendiente',
  'pending':        'Pendiente',
  'preparando':     'Preparando',
  'en preparacion': 'Preparando',
  'en preparación': 'Preparando',
  'preparacion':    'Preparando',
  'preparing':      'Preparando',
  'lista':          'Completado',
  'listo':          'Completado',
  'completado':     'Completado',
  'completada':     'Completado',
  'ready':          'Completado',
  'done':           'Completado',
  'cancelada':      'Cancelado',
  'cancelado':      'Cancelado',
  'cancelled':      'Cancelado',
  'canceled':       'Cancelado',
};

// ─── Órdenes ──────────────────────────────────────────────────────────────────

/**
 * POST /orders
 * Si la mesa ya tiene una orden activa (Pendiente/Preparando), devuelve esa orden
 * en vez de crear una nueva. El frontend agrega los ítems a la orden existente.
 */
exports.createOrder = catchAsync(async (req, res) => {
  const { tableId, userId, status, total, serviceType } = req.body;

  // Verificar si ya existe una orden activa para esta mesa
  const existing = await ordersServices.findActiveOrderForTable(tableId, req.tenant);
  if (existing) {
    return res.status(200).json({ order: existing, existing: true });
  }

  const order = await ordersServices.createOrder(tableId, userId, status, total, req.tenant, serviceType ?? null);
  const companyId = order.companyId ?? req.tenant?.companyId ?? req.user?.companyId;
  emitToTenant(companyId, 'order:new', { order });

  return res.status(201).json({ order, existing: false });
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

  const db = require('../database/models/index');
  const order = await db.Orders.findByPk(id, {
    include: [{ model: db.Tables, as: 'table', attributes: ['id', 'tableNumber'] }],
  });

  const companyId = order?.companyId ?? req.tenant?.companyId ?? req.user?.companyId;
  emitToTenant(companyId, 'order:updated', { orderId: parseInt(id), status });

  if (status === 'Completado' && order) {
    emitToTenant(companyId, 'order:ready', {
      orderId:     parseInt(id),
      tableId:     order.tableId,
      tableNumber: order.table?.tableNumber ?? null,
      status:      'Completado',
    });
  }

  return res.sendStatus(204);
});

exports.deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ordersServices.deleteOrder(id);
  return res.sendStatus(204);
});

// ─── Ítems ────────────────────────────────────────────────────────────────────

exports.addItemsToOrder = catchAsync(async (req, res) => {
  const items   = req.body;
  const orderId = req.params.orderId;
  const itemsArray = Object.values(items).map((item) => ({
    ...item,
    orderId: parseInt(orderId),
    excludedIngredients: item.excludedIngredients ?? null,
  }));
  await ordersServices.addItemsToOrder(itemsArray);

  // Emitir evento para que la cocina refresque y vea los ítems nuevos
  const db = require('../database/models/index');
  const order = await db.Orders.findByPk(orderId, {
    include: [{ model: db.Tables, as: 'table', attributes: ['id', 'tableNumber'] }],
  });
  const companyId = order?.companyId ?? req.tenant?.companyId ?? req.user?.companyId;
  emitToTenant(companyId, 'order:items_added', {
    orderId: parseInt(orderId),
    tableNumber: order?.table?.tableNumber ?? null,
  });

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
 * PATCH /orders/:orderId/items/:itemId/status
 * El Chef marca un ítem específico como Preparando o Listo.
 * Cuando todos los ítems de la orden están Listos, la orden pasa a Completado.
 */
exports.updateItemStatus = catchAsync(async (req, res, next) => {
  const { orderId, itemId } = req.params;
  const { itemStatus }      = req.body;

  if (!VALID_ITEM_STATUSES.includes(itemStatus)) {
    return next(new AppError(`itemStatus inválido: ${itemStatus}`, 400));
  }

  const db = require('../database/models/index');

  // Cargar el ítem con su producto y categoría
  const item = await db.OrdersItems.findOne({
    where: { id: itemId, orderId },
    include: [{ model: db.Products, include: [{ model: db.Categories }] }],
  });
  if (!item) return next(new AppError('Ítem no encontrado', 404));

  const categoryName = item.Product?.Category?.name ?? 'Sin categoría';

  await ordersServices.updateItemStatus(orderId, itemId, itemStatus);

  // Cargar todos los ítems de la orden con sus categorías para verificar estado
  const allItems = await db.OrdersItems.findAll({
    where: { orderId },
    include: [{ model: db.Products, include: [{ model: db.Categories }] }],
  });

  // Estado efectivo de cada ítem (aplicar el cambio que acabamos de hacer)
  const withNew = allItems.map((i) =>
    i.id === parseInt(itemId) ? { ...i.toJSON(), itemStatus } : i.toJSON()
  );

  const allDone = withNew.every((i) => i.itemStatus === 'Listo');

  const order = await db.Orders.findByPk(orderId, {
    include: [{ model: db.Tables, as: 'table', attributes: ['id', 'tableNumber'] }],
  });

  const companyId  = order?.companyId ?? req.tenant?.companyId ?? req.user?.companyId;
  const tableNumber = order?.table?.tableNumber ?? null;

  if (allDone) {
    // Toda la orden terminada
    await ordersServices.updateOrder(order.tableId, order.userId, 'Completado', order.total, orderId);
    emitToTenant(companyId, 'order:updated', { orderId: parseInt(orderId), status: 'Completado' });
    emitToTenant(companyId, 'order:ready', {
      orderId,
      tableId:     order.tableId,
      tableNumber,
      status:      'Completado',
      category:    null, // null = toda la orden
    });
  } else {
    // Si algún ítem pasa a Preparando y la orden estaba Pendiente, avanzarla
    if (itemStatus === 'Preparando' && order?.status === 'Pendiente') {
      await ordersServices.updateOrder(order.tableId, order.userId, 'Preparando', order.total, orderId);
    }

    // Verificar si TODOS los ítems de esta categoría quedaron Listos
    if (itemStatus === 'Listo') {
      const sameCat    = withNew.filter((i) => (i.Product?.Category?.name ?? 'Sin categoría') === categoryName);
      const catAllDone = sameCat.every((i) => i.itemStatus === 'Listo');
      if (catAllDone) {
        emitToTenant(companyId, 'order:category_ready', {
          orderId:     parseInt(orderId),
          tableNumber,
          category:    categoryName,
        });
      }
    }

    emitToTenant(companyId, 'order:item_status', {
      orderId:    parseInt(orderId),
      itemId:     parseInt(itemId),
      itemStatus,
    });
  }

  return res.json({ success: true, allDone });
});

// ─── Voz ──────────────────────────────────────────────────────────────────────

exports.voiceUpdateStatus = catchAsync(async (req, res, next) => {
  const { id }         = req.params;
  const { rawCommand, status: directStatus } = req.body;

  let resolvedStatus = directStatus;

  if (!resolvedStatus && rawCommand) {
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

  const db = require('../database/models/index');
  const order = await db.Orders.findByPk(id);
  if (!order) return next(new AppError('Orden no encontrada', 404));

  await ordersServices.updateOrder(order.tableId, order.userId, resolvedStatus, order.total, id);

  emitToTenant(order.companyId, 'order:status_updated', {
    orderId:   parseInt(id),
    status:    resolvedStatus,
    updatedBy: req.user.username,
    channel:   'voice',
  });

  if (resolvedStatus === 'Completado') {
    emitToTenant(order.companyId, 'order:ready', {
      orderId:     parseInt(id),
      tableId:     order.tableId,
      tableNumber: null,
      status:      'Completado',
    });
  }

  return res.json({
    status:    'success',
    message:   `Orden #${id} actualizada a "${resolvedStatus}"`,
    orderId:   parseInt(id),
    newStatus: resolvedStatus,
  });
});

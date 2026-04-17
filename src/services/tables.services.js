'use strict';
const db = require('../database/models/index');
const qrService = require('./qr.service');

class tablesServices {
  /**
   * Crea una mesa con soporte opcional de:
   *  - auto_command_enabled
   *  - qr_duration_minutes
   * Si autoCommandEnabled=true crea la autocomanda.
   * Genera QR y lo sube a Firebase.
   *
   * @param {object} opts
   * @param {number}  opts.tableNumber
   * @param {number}  opts.capacity
   * @param {number|null} opts.branchId
   * @param {boolean} opts.autoCommandEnabled
   * @param {number|null} opts.qrDurationMinutes
   * @param {object}  opts.tenant  - { companyId, branchId }
   * @param {object}  opts.company - { name }
   * @param {object}  opts.branch  - { name }
   * @param {string}  opts.appUrl  - base URL para el menú digital
   */
  static async createTable({
    tableNumber,
    capacity,
    branchId = null,
    autoCommandEnabled = false,
    qrDurationMinutes = null,
    tenant = {},
    companyName = 'restaurant',
    branchName = 'main',
    appUrl = process.env.APP_URL ?? 'https://app.orderlify.net',
  }) {
    const table = await db.Tables.create({
      tableNumber,
      capacity,
      branchId,
      autoCommandEnabled,
      qrDurationMinutes,
    });

    // Generar QR
    const menuUrl = `${appUrl}/menu?table=${table.id}`;
    try {
      const qrBuffer = await qrService.generateQRBuffer(menuUrl);
      const { downloadUrl, storagePath } = await qrService.uploadQRToFirebase(
        qrBuffer,
        companyName,
        branchName,
        tableNumber,
      );
      const expiresAt = qrService.calcQRExpiry(qrDurationMinutes);
      await table.update({
        qrUrl: downloadUrl,
        qrFirebasePath: storagePath,
        qrExpiresAt: expiresAt,
        qrGeneratedAt: new Date(),
      });
    } catch (qrErr) {
      // QR no crítico: loguear sin romper el flujo
      console.error('[QR] Error generando QR:', qrErr.message);
    }

    // Autocomanda
    if (autoCommandEnabled) {
      await db.AutoCommand.create({
        tableId: table.id,
        companyId: tenant.companyId ?? null,
        branchId: tenant.branchId ?? branchId ?? null,
        status: 'active',
      });
    }

    return table.toJSON();
  }

  static async getTables(tenant = {}) {
    const where = {};
    if (tenant.branchId) where.branchId = tenant.branchId;

    const tables = await db.Tables.findAll({
      where,
      include: [
        { model: db.AutoCommand, as: 'autoCommand', required: false },
      ],
    });
    return tables;
  }

  static async updateTable(id, tableNumber, capacity) {
    await db.Tables.update({ tableNumber, capacity }, { where: { id } });
  }

  static async deleteTable(id) {
    const table = await db.Tables.findByPk(id);
    if (table?.qrFirebasePath) {
      await qrService.deleteQRFromFirebase(table.qrFirebasePath);
    }
    await db.Tables.destroy({ where: { id } });
  }

  /**
   * Regenera el QR de una mesa (manual o por expiración).
   * Elimina el QR anterior de Firebase y sube uno nuevo.
   */
  static async regenerateQR(tableId, { companyName, branchName, appUrl } = {}) {
    const table = await db.Tables.findByPk(tableId);
    if (!table) {
      const err = new Error('Mesa no encontrada');
      err.status = 404;
      throw err;
    }

    // Eliminar QR anterior
    await qrService.deleteQRFromFirebase(table.qrFirebasePath);

    const menuUrl = `${appUrl ?? process.env.APP_URL ?? 'https://app.orderlify.net'}/menu?table=${tableId}`;
    const qrBuffer = await qrService.generateQRBuffer(menuUrl);
    const { downloadUrl, storagePath } = await qrService.uploadQRToFirebase(
      qrBuffer,
      companyName ?? 'restaurant',
      branchName ?? 'main',
      table.tableNumber,
    );
    const expiresAt = qrService.calcQRExpiry(table.qrDurationMinutes);

    await table.update({
      qrUrl: downloadUrl,
      qrFirebasePath: storagePath,
      qrExpiresAt: expiresAt,
      qrGeneratedAt: new Date(),
    });

    return table.toJSON();
  }
}

module.exports = tablesServices;

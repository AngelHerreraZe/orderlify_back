'use strict';
const { Model } = require('sequelize');

const QR_DEFAULT_DURATION = 1440; // minutos

module.exports = (sequelize, DataTypes) => {
  class Tables extends Model {
    static associate(models) {
      Tables.hasMany(models.Orders,  { foreignKey: 'tableId' });
      Tables.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
      Tables.hasOne(models.AutoCommand, { foreignKey: 'tableId', as: 'autoCommand' });
    }

    get qrDurationEffective() {
      return this.qrDurationMinutes ?? QR_DEFAULT_DURATION;
    }

    get qrIsExpired() {
      if (!this.qrExpiresAt) return false;
      return new Date() >= new Date(this.qrExpiresAt);
    }
  }

  Tables.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      tableNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'table_number',
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4,
      },
      branchId: {
        type: DataTypes.INTEGER,
        field: 'branch_id',
        allowNull: true,
      },
      autoCommandEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'auto_command_enabled',
      },
      qrDurationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'qr_duration_minutes',
      },
      qrUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'qr_url',
      },
      qrFirebasePath: {
        type: DataTypes.STRING(512),
        allowNull: true,
        field: 'qr_firebase_path',
      },
      qrExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'qr_expires_at',
      },
      qrGeneratedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'qr_generated_at',
      },
    },
    {
      sequelize,
      tableName: 'tables',
      modelName: 'Tables',
    }
  );

  return Tables;
};

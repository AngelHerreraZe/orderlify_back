'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tables', 'auto_command_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('tables', 'qr_duration_minutes', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'null = usar default de 1440 min',
    });
    await queryInterface.addColumn('tables', 'qr_url', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
    await queryInterface.addColumn('tables', 'qr_firebase_path', {
      type: Sequelize.STRING(512),
      allowNull: true,
    });
    await queryInterface.addColumn('tables', 'qr_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('tables', 'qr_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tables', 'auto_command_enabled');
    await queryInterface.removeColumn('tables', 'qr_duration_minutes');
    await queryInterface.removeColumn('tables', 'qr_url');
    await queryInterface.removeColumn('tables', 'qr_firebase_path');
    await queryInterface.removeColumn('tables', 'qr_expires_at');
    await queryInterface.removeColumn('tables', 'qr_generated_at');
  },
};

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users_branches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        field: 'user_id',
        allowNull: false,
        references: { model: 'user', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      branchId: {
        type: Sequelize.INTEGER,
        field: 'branch_id',
        allowNull: false,
        references: { model: 'branches', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('users_branches', ['user_id', 'branch_id'], {
      unique: true,
      name: 'users_branches_unique_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users_branches');
  },
};

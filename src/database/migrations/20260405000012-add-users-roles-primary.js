'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users_roles', 'is_primary', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'role_id',
    });

    // Marcar el primer registro de cada usuario como primario
    // Subquery compatible con MySQL y PostgreSQL
    await queryInterface.sequelize.query(`
      UPDATE users_roles
      SET is_primary = true
      WHERE id IN (
        SELECT MIN(id) FROM users_roles GROUP BY user_id
      );
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users_roles', 'is_primary');
  },
};

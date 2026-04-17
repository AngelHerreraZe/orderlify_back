'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('branches', 'menu_style', {
      type: Sequelize.ENUM('A', 'B', 'C', 'D', 'E'),
      allowNull: false,
      defaultValue: 'A',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('branches', 'menu_style');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_branches_menu_style";');
  },
};

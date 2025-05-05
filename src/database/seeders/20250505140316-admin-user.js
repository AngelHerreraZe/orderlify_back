'use strict';
const bcrypt = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { User, Roles, UsersRoles } = require('../models');
    const hasshedPassword = await bcrypt.hash('admin', 10);
    const role = await Roles.create({
      name: 'admin',
    });

    const user = await User.create({
      username: 'admin',
      password: hasshedPassword,
      name: 'admin',
      lastname: 'admin',
    });

    await UsersRoles.create({
      userId: user.id,
      roleId: role.id,
    });
  },

  async down(queryInterface, Sequelize) {
    const { User, Roles, UsersRoles } = require('../models');
    await UsersRoles.destroy({ where: { roleId: 1 } });
    await User.destroy({ where: { username: 'admin' } });
    await Roles.destroy({ where: { name: 'admin' } });
  },
};

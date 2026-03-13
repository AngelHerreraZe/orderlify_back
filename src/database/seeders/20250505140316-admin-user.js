'use strict';
const bcrypt = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { User, Roles, UsersRoles } = require('../models');
    const user = await User.create({
      username: 'admin',
      password: 'admin1234',
      name: 'admin',
      lastname: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const role = await Roles.create({
      name: 'Admin',
    });

    await UsersRoles.create({
      userId: user.id,
      roleId: role.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  async down(queryInterface, Sequelize) {
    const { User, Roles, UsersRoles } = require('../models');
    await UsersRoles.destroy({ where: { roleId: 1 } });
    await User.destroy({ where: { username: 'admin' } });
    await Roles.destroy({ where: { name: 'Admin' } });
  },
};

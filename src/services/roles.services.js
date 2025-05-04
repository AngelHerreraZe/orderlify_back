const db = require('../database/models/index');

class RolesServices {
  static async create(name) {
    try {
      await db.Roles.create({
        name,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getRoles() {
    try {
      const roles = await db.Roles.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        include: [{ all: true }],
      });
      return roles;
    } catch (error) {
      throw error;
    }
  }

  static async updateRole(id, name) {
    try {
      await db.Roles.update(
        {
          name,
        },
        {
          where: {
            id,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteRole(id) {
    try {
      await db.Roles.destroy({
        where: {
          id,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async assignRole(userId, roleId) {
    try {
      await db.UsersRoles.create({
        userId,
        roleId,
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RolesServices;

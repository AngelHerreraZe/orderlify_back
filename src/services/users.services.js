const db = require('./../database/models/index');

class UserServices {
  static async create(newUser) {
    try {
      return await db.User.create(newUser);
    } catch (error) {
      throw error;
    }
  }

  static async getUsersInfo() {
    try {
      const users = await db.User.findAll({
        attributes: {
          exclude: ['password', 'active', 'createdAt', 'updatedAt'],
        },
        include: [{ all: true }],
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  static async getUser(username) {
    try {
      const user = await db.User.findOne({
        where: { username: username },
        include: [{ model: db.UsersRoles, include: [{ model: db.Roles }] }],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async getUserInfoById(id) {
    try {
      const user = await db.User.findOne({
        where: { id },
        attributes: {
          exclude: ['password', 'active', 'createdAt', 'updatedAt'],
        },
        include: [{ all: true }],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserInfo(id, name, lastname, active) {
    try {
      await db.User.update(
        { name, lastname, active },
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

  static async deleteUser(id) {
    try {
      await db.User.destroy({
        where: {
          id,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserServices;

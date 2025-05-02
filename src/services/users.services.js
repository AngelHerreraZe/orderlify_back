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
      });
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserServices;

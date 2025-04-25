const db = require('./../database/models/index');

class UserServices {
    static async create(newUser) {
        try {
          return await db.User.create(newUser);
        } catch (error) {
          throw error;
        }
      }
}

module.exports = UserServices;
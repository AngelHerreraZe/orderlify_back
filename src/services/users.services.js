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
        include: [{ model: db.UsersRoles, include: [{ model: db.Roles }] }],
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  static async getUser(username, subdomain = null) {
    try {
      const where = { username };

      // Si se envía subdominio, filtrar usuarios de esa empresa específica
      if (subdomain) {
        const company = await db.Company.findOne({
          where: { subdomain },
          attributes: ['id'],
        });
        // Si el subdominio no existe, devolver null de forma segura
        if (!company) return null;
        where.companyId = company.id;
      }

      const user = await db.User.findOne({
        where,
        include: [
          // Rol primario primero; fallback a cualquiera si no hay primario
          {
            model: db.UsersRoles,
            include: [{ model: db.Roles }],
          },
          // Empresa: para validar status en el login
          { model: db.Company, as: 'company', attributes: ['id', 'status', 'subdomain'] },
        ],
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
        include: [{ model: db.UsersRoles, include: [{ model: db.Roles }] }],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserInfo(id, name, lastname, active, password) {
    try {
      await db.User.update(
        { name, lastname, active, password },
        {
          where: {
            id,
          },
        },
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

  static async getUserRawById(id) {
    try {
      return await db.User.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  static async updatePassword(id, hashedPassword) {
    try {
      await db.User.update(
        { password: hashedPassword, passwordChanged: true },
        { where: { id } },
      );
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(id, currentPassword, newPassword) {
    const user = await db.User.findOne({
      where: { id },
      include: [
        {
          model: db.UsersRoles,
          include: [
            {
              model: db.Roles,
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }

    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      const err = new Error('La contraseña actual es incorrecta');
      err.status = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    user.passwordChanged = true;

    await user.save();

    return user;
  }
}

module.exports = UserServices;

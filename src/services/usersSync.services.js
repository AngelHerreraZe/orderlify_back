'use strict';
const db = require('../database/models');
require('dotenv').config();

class UsersSyncServices {
  /**
   * Returns all users with their roles and branch assignments.
   * Includes password hash — protected by SYNC_SECRET middleware.
   */
  static async getAll() {
    return db.User.findAll({
      include: [
        {
          model: db.UsersRoles,
          include: [{ model: db.Roles, attributes: ['name'] }],
        },
        {
          model: db.UsersBranches,
          as: 'userBranchLinks',
          attributes: ['branchId'],
        },
      ],
    });
  }

  /**
   * LWW upsert: only updates a row if the incoming updatedAt is newer.
   * @param {Array} users  — array from Electron sync payload
   */
  static async upsertMany(users) {
    let upserted = 0;
    for (const u of users) {
      const existing = await db.User.findByPk(u.id);
      if (!existing || new Date(u.updatedAt) > existing.updatedAt) {
        await db.User.upsert({
          id:              u.id,
          username:        u.username,
          password:        u.passwordHash, // already hashed — do NOT re-hash
          name:            u.name,
          lastname:        u.lastname,
          active:          u.active,
          passwordChanged: u.passwordChanged,
          companyId:       u.companyId,
          updatedAt:       u.updatedAt,
        }, { hooks: false });
        upserted++;
      }
    }
    return upserted;
  }

  /**
   * Append-only insert of session records received from Electron.
   * @param {Array} sessions
   */
  static async insertSessions(sessions) {
    let inserted = 0;
    for (const s of sessions) {
      const [, created] = await db.UserSession.findOrCreate({
        where: { userId: s.userId, loggedAt: new Date(s.loggedAt) },
        defaults: { ip: s.ip, source: s.source },
      });
      if (created) inserted++;
    }
    return inserted;
  }
}

module.exports = UsersSyncServices;

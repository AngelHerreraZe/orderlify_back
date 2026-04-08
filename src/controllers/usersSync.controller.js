'use strict';
const catchAsync        = require('../utils/catchAsync');
const UsersSyncServices = require('../services/usersSync.services');
require('dotenv').config();

/**
 * GET /api/v1/users/sync
 * Returns all users + branch assignments.
 * Also returns secretWord so Electron can sign offline JWTs.
 */
exports.getUsers = catchAsync(async (_req, res) => {
  const users = await UsersSyncServices.getAll();

  const payload = users.map((u) => ({
    id:              u.id,
    username:        u.username,
    passwordHash:    u.password, // raw bcrypt hash
    name:            u.name,
    lastname:        u.lastname,
    active:          u.active,
    passwordChanged: u.passwordChanged,
    companyId:       u.companyId,
    updatedAt:       u.updatedAt,
    role:            u.UsersRoles?.[0]?.Role?.name ?? null,
    branchIds:       (u.userBranchLinks ?? []).map((b) => b.branchId),
  }));

  return res.json({
    users: payload,
    secretWord: process.env.SECRETWORD,
  });
});

/**
 * POST /api/v1/users/sync
 * Receives user updates from LAN master, upserts with LWW.
 */
exports.upsertUsers = catchAsync(async (req, res) => {
  const { users = [] } = req.body;
  const upserted = await UsersSyncServices.upsertMany(users);
  return res.json({ upserted });
});

/**
 * POST /api/v1/users/sessions
 * Receives session audit records from Electron (append-only).
 */
exports.insertSessions = catchAsync(async (req, res) => {
  const { sessions = [] } = req.body;
  const inserted = await UsersSyncServices.insertSessions(sessions);
  return res.json({ inserted });
});

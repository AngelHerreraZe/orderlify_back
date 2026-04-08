// Restaurant/src/middlewares/syncSecret.middleware.js
'use strict';
require('dotenv').config();

/**
 * Validates the x-sync-secret header for user-sync endpoints.
 * The secret must match SYNC_SECRET in .env.
 */
const validateSyncSecret = (req, res, next) => {
  const secret = req.headers['x-sync-secret'];
  if (!secret || secret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ message: 'Unauthorized: invalid sync secret' });
  }
  next();
};

module.exports = validateSyncSecret;

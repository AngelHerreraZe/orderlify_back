'use strict';
const router             = require('express').Router();
const usersSyncCtrl      = require('../controllers/usersSync.controller');
const validateSyncSecret = require('../middlewares/syncSecret.middleware');

router.get( '/users/sync',     validateSyncSecret, usersSyncCtrl.getUsers);
router.post('/users/sync',     validateSyncSecret, usersSyncCtrl.upsertUsers);
router.post('/users/sessions', validateSyncSecret, usersSyncCtrl.insertSessions);

module.exports = router;

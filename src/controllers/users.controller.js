const catchAsync = require('../utils/catchAsync');
const userServices = require('../services/users.services');
const bcrypt = require('bcrypt');
const AuthServices = require('../services/auth.services');

exports.create = catchAsync()
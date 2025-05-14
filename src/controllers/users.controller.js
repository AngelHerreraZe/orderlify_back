const catchAsync = require('../utils/catchAsync');
const userServices = require('../services/users.services');
const AuthServices = require('../services/auth.serrvices');
const bcrypt = require('bcrypt');

exports.create = catchAsync(async (req, res, next) => {
  const { username, password, name, lastname } = req.body;
  const user = await userServices.create({
    username,
    password,
    name,
    lastname,
  });
  return res.status(201).json({
    status: 'success',
    message: 'User created successfully',
  });
});

exports.getUsersInformations = catchAsync(async (req, res, next) => {
  try {
    const usersInfo = await userServices.getUsersInfo();
    return res.json(usersInfo);
  } catch (error) {
    throw error;
  }
});

exports.userLogin = catchAsync(async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userServices.getUser(username);
    if (!user) {
      next({
        status: 400,
        message: 'Invalid username',
        errorName: 'User not found',
      });
    } else {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        next({
          status: 400,
          message: "The password doesn't match with username",
          errorName: 'Invalid password',
        });
      } else {
        const { id, username } = user;
        const role = user.UsersRoles[0].Role.name;
        const token = AuthServices.genToken({ id, username, role });
        res.json({ token });
      }
    }
  } catch (error) {
    throw error;
  }
});

exports.getUserbyId = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userServices.getUserInfoById(id);
    res.json({ user });
  } catch (error) {
    throw error;
  }
});

exports.updateUserInfo = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, lastname, active } = req.body;
    console.log(id, name, lastname, active);

    await userServices.updateUserInfo(id, name, lastname, active);
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    await userServices.deleteUser(id);
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});

const catchAsync = require('../utils/catchAsync');
const userServices = require('../services/users.services');


exports.create = catchAsync(async (req, res, next) => {
    const { username,  password, name, lastname } = req.body;
    const user = await userServices.create({
        username,
        password,
        name,
        lastname
    });
    return res.status(201).json({
        status: 'success',
        message: 'User created successfully',
      });
})
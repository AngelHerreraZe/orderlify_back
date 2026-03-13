const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthServices {
  static genToken(payload) {
    const token = jwt.sign(payload, process.env.SECRETWORD, {
      algorithm: 'HS512',
      expiresIn: '1w',
    });
    return token;
  }
}

module.exports = AuthServices;

const jwt = require('jsonwebtoken');
require('dotenv').config()

class AuthServices {
    static genToken(payload) {
        try {
            const token = jwt.sign(payload, process.env.SECRETWORD, {
                algorithm: "HS512",
                expiresIn: "1w"
            });
            return token;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthServices;
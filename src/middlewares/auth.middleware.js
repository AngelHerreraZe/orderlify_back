const jwt = require('jsonwebtoken');
require('dotenv').config()

const authenticate = (req, res, next) => {
    const token = req.headers["clonstagram-token"];
    if(!token){
        return next({
            status: 401,
            error: "Unauthorized",
            message: "Not token provided"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRETWORD, {algorithms: "HS512"});
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json(error);
    }
}

module.exports = authenticate;
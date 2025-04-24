const {check, validationResult, param} = require('express-validator');
const validateResult = require('../utils/validate');

const createUserValidator = [
    check("username", "Error en el campo username")
        .exists().withMessage("El campo username es requerido")
        .notEmpty().withMessage("El campo username no puede estar vacio")
        .isString().withMessage("El campo username tiene que ser cadena de texto")
        .isLength({min: 7, max: 50}).withMessage("El campo username tiene que tener una longitud de entre 7 y 50 caracteres"),
    check("password", "Error en el campo password")
        .exists().withMessage("El campo password es requerido")
        .notEmpty().withMessage("El campo password no puede estar vacio")
        .isString().withMessage("El campo password tiene que ser cadena de texto")
        .isLength({min: 8, max: 50}).withMessage("El campo password tiene que tener una longitud de entre 8 y 50 caracteres"),
    (req, res, next) => {
        validateResult(req, res, next);
    }
]

module.exports = {
    createUserValidator,
}
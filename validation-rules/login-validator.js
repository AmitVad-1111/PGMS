const { body } = require("express-validator");

const loginValidator = () => {
    return [
        body("email").isEmail().withMessage("Please enter valid email"),
        body("password").trim().isLength({ min: 1}).withMessage("Please enter password")
    ]
}
module.exports = loginValidator;
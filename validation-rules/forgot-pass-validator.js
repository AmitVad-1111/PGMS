const { body } = require("express-validator");

const forgotPassValidator = () => {
    return [
        body("email").isEmail().withMessage("Please enter valid email"),
    ]
}
module.exports = forgotPassValidator;
const { body } = require("express-validator");
const User = require('../models/User');

const passowrdResetValidator = () => {
    return [

        body("password").trim().isLength({ min: 6, max: 15 }).withMessage("Please enter valid password and it must be 6 to 15 charlong"),

        /* ----------------------------------------------------------------------------------- */
        body("cpass").trim().isLength({min:1}).withMessage("Please re-enter your password").custom((value, { req }) => {

            if (value != req.body.password) {
                throw new Error("confirm-passowrd should match with password")
            }

            return true;
        })
    ]
}
module.exports = passowrdResetValidator;
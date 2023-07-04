const { body } = require("express-validator");
const User = require('../models/User');

const signupValidator = () => {
    return [
        body("fullname")
            .isLength({ min: 2 })
            .withMessage("Name is too small")
            .isLength({ max: 50 })
            .withMessage("Name is too big")
            .matches("^[a-zA-Z ]+$")
            .withMessage("Please enter valid Name"),
        /* ----------------------------------------------------------------------------------- */

        body("email").isEmail().withMessage("Please enter valid email").custom((value, { req }) => {
            return User.findOne({ email: value }).then(isuser => {
                if (isuser) {
                    return Promise.reject("Someone already been registered with this email")
                }
            })
        }),
        /* ----------------------------------------------------------------------------------- */

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
module.exports = signupValidator;
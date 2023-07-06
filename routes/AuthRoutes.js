const express = require("express");
const signupValidator = require("../validation-rules/signup-validator");
const loginValidator = require("../validation-rules/login-validator");
const forgotPassValidator = require("../validation-rules/forgot-pass-validator");
const passowrdResetValidator = require("../validation-rules/password-reset-validator");

const authRoutes = express.Router();
const isAuthorized = require("../middelware/isAuth");
const {
    getLogin,
    postLogin,
    getSingup,
    postSingup,
    getLogout,
    getLoginSuccess,
    getForgotPass,
    postForgotPass,
    getPasswordReset,
    postPasswordReset
} = require("../controllers/Auth");


authRoutes.get("/", getLogin);
authRoutes.post("/", loginValidator(), postLogin);
authRoutes.get("/singup", getSingup);
authRoutes.post("/singup", signupValidator(), postSingup);
authRoutes.get("/logout", isAuthorized, getLogout);
authRoutes.get("/success", isAuthorized, getLoginSuccess);
authRoutes.get("/forgot-pass", getForgotPass);
authRoutes.post("/forgot-pass", forgotPassValidator(), postForgotPass);
authRoutes.get("/confirm-email/:token", getPasswordReset);
authRoutes.post("/confirm-email", passowrdResetValidator(), postPasswordReset);


module.exports = authRoutes;
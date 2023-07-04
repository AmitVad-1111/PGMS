const express = require("express");
const signupValidator = require("../validation-rules/signup-validator");
const loginValidator =  require("../validation-rules/login-validator");
const forgotPassValidator = require("../validation-rules/forgot-pass-validator");

const authRoutes = express.Router();
const {
    getLogin,
    postLogin,
    getSingup,
    postSingup,
    getLogout,
    getLoginSuccess,
    getForgotPass,
    postForgotPass
} = require("../controllers/Auth");


authRoutes.get("/",getLogin);
authRoutes.post("/",loginValidator(),postLogin);
authRoutes.get("/singup",getSingup);
authRoutes.post("/singup",signupValidator(),postSingup);
authRoutes.get("/logout",getLogout);
authRoutes.get("/success",getLoginSuccess);
authRoutes.get("/forgot-pass",getForgotPass);
authRoutes.post("/forgot-pass",forgotPassValidator(),postForgotPass);


module.exports = authRoutes;
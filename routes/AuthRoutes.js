const express = require("express");
const signupValidator = require("../validation-rules/signup-validator");
const loginValidator =  require("../validation-rules/login-validator");
const authRoutes = express.Router();
const {
    getLogin,
    postLogin,
    getSingup,
    postSingup
} = require("../controllers/Auth");


authRoutes.get("/",getLogin);
authRoutes.post("/",loginValidator(),postLogin);
authRoutes.get("/singup",getSingup);
authRoutes.post("/singup",signupValidator(),postSingup);

module.exports = authRoutes;
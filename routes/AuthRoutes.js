const express = require("express");
const signupValidator = require("../validation-rules/signup-validator");
const authRoutes = express.Router();
const {
    getLogin,
    getSingup,
    postSingup
} = require("../controllers/Auth");


authRoutes.get("/",getLogin);
authRoutes.get("/singup",getSingup);
authRoutes.post("/singup",postSingup);

module.exports = authRoutes;
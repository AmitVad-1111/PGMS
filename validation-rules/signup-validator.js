const {body} = require("express-validator");

const signupValidator = () =>{
   return  [
        body("fullname").isAlpha("Please enter valid Name")
    ]
} 
module.exports = signupValidator;
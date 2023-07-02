const User = require("../models/User");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator")

const getLogin = (req,res,next) => {
    res.render("pages/login",{
        pageTitle : "Login | PGMS"
    });
}

const getSingup = (req,res,next)=>{
    res.render("pages/signup",{
        pageTitle : "Signup | PGMS"
    });
}


const postSingup = (req,res,next)=>{
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpass;

    // const errors =  validationResult(req);
    // if(!errors.isEmpty()){
    //     console.log(errors.array());
    // }

    /**
     * Check is user exist with this email 
     */
     
    User.find({email:email}).count().exec().then(c =>{
        //if count is not zero then user already registered with this email id
        if(c > 0){
            return res.render("pages/signup",{
                pageTitle : "Signup | PGMS"
            });
        }

        // if user not exist then encrypt password and insert user into database
        bcrypt.hash(password,12,(error,hashPass)=>{
            if(error){
                const error = new Error(error);
                throw error;
            }
    
            const user = new User({
                fullName: fullname,
                email: email,
                password: hashPass,
                user_roll: "admin"
            });
   
            user.save().then(r => {
                console.log(r);
                res.render("pages/signup",{
                    pageTitle : "Signup | PGMS"
                });
            }).catch(err=>{
                console.log(err);
            })
    
        });

    }) 
    



}


module.exports = {
    getLogin,
    getSingup,
    postSingup
}
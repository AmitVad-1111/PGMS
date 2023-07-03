const User = require("../models/User");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator")

const getLogin = (req, res, next) => {
    let parseError = {
        email: '',
        password:'',
    }
    res.render("pages/login", {
        pageTitle: "Login | PGMS",
        errorObj : parseError
    });
}

const postLogin = async (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;

    let parseError = {
        email: '',
        password:'',
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors.array());
        
        const allError = errors.array();
        allError.forEach(err => {
            parseError[err.path] = err.msg
        });

        return res.render("pages/login", {
            pageTitle: "Login | PGMS",
            errorObj : parseError
        });
    }

    const checkUserEmail = await User.findOne({email:email});
    if(checkUserEmail){
        console.log(checkUserEmail)
        const result = await bcrypt.compare(password,checkUserEmail.password);
        console.log("result>>>", result);
        if(result){
            req.session.isLoggedIn = true;
            req.session.user = {
                id: checkUserEmail._id,
                name: checkUserEmail.fullName,
                email: checkUserEmail.email
            }
        }
    }

    res.render("pages/login", {
        pageTitle: "Login | PGMS",
        errorObj : parseError
    });


}

const getSingup = (req, res, next) => {
    let parseError = {
        fullname: '',
        email: '',
        password:'',
        cpass:''
    }
    res.render("pages/signup", {
        pageTitle: "Signup | PGMS",
        errorObj : parseError,
        successMsg:''
    });
}


const postSingup = async (req, res, next) => {
    try{
        const fullname = req.body.fullname;
        const email = req.body.email;
        const password = req.body.password;
        
        let parseError = {
            fullname: '',
            email: '',
            password:'',
            cpass:''
        }
       
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const allError = errors.array();
            allError.forEach(err => {
                parseError[err.path] = err.msg
            })
    
            return res.render("pages/signup", {
                pageTitle: "Signup | PGMS",
                errorObj : parseError,
                successMsg:''
            });
        }
    
        const hashPass = await bcrypt.hash(password, 12);
        const user = new User({
            fullName: fullname,
            email: email,
            password: hashPass,
            user_roll: "admin"
        });
        let r = await user.save();
        
        res.status(201).render("pages/signup", {
            pageTitle: "Signup | PGMS",
            errorObj : parseError,
            successMsg: "New user created success fully!"
        });
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
            throw new Error(err);
        }
    }
}


module.exports = {
    getLogin,
    postLogin,
    getSingup,
    postSingup
}
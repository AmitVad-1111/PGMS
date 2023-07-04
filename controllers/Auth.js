const User = require("../models/User");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const renderViews = require("../utils/helpers");
const sendMail = require("../utils/send-mail");
const crypto = require("crypto");

const getLogin = (req, res, next) => {
    let parseError = {
        email: '',
        password: '',
    }
    // res.render("pages/login", {
    //     pageTitle: "Login | PGMS",
    //     errorObj : parseError
    // });

    return renderViews(req, res, "pages/login", {
        pageTitle: "Login | PGMS",
    })
}

const postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let parseError = {
        email: '',
        password: '',
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        const allError = errors.array();
        allError.forEach(err => {
            parseError[err.path] = err.msg
        });

        console.log(parseError);

        return renderViews(req, res, "pages/login", {
            pageTitle: "Login | PGMS",
            errorObj: parseError,
            oldValue: req.body
        })
    }

    const checkUserEmail = await User.findOne({ email: email });
    if (checkUserEmail) {
        const result = await bcrypt.compare(password, checkUserEmail.password);
        if (result) {
            req.session.isLoggedIn = true;
            req.session.user = {
                id: checkUserEmail._id,
                name: checkUserEmail.fullName,
                email: checkUserEmail.email
            }
            return res.redirect("/success")
        } else {

            return renderViews(req, res, "pages/login", {
                pageTitle: "Login | PGMS",
                errorMessage: "email or password incorrect",
                oldValue: req.body
            })
        }
    } else {
        return renderViews(req, res, "pages/login", {
            pageTitle: "Login | PGMS",
            errorMessage: "email or password incorrect",
            oldValue: req.body
        })
    }


}

const getSingup = (req, res, next) => {
    return renderViews(req, res, "pages/signup", {
        pageTitle: "Signup | PGMS",
    })
}


const postSingup = async (req, res, next) => {
    try {
        const fullname = req.body.fullname;
        const email = req.body.email;
        const password = req.body.password;

        let parseError = {
            fullname: '',
            email: '',
            password: '',
            cpass: ''
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const allError = errors.array();
            allError.forEach(err => {
                parseError[err.path] = err.msg
            })

            return renderViews(req, res, "pages/signup", {
                pageTitle: "Signup | PGMS",
                errorObj: parseError,
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

        renderViews(req, res, "pages/signup", {
            pageTitle: "Signup | PGMS",
            successMessage: "New user created success fully!",
            status: 201
        });


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            throw new Error(err);
        }
    }
}

const getLogout = async (req, res, next) => {
    let re = await req.session.destroy();
    console.log(re);
    res.redirect("/");
}

const getLoginSuccess = (req, res, next) => {
    renderViews(req, res, "pages/success", {
        pageTitle: "Success | PGMS",
    });
}

const getForgotPass = (req, res, next) => {
    renderViews(req, res, "pages/forgot-password", {
        pageTitle: "Forgot Password | PGMS",
    });
}

const postForgotPass = async (req, res, next) => {
    const email = req.body.email;
    const error = validationResult(req);

    if(!error.isEmpty()){
        return renderViews(req, res, "pages/forgot-password", {
            pageTitle: "Forgot Password | PGMS",
            errorMessage: error.array()[0].msg,
            oldValue : {email}
        });
    }

    let isUserExist = await User.findOne({email:email});
    if(isUserExist){
        try{
            let randomNumStr = crypto.randomBytes(48);
            let randomData = randomNumStr.toString("hex");
            let url = `/confirm-email/${randomData}`;
            let user = await User.findOne({email:email});
            if(!user){
                const error = new Error("email not found");
                user.statusCode = 422;
                throw error;
            }

            user.password_reset_link = url,
            user.password_reset_link_Exp = Date.now() + 3600000;
            let upd = await user.save();
            console.log(upd);
            if(upd){
                const options = {
                    from: process.env.APP_EMAIL, // sender address
                    to: email, // receiver email
                    subject: "Account Password Reset Link", // Subject line
                    html: `
                        <h4>Hello , ${user.fullName}</h4><br/>
                        <p>
                            we recieved account password request from your account here are your link 
                            <a href="http://${req.headers.host}${url}">click here</a> reset your password                          
                        </p>
                        <b>Note: this link only valid for 1 hour</b>
                        
                        <div>Thanks</div>
                        <h3>PGMS</h3>
                        
                    `
                }
            
                sendMail(options,(error,info)=>{
                    console.log(error);
                    console.log(info);
                });
            }
        }catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
                throw new Error(err);
            }
        }
    }

    return renderViews(req, res, "pages/forgot-password", {
        pageTitle: "Forgot Password | PGMS",
    });
}

module.exports = {
    getLogin,
    postLogin,
    getSingup,
    postSingup,
    getLogout,
    getLoginSuccess,
    getForgotPass,
    postForgotPass
}
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
            setTimeout(()=>{
                res.redirect("/success")
            },0);
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
                oldValue:req.body
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
    if(re){
        res.redirect("/");
    }
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

    if (!error.isEmpty()) {
        return renderViews(req, res, "pages/forgot-password", {
            pageTitle: "Forgot Password | PGMS",
            errorMessage: error.array()[0].msg,
            oldValue: { email }
        });
    }

    let isUserExist = await User.findOne({ email: email });
    if (isUserExist) {
        try {
            let randomNumStr = crypto.randomBytes(48);
            let randomData = randomNumStr.toString("hex");
            let url = `/confirm-email/${randomData}`;
            let user = await User.findOne({ email: email });
            if (!user) {
                const error = new Error("email not found");
                user.statusCode = 422;
                throw error;
            }


            let futureDate = new Date();
            futureDate.setHours(futureDate.getHours() + 1);
            user.password_reset_link = randomData,
                user.password_reset_link_Exp = futureDate;

            let upd = await user.save();
            if (upd) {
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

                sendMail(options, (error, info) => {
                    if (error) {
                        if (!err.statusCode) {
                            err.statusCode = 500;
                            throw new Error(err);
                        }
                    }

                    if (info.messageId) {
                        return renderViews(req, res, "pages/forgot-password", {
                            pageTitle: "Forgot Password | PGMS",
                            successMessage: "Email sent to your email id"
                        });
                    }

                });
            }
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                throw new Error(err);
            }
        }
    }

}

const getPasswordReset = async (req, res, next) => {
    const token = req.params.token;
    let getUser = await User.find({ password_reset_link: token, password_reset_link_Exp: { $gt: new Date() } });

    if (getUser.length) {
        renderViews(req, res, "pages/password-reset", {
            pageTitle: "Reset Password | PGMS",
            token: token
        })
    }else{
        renderViews(req, res, "pages/link-expire", {
            pageTitle: "Link Expire | PGMS",
        })
    }

}

const postPasswordReset = async (req, res, next) => {
    const password = req.body.password;
    const cpass = req.body.cpass;
    const token = req.body.token;
    const errors = validationResult(req);
    const parseError = [];

    if (!errors.isEmpty()) {
        const allError = errors.array();
        allError.forEach(err => {
            parseError[err.path] = err.msg
        })

        return renderViews(req, res, "pages/password-reset", {
            pageTitle: "Reset Password | PGMS",
            errorObj: parseError,
            oldValue: req.body
        });
    }

    const newPass = await bcrypt.hash(password,12);
    const updUser = await User.updateOne(
        {password_reset_link:token},
        {password:newPass}
    )
    
    if(updUser.acknowledged){
        res.redirect("/");
    }
}

module.exports = {
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
}
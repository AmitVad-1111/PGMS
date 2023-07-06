const isAuthorized = (req,res,next) =>{
    if(req.session.isLoggedIn && req.session.user.id){
        return next()
    }

    res.redirect("/");
}

module.exports = isAuthorized;
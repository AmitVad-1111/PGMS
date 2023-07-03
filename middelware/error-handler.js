module.exports = (err,req,res,next) =>{
    if(err){
        res.render("pages/error-page",{
            error: err
        });
        
    }
    next();
}
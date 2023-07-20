module.exports = (err,req,res,next) =>{
    if(err){
        console.log(err)
        res.render("pages/error-page",{
            error: err
        });
        
    }
    next();
}
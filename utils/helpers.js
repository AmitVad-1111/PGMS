const renderViews = (reqObj,resobj,view,payload) =>{
    if(view.length){
        let defaults = {
            pageTitle: '',
            errorObj:'',
            successMessage:'',
            infoMessage:'',
            errorMessage:'',
            user: reqObj?.session?.user ? reqObj?.session?.user : '',
            isUserLoggedIn: reqObj?.session?.isLoggedIn ? reqObj.session.isLoggedIn : false,
            oldValue:'',
            status:200,
        }

        // let viewDefaults =  {
        //     "pages/login": {
        //         pageTitle: '',
        //         errorObj:'',
        //         successMsg:'',
        //         user:'',
        //         oldValue:''
        //     },

        //     "pages/signup":{
        //         pageTitle: '',
        //     }
        // }

        let sitePayload = Object.assign(defaults,payload);
        // console.log(sitePayload)
        return resobj.status(defaults.status).render(view,sitePayload);
    }
}

module.exports = renderViews;
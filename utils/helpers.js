const renderViews = (reqObj,resobj,view,payload) =>{
    if(view.length){
        let defaults = {
            pageTitle: '',
            errorObj:false,
            successMessage:'',
            infoMessage:'',
            errorMessage:'',
            user: reqObj?.session?.user ? reqObj?.session?.user : '',
            isUserLoggedIn: reqObj?.session?.isLoggedIn ? reqObj.session.isLoggedIn : false,
            oldValue:false,
            status:200,
        }

        let viewDefaults =  {
            "pages/dashboard/pg-person/create-person":{
                isedit:false
            },
            "pages/dashboard/pg-person/person-guardian":{
                isedit:false,
            },
            "pages/dashboard/pg-person/payment":{
                paymentadded: false
            },
            "pages/dashboard/pg-person/editPerson":{
                isVerificationPending: true,
                currentTab:"personal",
                successMsg: false
            },
            "pages/dashboard/pg-rooms/create-room":{
                isedit:false,
            }
        }

        

        let sitePayload = Object.assign(defaults,viewDefaults[view],payload);
        // console.log(sitePayload)
        return resobj.status(defaults.status).render(view,sitePayload);
    }
}

module.exports = renderViews;
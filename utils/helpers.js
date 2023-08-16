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

        let creatPersonSteps = {
            step1 : reqObj.session?.step1?.isCompleted || false,
            step2 : reqObj.session?.step2?.isCompleted || false,
            step3 : reqObj.session?.step3?.isCompleted || false,
        }

        let viewDefaults =  {
            "pages/dashboard/pg-person/create-person":{
                isedit:false,
                steps: creatPersonSteps
            },
            "pages/dashboard/pg-person/person-guardian":{
                isedit:false,
                steps: creatPersonSteps
            },
            "pages/dashboard/pg-person/payment":{
                paymentadded: false,
                steps: creatPersonSteps
            },
            "pages/dashboard/pg-person/editPerson":{
                isVerificationPending: true,
                currentTab:"personal",
                successMsg: false
            },
            "pages/dashboard/pg-rooms/create-room":{
                isedit:false,
            },
            "pages/dashboard/pg-person/add-roommate":{
                steps: creatPersonSteps
            }
        }

        

        let sitePayload = Object.assign(defaults,viewDefaults[view],payload);
        // console.log(sitePayload)
        return resobj.status(defaults.status).render(view,sitePayload);
    }
}

module.exports = renderViews;
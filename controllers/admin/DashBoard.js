const renderView = require("../../utils/helpers");
const { getAllCountry, getAllStates, getAllDialCode } = require("../../utils/state-country");
const fileUploads = require("../../utils/file-upload-helper");
const { validationResult } = require("express-validator");
const { sendSMS, verifyCode } = require("../../utils/send-sms");
const pg_person = require("../../models/admin/PgPerson");

const getCoutryDailCode = (c) => {
    if (Object.keys(getAllDialCode).length) {
        return getAllDialCode[c];
    }
    return false;
}

const getFormatedNumber = (c,m) => {
    const dialCode = getCoutryDailCode(c);
    const personMobile = m;
    return dialCode + personMobile;
}

const getDashBoard = (req, res, next) => {
    renderView(req, res, "pages/dashboard/dash-board", {
        pageTitle: "Dashboard"
    });
}

const getAllPgPerson = (req, res, next) => {
    renderView(req, res, "pages/dashboard/pg-person/person", {
        pageTitle: "PG Persons"
    });
}

const getNewPgPersonFrm = (req, res, next) => {

    // sendSMS();
    console.log(req.session?.step1)
    console.log();
    console.log();


    req.session.step1 = { isCompleted: req.session?.step1?.isCompleted || false };
    // req.session.step2 = { isCompleted: req.session?.step2?.isCompleted || false };
    // req.session.step3 = { isCompleted: req.session?.step3?.isCompleted || false };
    // req.session.step4 = { isCompleted: req.session?.step4?.isCompleted || false };

    // let step = "step1";

    // if (!req.session?.step1?.isCompleted) {
    //     step = "step1";
    // } else if (!req.session?.step2?.isCompleted) {
    //     step = "step2";
    // } else if (!req.session?.step3?.isCompleted) {
    //     step = "step3";
    // } else if (!req.session?.step4?.isCompleted) {
    //     step = "step4";
    // }
    const country = req?.session?.userInfo ? getAllStates[req?.session?.userInfo["person-country"]] : false;
    const isVerificationPending = req?.session?.userInfo ? req.session.userInfo['person-mobile-verified'] : false
    renderView(req, res, "pages/dashboard/pg-person/create-person", {
        pageTitle: "Add New Person",
        country: getAllCountry,
        states: country,
        oldValue: req?.session?.userInfo || false,
        isVerificationPending: isVerificationPending
    });

}

const getNewPgPersonGuardianFrm = (req, res, next) => {
    if (req.session?.step1 && req.session?.step1.isCompleted == false) {
        return res.redirect("/dashboard/person/create-new/personal-info");
    } else if (req.session.userInfo && req.session.userInfo['person-mobile-verified'] == false) {
        return res.redirect("/dashboard/person/create-new/personal-info");
    }
 
    req.session.step2 = { isCompleted: req.session?.step2?.isCompleted || false };

    const country = req?.session?.userInfo ? getAllStates[req?.session?.userInfo["person2-country"]] : null;

    const isVerificationPending = req?.session?.userInfo ? req.session.userInfo['person2-mobile-verified'] : false
    const pageData = {
        pageTitle: "Add New Person",
        country: getAllCountry,
        states: country,
        oldValue: req?.session?.userInfo || false,
        isVerificationPending: true
    }
    if (req.session?.step2?.isCompleted) {
      pageData["isVerificationPending"] = isVerificationPending  
    } 
    renderView(req, res, "pages/dashboard/pg-person/person-guardian", pageData);
}

const postNewPgPersonFrm = async (req, res, next) => {

    const parseError = {};
    const ses = req.session;

    if (!req.session.userInfo) {
        req.session.userInfo = { ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles };
    } else {
        req.session.userInfo = { ...req.session.userInfo, ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles }
    }

    /**
     * Fetch error from requrest object
     */
    const errors = validationResult(req);
    /**
     * If it has error then send error object and old data to the view
     */

    if (!errors.isEmpty()) {
        const allError = errors.array();
        allError.forEach(err => {
            parseError[err.path] = err.msg
        });

        return renderView(req, res, "pages/dashboard/pg-person/create-person", {
            pageTitle: "Add New Person",
            country: getAllCountry,
            states: getAllStates[req.body["person-country"]] || null,
            errorObj: parseError,
            oldValue: req.session.userInfo || false
        });
    }

    /**
     * If no error then we reach here and we good to go 
     */
    if (req.session.userInfo['person-mobile-verified'] == undefined || req.session.userInfo['person-mobile-verified'] == false) {
        req.session.userInfo['person-mobile-verified'] = false;

        const formatedNumber = getFormatedNumber(req.session.userInfo['person-country'], req.session.userInfo['person-mobile']);
        const r = await sendSMS(formatedNumber);

        console.log(r);
        res.redirect("/dashboard/person/create-new/personal-info");
    } else {
        req.session.step1.isCompleted = true;
        res.redirect("/dashboard/person/create-new/guardian-info");
    }
    console.log(req.session.userInfo);

    // renderView(req, res, "pages/dashboard/pg-person/create-person", {
    //     pageTitle: "Add New Person",
    //     steps: {
    //         step1: req.session.step1,
    //         step2: req.session.step2,
    //         step3: req.session.step3,
    //         step4: req.session.step4,
    //     },
    //     currentStep: currentStep,
    //     country: getAllCountry,
    //     states: getAllStates[req.body["person-country"]] || getAllStates[req.body["person2-country"]] || null,
    //     oldValue: req.session.userInfo
    // });


}

const postNewPgPersonGuardianFrm = async (req, res, next) => {
    const parseError = {};
    const ses = req.session;

    if (!req.session.userInfo) {
        req.session.userInfo = { ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles };
    } else {
        req.session.userInfo = { ...req.session.userInfo, ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles }
    }

    /**
     * Fetch error from requrest object
     */
    const errors = validationResult(req);
    /**
     * If it has error then send error object and old data to the view
     */

    if (!errors.isEmpty()) {
        const allError = errors.array();
        allError.forEach(err => {
            parseError[err.path] = err.msg;
        });

        return renderView(req, res, "pages/dashboard/pg-person/person-guardian", {
            pageTitle: "Add New Person",
            country: getAllCountry,
            states: getAllStates[req.body["person2-country"]] || null,
            errorObj: parseError,
            oldValue: req.session.userInfo
        });
    }

    /**
     * If no error then we reach here and we good to go 
     */
    console.log(req.session.userInfo);
    if (req.session.userInfo['person2-mobile-verified'] == undefined || req.session.userInfo['person2-mobile-verified'] == false) {
        req.session.userInfo['person2-mobile-verified'] = false;

        const formatedNumber = getFormatedNumber(req.session.userInfo['person2-country'], req.session.userInfo['person2-mobile']);
        console.log(formatedNumber)
        const r = await sendSMS(formatedNumber);

        console.log(r);
        
       return res.redirect("/dashboard/person/create-new/guardian-info");
    } else {
        req.session.step2.isCompleted = true;
        res.redirect("/dashboard/person/create-new/guardian-info?step=3");
    }
    

    res.redirect("/dashboard/person/create-new/guardian-info?step=3");
}

const getStates = (req, res, next) => {
    try {
        const states = getAllStates[req.body.country] || null;
        if (states) {
            res.send(JSON.stringify({ success: true, data: states }));
        } else {
            res.send(JSON.stringify({ success: false, errMessage: "please provide valid country", data: null }));
        }
    } catch (err) {
        res.send(JSON.stringify({ success: false, errMessage: "please provide valid country", data: null }));
    }
}

const postVerifyCode = async (req, res, next) => {
    const code = parseInt(req.body.vcode);
    console.log(code);
    if (code > 0) {
        let formatedNumber;
        if(req.session.userInfo['person-mobile-verified']){
            formatedNumber = getFormatedNumber(req.session.userInfo['person2-country'], req.session.userInfo['person2-mobile']);
        }else{
            formatedNumber = getFormatedNumber(req.session.userInfo['person-country'], req.session.userInfo['person-mobile']);
        }
        const response = await verifyCode(formatedNumber, code);
        console.log("verify Res: ", response);

        if (response == "approved") {
            if(req.session.userInfo['person-mobile-verified']){
                req.session.userInfo['person2-mobile-verified'] = true;
                req.session.step2.isCompleted = true;
            }else{
                req.session.userInfo['person-mobile-verified'] = true;
                req.session.step1.isCompleted = true;
            }
            res.send(JSON.stringify({
                success: true,
                data: "verified"
            }));
        } else {
            res.send(JSON.stringify({
                success: false,
                data: "",
                errMessage: "incorrect code"
            }));
        }
    } else {
        res.send(JSON.stringify({
            success: false,
            data: "",
            errMessage: "incorrect code"
        }));
    }
}

module.exports = {
    getDashBoard,
    getAllPgPerson,
    getNewPgPersonFrm,
    postNewPgPersonFrm,
    getNewPgPersonGuardianFrm,
    postNewPgPersonGuardianFrm,
    getStates,
    postVerifyCode
}
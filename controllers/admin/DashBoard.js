const renderView = require("../../utils/helpers");
const { getAllCountry, getAllStates, getAllDialCode } = require("../../utils/state-country");
const fileUploads = require("../../utils/file-upload-helper");
const { validationResult, body } = require("express-validator");
const { sendSMS, verifyCode } = require("../../utils/send-sms");
const pg_person = require("../../models/admin/PgPerson");
const pg_payment = require("../../models/admin/PgPayment");
const Person = require("../../utils/admin/person");

const getCoutryDailCode = (c) => {
    if (Object.keys(getAllDialCode).length) {
        return getAllDialCode[c];
    }
    return false;
}

const getFormatedNumber = (c, m) => {
    const dialCode = getCoutryDailCode(c);
    const personMobile = m;
    return dialCode + personMobile;
}

const getDashBoard = (req, res, next) => {
    renderView(req, res, "pages/dashboard/dash-board", {
        pageTitle: "Dashboard"
    });
}

const getAllPgPerson = async (req, res, next) => {
    const p = new Person();
    const gpPgUser = await p.getAllPgPerson();
    renderView(req, res, "pages/dashboard/pg-person/person", {
        pageTitle: "PG Persons",
        persons: gpPgUser || false
    });
}

const getNewPgPersonFrm = async (req, res, next) => {
    let userdata = null;
    
    if(req.query?.is == "new"){
        delete req.session.userInfo;
        delete req.session.uploadFiles;
        delete req.session.currentPerson;
        delete req.session.step1;
        delete req.session.step2;
        delete req.session.step3;
        delete req.session.step4;
    }

    if (req.session.currentPerson) {
        const p = new Person(req.session.currentPerson);
        userdata = await p.getPersonalDetails();
        console.log("page load user id: ",req.session.currentPerson);
    }

    req.session.step1 = { isCompleted: req.session?.step1?.isCompleted || false };

    const country = req?.session?.userInfo ? getAllStates[req?.session?.userInfo["person-country"]] : false;
    const isVerificationPending = req?.session?.userInfo ? req.session.userInfo['person-mobile-verified'] : false
    const pageData = {
        pageTitle: "Add New Person",
        country: getAllCountry,
        states: country,
        oldValue: userdata || req?.session?.userInfo || false,
        isVerificationPending: true
    }
    if (req.session?.step1?.isCompleted) {
        pageData["isVerificationPending"] = isVerificationPending
    }
    renderView(req, res, "pages/dashboard/pg-person/create-person", pageData);

}

const getNewPgPersonGuardianFrm = async (req, res, next) => {
    let userdata = null;
    if (req.session.currentPerson) {
        const p = new Person(req.session.currentPerson);
        userdata = await p.getGuardianDetails();
        console.log("page load user id: ",req.session.currentPerson);
    }

    if (
        (req.session?.step1 && req.session?.step1.isCompleted == false) ||
        req.session.userInfo == undefined ||
        (req.session.userInfo && req.session.userInfo['person-mobile-verified'] == false)
    ) {
        return res.redirect("/dashboard/person/create-new/personal-info");
    }

    req.session.step2 = { isCompleted: req.session?.step2?.isCompleted || false };

    const country = req?.session?.userInfo ? getAllStates[req?.session?.userInfo["person2-country"]] : null;

    const isVerificationPending = req?.session?.userInfo ? req.session.userInfo['person2-mobile-verified'] : false
    const pageData = {
        pageTitle: "Add New Person",
        country: getAllCountry,
        states: country,
        oldValue: req?.session?.userInfo || userdata || false,
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
            oldValue: req.session.userInfo || false,
            isVerificationPending: true
        });
    }


    /**
     * If no error then we reach here and we good to go 
     */
    if (req.session.userInfo['person-mobile-verified'] == undefined || req.session.userInfo['person-mobile-verified'] == false) {
        // req.session.userInfo['person-mobile-verified'] = false;
        req.session.userInfo['person-mobile-verified'] = true;

        const formatedNumber = getFormatedNumber(req.session.userInfo['person-country'], req.session.userInfo['person-mobile']);
        // const r = await sendSMS(formatedNumber);
        // console.log(r);
        res.redirect("/dashboard/person/create-new/personal-info");
    } else {
        /**
         * check person is set or not
         */
        const person_id = req.session.currentPerson == undefined ? null : req.session.currentPerson;

        const p = new Person(person_id);
        let r = await p.addPersonalDetails(req.session.userInfo);
         if(r){
            req.session.currentPerson = r;
         }
         req.session.step1.isCompleted = true;
        res.redirect("/dashboard/person/create-new/guardian-info");
    }
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
            oldValue: req.session.userInfo,
            isVerificationPending: true
        });
    }

    /**
     * If no error then we reach here and we good to go 
     */
    if (req.session.userInfo['person2-mobile-verified'] == undefined || req.session.userInfo['person2-mobile-verified'] == false) {
        // req.session.userInfo['person2-mobile-verified'] = false;

        req.session.userInfo['person2-mobile-verified'] = true;

        const formatedNumber = getFormatedNumber(req.session.userInfo['person2-country'], req.session.userInfo['person2-mobile']);
        // const r = await sendSMS(formatedNumber);
        // console.log(r);
        return res.redirect("/dashboard/person/create-new/guardian-info");
    } else {
        /**
         * check person is set or not
         */
        const person_id = req.session.currentPerson == undefined ? null : req.session.currentPerson;

        const p = new Person(person_id);
        let r = await p.addEditGuardianDetails(req.session.userInfo);

        req.session.step2.isCompleted = true;
        return res.redirect("/dashboard/person/create-new/payment-info");
    }

}

const getPaymentFrm = async (req, res, next) => {
    console.log("user id:", req.session.currentPerson);
    /**
     * If user direct request this page then check if user completed previous steps
     * if not completed then redirect user to the first step 
     */
    if(req.session.currentPerson == undefined){
        res.redirect("/dashboard/person/create-new/personal-info");
    }
    
    try {
        // let payData = [];
        const person = new Person(req.session.currentPerson || null);
        let payData = await person.getPaymentInfo();
       
        renderView(req, res, "pages/dashboard/pg-person/payment", {
            pageTitle: "Add New Person",
            oldValue : payData[0] || false
        });
    } catch (err) {
        if (!err.stateCode) {
            err.stateCode = 500;
        }
        throw new Error(err);
    }

}

const postPaymentFrm = async (req, res, next) => {
    const parseError = {};

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

        return renderView(req, res, "pages/dashboard/pg-person/payment", {
            pageTitle: "Add New Person",
            errorObj: parseError,
            oldValue: req.body,
        });
    }

    if (req.session.currentPerson == undefined) {
        const err = Error("User not found");
        err.stateCode = 404;
        throw err;
    }

    let payData = req.body;
    let paymentadded = false;

    let cperson = new Person(req.session.currentPerson);
    let p = await cperson.makePayment(req.body);
    if(p){
        paydata = false;
        paymentadded = true
    }

    return renderView(req, res, "pages/dashboard/pg-person/payment", {
        pageTitle: "Add New Person",
        oldValue: payData || false,
        paymentadded: paymentadded
    });

}

const getEditPerson = (req,res,next) =>{
    const uid = req.params.uid;
    return renderView(req, res, "pages/dashboard/pg-person/editPerson", {
        pageTitle: "Edit Person",
        country: getAllCountry,
        states: false,
        oldValue : false,
        pid:uid
    });
    
}

const postEditPerson = (req,res,next) =>{
    console.log(req.body);
    return renderView(req, res, "pages/dashboard/pg-person/editPerson", {
        pageTitle: "Edit Person",
        country: getAllCountry,
        states: false,
        oldValue : false,
        pid:uid
    });
   
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
        if (req.session.userInfo == undefined) {
            return res.send(JSON.stringify({
                success: false,
                data: "mobile number not provided",
                errMessage: "incorrect code"
            }));
        }

        if (req.session.userInfo['person-mobile-verified']) {
            formatedNumber = getFormatedNumber(req.session.userInfo['person2-country'], req.session.userInfo['person2-mobile']);
        } else {
            formatedNumber = getFormatedNumber(req.session.userInfo['person-country'], req.session.userInfo['person-mobile']);
        }
        const response = await verifyCode(formatedNumber, code);
        console.log("verify Res: ", response);

        if (response == "approved") {
            if (req.session.userInfo['person-mobile-verified']) {
                req.session.userInfo['person2-mobile-verified'] = true;
            } else {
                req.session.userInfo['person-mobile-verified'] = true;
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
    getPaymentFrm,
    postPaymentFrm,
    getEditPerson,
    postEditPerson,
    getStates,
    postVerifyCode
}
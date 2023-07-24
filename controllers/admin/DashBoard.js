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

const getAllPgPerson = (req, res, next) => {
    renderView(req, res, "pages/dashboard/pg-person/person", {
        pageTitle: "PG Persons"
    });
}

const getNewPgPersonFrm = (req, res, next) => {

    req.session.step1 = { isCompleted: req.session?.step1?.isCompleted || false };

    const country = req?.session?.userInfo ? getAllStates[req?.session?.userInfo["person-country"]] : false;
    const isVerificationPending = req?.session?.userInfo ? req.session.userInfo['person-mobile-verified'] : false
    const pageData = {
        pageTitle: "Add New Person",
        country: getAllCountry,
        states: country,
        oldValue: req?.session?.userInfo || false,
        isVerificationPending: true
    }
    if (req.session?.step1?.isCompleted) {
        pageData["isVerificationPending"] = isVerificationPending
    }
    renderView(req, res, "pages/dashboard/pg-person/create-person", pageData);

}

const getNewPgPersonGuardianFrm = (req, res, next) => {
    console.log(req.session.userInfo);
    // if (req.session?.step1 && req.session?.step1.isCompleted == false) {
    //     return res.redirect("/dashboard/person/create-new/personal-info");
    // }else if(req.session.userInfo == undefined){
    //     return res.redirect("/dashboard/person/create-new/personal-info");
    // } else if (req.session.userInfo && req.session.userInfo['person-mobile-verified'] == false) {
    //     return res.redirect("/dashboard/person/create-new/personal-info");
    // }

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
        req.session.step1.isCompleted = true;
        res.redirect("/dashboard/person/create-new/guardian-info");
    }
    console.log(req.session.userInfo);
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
    console.log(req.session.userInfo);
    if (req.session.userInfo['person2-mobile-verified'] == undefined || req.session.userInfo['person2-mobile-verified'] == false) {
        // req.session.userInfo['person2-mobile-verified'] = false;

        req.session.userInfo['person2-mobile-verified'] = true;

        const formatedNumber = getFormatedNumber(req.session.userInfo['person2-country'], req.session.userInfo['person2-mobile']);
        console.log(formatedNumber)
        // const r = await sendSMS(formatedNumber);
        // console.log(r);
        return res.redirect("/dashboard/person/create-new/guardian-info");
    } else {
        req.session.step2.isCompleted = true;
        return res.redirect("/dashboard/person/create-new/payment");
    }

    res.redirect("/dashboard/person/create-new/payment");
}

const getPaymentFrm = async (req, res, next) => {
    try{
        if(req.session.currentPeson == undefined){
            const pd = req.session.userInfo;
            const newPerson = new pg_person({
                fullName: pd["person-fullname"],
                email: pd["person-email"],
                gender: pd["person-gender"],
                dob: new Date(pd["person-dob"]),
                doc_type: pd["person-doc-type"],
                doc_front: pd["person-doc-front"],
                doc_back: pd["person-doc-back"] || '',
                profile_image: pd["person-image"],
                mobile_no: pd["person-mobile"],
                is_mobile_verified: pd["person-mobile-verified"],
                address_line1: pd["person-address-ln1"],
                address_line2: pd["person-address-ln2"],
                city: pd["person-city"],
                state: pd["person-state"],
                country: pd["person-country"],
                zipcode: pd["person-zipcode"],
                guardian_fullName: pd["person2-fullname"],
                guardian_email: pd["person2-email"],
                guardian_gender: pd["person2-gender"],
                guardian_doc_type: pd["person2-doc-type"],
                guardian_doc_front: pd["person2-doc-front"],
                guardian_doc_back: pd["person2-doc-back"] || '',
                guardian_mobile_no: pd["person2-mobile"],
                guardian_is_mobile_verified: pd["person2-mobile-verified"],
                guardian_address_line1: pd["person2-address-ln1"],
                guardian_address_line2: pd["person2-address-ln2"],
                guardian_city: pd["person2-city"],
                guardian_state: pd["person2-state"],
                guardian_country: pd["person2-country"],
                guardian_zipcode: pd["person2-zipcode"],
                payment_type: "cash",
                payment_status: "paid",
                payment_amount: "12000"
            });
        
            const row = await newPerson.save();
            console.log(row);
            if(row._id){
                req.session.currentPeson = row._id.toString();
            }
        }
        
        renderView(req, res, "pages/dashboard/pg-person/payment", {
            pageTitle: "Add New Person",
        });
    }catch(err){
        if(!err.stateCode){
            err.stateCode = 500;
        }
        throw new Error(err);
    }


}

const postPaymentFrm = (req,res,next) =>{
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

        console.log(allError);

        return renderView(req, res, "pages/dashboard/pg-person/payment", {
            pageTitle: "Add New Person",
        });
    }
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
                req.session.step2.isCompleted = true;
            } else {
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
    getPaymentFrm,
    postPaymentFrm,
    getStates,
    postVerifyCode
}
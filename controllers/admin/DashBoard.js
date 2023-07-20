const renderView = require("../../utils/helpers");
const { getAllCountry, getAllStates, getAllDialCode } = require("../../utils/state-country");
const fileUploads = require("../../utils/file-upload-helper");
const { validationResult } = require("express-validator");
const sendSMS = require("../../utils/send-sms");


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
    renderView(req, res, "pages/dashboard/pg-person/create-person", {
        pageTitle: "Add New Person",
        country: getAllCountry,
        states: getAllStates[req?.session?.userInfo["person-country"]] || null,
        oldValue: req?.session?.userInfo || false
    });
}

const getNewPgPersonGuardianFrm = (req,res,next)=>{
    if(req.session?.step1 && req.session?.step1.isCompleted == false){
       return res.redirect("/dashboard/person/create-new/personal-info");
    }
    req.session.step2 = { isCompleted: req.session?.step2?.isCompleted || false };
    renderView(req, res,"pages/dashboard/pg-person/person-guardian", {
        pageTitle: "Add New Person",
        country: getAllCountry,
        states: getAllStates[req?.session?.userInfo["person2-country"]] || null,
        oldValue: req?.session?.userInfo || false
    });
}

const postNewPgPersonFrm = (req, res, next) => {

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

    console.log(req.body);
    /**
     * If no error then we reach here and we good to go 
     */

    console.log(req.session.userInfo);
    req.session.step1.isCompleted = true;
    res.redirect("/dashboard/person/create-new/guardian-info");
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

const postNewPgPersonGuardianFrm = (req,res,next) =>{
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
    req.session.step2.isCompleted = true;
    res.redirect("/dashboard/person/create-new/guardian-info");
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

module.exports = {
    getDashBoard,
    getAllPgPerson,
    getNewPgPersonFrm,
    postNewPgPersonFrm,
    getNewPgPersonGuardianFrm,
    postNewPgPersonGuardianFrm,
    getStates
}
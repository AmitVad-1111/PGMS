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

    req.session.step1 = { isCompleted: req.session?.step1?.isCompleted || false };
    req.session.step2 = { isCompleted: req.session?.step2?.isCompleted || false };
    req.session.step3 = { isCompleted: req.session?.step3?.isCompleted || false };
    req.session.step4 = { isCompleted: req.session?.step4?.isCompleted || false };

    let step = "step1";

    if (!req.session?.step1?.isCompleted) {
        step = "step1";
    } else if (!req.session?.step2?.isCompleted) {
        step = "step2";
    } else if (!req.session?.step3?.isCompleted) {
        step = "step3";
    } else if (!req.session?.step4?.isCompleted) {
        step = "step4";
    }


    renderView(req, res, "pages/dashboard/pg-person/create-person", {
        pageTitle: "Add New Person",
        steps: {
            step1: req.session.step1,
            step2: req.session.step2,
            step3: req.session.step3,
            step4: req.session.step4,
        },
        currentStep: step,
        country: getAllCountry,
        states: null
    });
}

const postNewPgPersonFrm = (req, res, next) => {

    const parseError = {};
    const ses = req.session;
    let currentStep = req.body.currentStep;

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
            steps: {
                step1: req.session.step1,
                step2: req.session.step2,
                step3: req.session.step3,
                step4: req.session.step4,
            },
            currentStep: currentStep,
            country: getAllCountry,
            states: getAllStates[req.body["person-country"]] || null,
            errorObj: parseError,
            oldValue: { ...req.body, ...req.session.uploadFiles }
        });
    }

    console.log(req.body);
    /**
     * If no error then we reach here and we good to go 
     */

    if (currentStep == "step1" && !ses.step1.isCompleted) {
        ses.step1.isCompleted = true;
        currentStep = "step2";
    } else if (currentStep == "step2" && !ses.step2.isCompleted) {
        ses.step2.isCompleted = true;
        currentStep = "step3";
    } else if (currentStep == "step3" && !ses.step3.isCompleted) {
        ses.step3.isCompleted = true;
        currentStep = "step4";
    } else if (currentStep == "step4" && !ses.step4.isCompleted) {
        ses.step4.isCompleted = true;
        currentStep = "success";
    } else {
        delete req.session.step1;
        delete req.session.step2;
        delete req.session.step3;
        delete req.session.step4;
    }

    if (!req.session.userInfo) {
        req.session.userInfo = { ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles };
    } else {
        req.session.userInfo = { ...req.session.userInfo, ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles }
    }

    console.log(req.session.userInfo);
    renderView(req, res, "pages/dashboard/pg-person/create-person", {
        pageTitle: "Add New Person",
        steps: {
            step1: req.session.step1,
            step2: req.session.step2,
            step3: req.session.step3,
            step4: req.session.step4,
        },
        currentStep: currentStep,
        country: getAllCountry,
        states: getAllStates[req.body["person-country"]] || null
    });

    delete req.session.uploadFiles;
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
    getStates
}
const renderView = require("../../utils/helpers");
const { getAllCountry, getAllStates } = require("../../utils/state-country");
const { validationResult } = require("express-validator");

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

    req.session.step1 = { isCompleted: false };
    req.session.step2 = { isCompleted: false };
    req.session.step3 = { isCompleted: false };
    req.session.step4 = { isCompleted: false };

    let step = "step1";

    if (req.query.step == '1') {
        step = "step1";
    } else if (req.query.step == '2') {
        step = "step2";
    } else if (req.query.step == '3') {
        step = "step3";
    } else if (req.query.step == '4') {
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
        country: getAllCountry
    });
}

const postNewPgPersonFrm = (req, res, next) => {
    const ses = req.session;
    let currentStep = req.body.currentStep;

    const errors = validationResult(req);
    let parseError = {};

    console.log(parseError)
    if(!errors.isEmpty()){
        const allError = errors.array();
        allError.forEach(err => {
            parseError[err.path] = err.msg
        });

        console.log(parseError);

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
            errorObj: parseError,
            oldValue: req.body
        });
    }

    console.log(req.body)

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

    }

    renderView(req, res, "pages/dashboard/pg-person/create-person", {
        pageTitle: "Add New Person",
        steps: {
            step1: req.session.step1,
            step2: req.session.step2,
            step3: req.session.step3,
            step4: req.session.step4,
        },
        currentStep: currentStep,
        country: getAllCountry
    });
}

const getStates = (req, res, next) => {
    try{
        const states = getAllStates[req.body.country] || null;
        if (states) {
            res.send(JSON.stringify({ success: true, data:states }));
        } else {
            res.send(JSON.stringify({ success: false, errMessage: "please provide valid country", data: null }));
        }
    }catch(err){
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
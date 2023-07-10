const renderView = require("../../utils/helpers");
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
    req.session.step1 = { isCurrent: true, status: "pending" };
    req.session.step2 = { isCurrent: false, status: "pending" };
    req.session.step3 = { isCurrent: false, status: "pending" };

    let step = "step1";

    if (req.query.step == '1') {
        step = "step1";
    } else if (req.query.step == '2') {
        step = "step2";
    } else if (req.query.step == '3') {
        step = "step3";
    }

    console.log(step)
    renderView(req, res, "pages/dashboard/pg-person/create-person", {
        pageTitle: "Add New Person",
        steps: {
            step1: req.session.step1,
            step2: req.session.step2,
            step3: req.session.step3
        },
        currentStep: step
    });
}

const postNewPgPersonFrm = (req, res, next) => {
    const ses = req.session
    if (ses.step1 && ses.step1.isCurrent) {
        ses.step1.status = "completed"
        ses.step2.isCurrent = true;
    } else if (ses.step2 && ses.step2.isCurrent) {
        ses.step2.status = "completed"
        ses.step3.isCurrent = true;
    } else if (ses.step3 && ses.step3.isCurrent) {
        ses.step3.status = "completed"
    } else {

    }

    renderView(req, res, "pages/dashboard/pg-person/create-person", {
        pageTitle: "Add New Person",
        steps: {
            step1: req.session.step1,
            step2: req.session.step2,
            step3: req.session.step3
        }
    });
}

module.exports = {
    getDashBoard,
    getAllPgPerson,
    getNewPgPersonFrm,
    postNewPgPersonFrm
}
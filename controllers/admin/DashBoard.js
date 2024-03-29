const renderView = require("../../utils/helpers");
const { getAllCountry, getAllStates, getAllDialCode } = require("../../utils/state-country");
const fileUploads = require("../../utils/file-upload-helper");
const { validationResult, body } = require("express-validator");
const { sendSMS, verifyCode } = require("../../utils/send-sms");
const Person = require("../../utils/admin/person");
const Payments = require("../../utils/admin/payments");
const Rooms = require("../../utils/admin/room");

const roomFacility = {
    "ac": "/icons/facility/ac.png",
    "wifi":"/icons/facility/wifi.png",
    "attached bathroom":"/icons/facility/bathroom.png",
    "tv":"/icons/facility/tv.png",
    "fridge":"/icons/facility/fridge.png",
    "water purifire":"/icons/facility/water-cooler.png",
    "personal wardrobe":"/icons/facility/wardrob.png"
}

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
        persons: gpPgUser.length ? gpPgUser : false
    });
}

const postPerson = async (req, res, next) => {
    const pid = req.body.person_id;
    const p = new Person(pid);
    await p.removePerson();
    res.redirect("/dashboard/person");
}

const getNewPgPersonFrm = async (req, res, next) => {
    let userdata = null;

    if (req.query?.is == "new") {
        delete req.session.userInfo;
        delete req.session.uploadFiles;
        delete req.session.currentPerson;
        delete req.session.step1;
        delete req.session.step2;
        delete req.session.step3;
    }

    if (req.session.currentPerson) {
        const p = new Person(req.session.currentPerson);
        userdata = await p.getPersonalDetails();
    }

    req.session.step1 = { isCompleted: req.session?.step1?.isCompleted || false };

    const country = req?.session?.userInfo ? getAllStates[req?.session?.userInfo["person-country"]] : false;
    const isVerificationPending = req?.session?.userInfo ? req.session.userInfo['person-mobile-verified'] : true;
    const pageData = {
        pageTitle: "Add New Person",
        country: getAllCountry,
        states: country,
        oldValue: userdata || req?.session?.userInfo || false,
        isVerificationPending: true,
        pid: req.session.currentPerson || ''
    }
    if (!req.session?.step1?.isCompleted) {
        pageData["isVerificationPending"] = isVerificationPending
    }
    renderView(req, res, "pages/dashboard/pg-person/create-person", pageData);

}

const getNewPgPersonGuardianFrm = async (req, res, next) => {
    let userdata = null;
    if (req.session.currentPerson) {
        const p = new Person(req.session.currentPerson);
        userdata = await p.getGuardianDetails();
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

    const isVerificationPending = req.session.userInfo['person2-mobile-verified'] != undefined ? req.session.userInfo['person2-mobile-verified'] : true;
    const pageData = {
        pageTitle: "Add New Person",
        country: getAllCountry,
        states: country,
        oldValue: req?.session?.userInfo || userdata || false,
        isVerificationPending: true,
    }
    if (!req.session?.step2?.isCompleted) {
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
        req.session.userInfo['person-mobile-verified'] = false;
        // req.session.userInfo['person-mobile-verified'] = true;

        if (process.env.TWILLIO_ENABLED == "true") {
            const formatedNumber = getFormatedNumber(req.session.userInfo['person-country'], req.session.userInfo['person-mobile']);
            const r = await sendSMS(formatedNumber);
            console.log(r);
        } else {

        }

        res.redirect("/dashboard/person/create-new/personal-info");
    } else {
        /**
         * check person is set or not
         */
        const person_id = req.session.currentPerson == undefined ? null : req.session.currentPerson;

        const p = new Person(person_id);
        let r = await p.addPersonalDetails(req.session.userInfo);
        if (r) {
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
        req.session.userInfo['person2-mobile-verified'] = false;

        // req.session.userInfo['person2-mobile-verified'] = true;

        if (process.env.TWILLIO_ENABLED == "true") {
            const formatedNumber = getFormatedNumber(req.session.userInfo['person2-country'], req.session.userInfo['person2-mobile']);
            const r = await sendSMS(formatedNumber);
            console.log(r);
        }

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
    /**
     * If user direct request this page then check if user completed previous steps
     * if not completed then redirect user to the first step 
     */
    if (req.session.currentPerson == undefined) {
        res.redirect("/dashboard/person/create-new/personal-info?is=new");
    }

    req.session.step3 = { isCompleted: req.session?.step3?.isCompleted || false };

    try {
        // let payData = [];
        // const person = new Person(req.session.currentPerson || null);
        // let payData = await person.getPaymentInfo();

        const payments = new Payments(req.session.currentPerson);
        const allTags = await payments.getPaymentTags();
        renderView(req, res, "pages/dashboard/pg-person/payment", {
            pageTitle: "Add New Person",
            payTags: allTags.length ? allTags : false
            // oldValue: payData[0] || false
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
            payTags: false
        });
    }

    if (req.session.currentPerson == undefined) {
        const err = Error("User not found");
        err.stateCode = 404;
        throw err;
    }

    let payData = null;
    let paymentadded = false;

    let cperson = new Person(req.session.currentPerson);
    let p = await cperson.makePayment(req.body);
    if (p) {
        paydata = false;
        paymentadded = true
    }

    const payments = new Payments(req.session.currentPerson);
    const allTags = await payments.getPaymentTags();

    req.session.step3.isCompleted = true;

    return renderView(req, res, "pages/dashboard/pg-person/payment", {
        pageTitle: "Add New Person",
        paymentadded: paymentadded,
        payTags: allTags.length ? allTags : false
    });

}

const getEditPerson = async (req, res, next) => {
    if (req.session.uid == undefined) {
        return res.redirect("/dashboard/person");
    }

    const uid = req.session.uid;
    // const person = new Person(uid);
    // const data = await person.getPersonalDetails();
    return renderView(req, res, "pages/dashboard/pg-person/editPerson", {
        pageTitle: "Edit Person",
        country: getAllCountry,
        states: getAllStates[req.session.userInfo["person-country"]] || false,
        oldValue: req.session.userInfo || false,
        pid: uid
    });
}

const postEditPerson = async (req, res, next) => {
    const uid = req.body.pid;
    const cTab = "personal";

    const parseError = {};
    const person = new Person(uid);
    let data = await person.getPersonalDetails();

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
        const isVerified = req.session?.userInfo ? req.session?.isMobileVerified : true;
        if (!isVerified) {
            const formatedNumber = getFormatedNumber(req.session.userInfo['person-country'], req.session.userInfo['person-mobile']);
            if (process.env.TWILLIO_ENABLED == "true") {
                const r = await sendSMS(formatedNumber);
                console.log(r);
                console.log("TWILLIO_ENABLED: Yes");
            } else {
                console.log("TWILLIO_ENABLED: NO");
            }

        }

        return renderView(req, res, "pages/dashboard/pg-person/editPerson", {
            pageTitle: "Edit Person",
            country: getAllCountry,
            states: getAllStates[req.body["person-country"]] || false,
            pid: uid,
            currentTab: cTab,
            errorObj: parseError,
            oldValue: req.session.userInfo || false,
            isVerificationPending: isVerified
        });

    }

    const updPersonal = await person.editPersonalDetails(req.session.userInfo);
    let message = "";
    if (updPersonal) {
        message = "personal detail updated successfully!";
        // req.session.userInfo = null;
        req.session.uploadFiles = null;
        req.session.isMobileVerified = false;
        let p = await person.getPersonalDetails();
        let g = await person.getGuardianDetails();
        data = Object.assign({}, p, g);
    }

    // renderView(req, res, "pages/dashboard/pg-person/editPerson", {
    //     pageTitle: "Edit Person",
    //     country: getAllCountry,
    //     states: getAllStates[data["person-country"]] || false,
    //     oldValue: data || false,
    //     pid: uid,
    //     currentTab: cTab,
    //     successMsg: message
    // });
    return res.redirect("/dashboard/person");
}

const getEditGuardian = async (req, res, next) => {
    if (req.session.uid == undefined) {
        return res.redirect("/dashboard/person");
    }

    const uid = req.session.uid;
    return renderView(req, res, "pages/dashboard/pg-person/editPerson", {
        pageTitle: "Edit Person",
        country: getAllCountry,
        states: getAllStates[req.session.userInfo["person2-country"]] || false,
        oldValue: req.session.userInfo || false,
        pid: uid,
        currentTab: "guardian"
    });
}

const postEditGurdian = async (req, res, next) => {
    const uid = req.body.pid;
    const parseError = {};
    const person = new Person(uid);
    let data = await person.getGuardianDetails();
    const cTab = "guardian";

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

        const isVerified = req.session?.userInfo ? req.session?.isMobileVerified2 : true;
        if (!isVerified) {
            const formatedNumber = getFormatedNumber(req.session.userInfo['person2-country'], req.session.userInfo['person2-mobile']);
            if (process.env.TWILLIO_ENABLED == "true") {
                const r = await sendSMS(formatedNumber);
                console.log(r);
                console.log("TWILLIO_ENABLED: Yes");
            } else {
                console.log("TWILLIO_ENABLED: NO");
            }
        }

        return renderView(req, res, "pages/dashboard/pg-person/editPerson", {
            pageTitle: "Edit Person",
            country: getAllCountry,
            states: getAllStates[req.session.userInfo["person2-country"]] || false,
            pid: uid,
            currentTab: cTab,
            errorObj: parseError,
            oldValue: req.session.userInfo || false,
            isVerificationPending: isVerified
        });

    }

    const updPersonal = await person.addEditGuardianDetails(req.session.userInfo);
    let message = "";
    if (updPersonal) {
        message = "guardian details updated successfully!";
        // req.session.userInfo = null;
        req.session.isMobileVerified2 = false;
        req.session.uploadFiles = null;
        let p = await person.getPersonalDetails();
        let g = await person.getGuardianDetails();
        data = Object.assign({}, p, g);
    }

    // renderView(req, res, "pages/dashboard/pg-person/editPerson", {
    //     pageTitle: "Edit Person",
    //     country: getAllCountry,
    //     states: getAllStates[data["person2-country"]] || false,
    //     oldValue: data || false,
    //     pid: uid,
    //     currentTab: cTab,
    //     successMsg: message
    // });
    return res.redirect("/dashboard/person");

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
    const mode = req.body.mode;

    if (code > 0) {
        let formatedNumber;
        if (req.session.userInfo == undefined) {
            return res.send(JSON.stringify({
                success: false,
                data: "mobile number not provided",
                errMessage: "incorrect code"
            }));
        }

        if (mode == "edit") {
            const verificatinType = req.session.verify_for;
            if (verificatinType == "personal") {
                formatedNumber = getFormatedNumber(req.session.userInfo['person-country'], req.session.userInfo['person-mobile']);
            }

            if (verificatinType == "guardian") {
                formatedNumber = getFormatedNumber(req.session.userInfo['person2-country'], req.session.userInfo['person2-mobile']);
            }
        } else {
            if (req.session.userInfo['person-mobile-verified']) {
                formatedNumber = getFormatedNumber(req.session.userInfo['person2-country'], req.session.userInfo['person2-mobile']);
            } else {
                formatedNumber = getFormatedNumber(req.session.userInfo['person-country'], req.session.userInfo['person-mobile']);
            }
        }

        let response;
        if (process.env.TWILLIO_ENABLED == "true") {
            response = await verifyCode(formatedNumber, code);
        } else {
            response = code == 121212 ? "approved" : false;
        }

        if (response == "approved") {
            if (req.session.userInfo['person-mobile-verified']) {
                req.session.userInfo['person2-mobile-verified'] = true;
            } else {
                req.session.userInfo['person-mobile-verified'] = true;
            }

            //for edit person
            if (mode == "edit") {
                const verificatinType = req.session.verify_for;
                if (verificatinType == "personal") {
                    req.session.isMobileVerified = true;
                }

                if (verificatinType == "guardian") {
                    req.session.isMobileVerified2 = true;
                }
            }

            delete req.session.verify_for;

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

const getRoomFrm = async (req, res, next) => {

    /**
     * If user direct request this page then check if user completed previous steps
     * if not completed then redirect user to the first step 
     */
    if (req.session.currentPerson == undefined) {
        return res.redirect("/dashboard/person/create-new/personal-info?is=new");
    }

    const rooms = new Rooms();
    const roomList = await rooms.getRoomList();

    const rl = {};
    roomList.length && roomList.forEach(r => {
        //check if room full or there is space available for new roommate
        if (r.room_mates.length < r.num_of_sharing) {
            rl[r.room_no] = `${r.room_no} | ${r.room_location}`;
        }
    })
    return renderView(req, res, "pages/dashboard/pg-person/add-roommate", {
        pageTitle: "Add Roommate",
        rooms: Object.keys(rl).length ? rl : false
    });
}

const postRoomFrm = async (req, res, next) => {
    const rooms = new Rooms();
    const m = await rooms.addRoomMate(req.body.room_no, req.session.currentPerson);
    const roomList = await rooms.getRoomList();

    if(m){
        delete req.session.step1;
        delete req.session.step2;
        delete req.session.step3;
        delete req.session.uploadFiles;
        delete req.session.userInfo;
        delete req.session.currentPerson;
        return res.redirect("/dashboard/person");
    }else{
        const rl = {};
        roomList.length && roomList.forEach(r => {
            //check if room full or there is space available for new roommate
            if (r.room_mates.length < r.num_of_sharing) {
                rl[r.room_no] = `${r.room_no} | ${r.room_location}`;
            }
        });
        return renderView(req, res, "pages/dashboard/pg-person/add-roommate", {
            pageTitle: "Add Roommate",
            rooms: Object.keys(rl).length ? rl : false
        });
    }

}

const getCreateRoomFrm = (req, res, next) => {

    if (req.session.roomInfo) {
        delete req.session.roomInfo;
        delete req.session.uploadFiles;
    }

    return renderView(req, res, "pages/dashboard/pg-rooms/create-room", {
        pageTitle: "Add Room",
    });
}

const getRoomList = async (req, res, next) => {
    const rooms = new Rooms();
    const roomList = await rooms.getRoomList();
    return renderView(req, res, "pages/dashboard/pg-rooms/rooms", {
        pageTitle: "Rooms",
        rooms: roomList.length ? roomList : false
    });
}

const postCreateRoomFrm = async (req, res, next) => {
    
    const k = [];
    const parseError = {}

    if (!req.session.roomInfo) {
        req.session.roomInfo = { ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles };
    } else {
        req.session.roomInfo = { ...req.session.roomInfo, ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles }
    }

    if(req.session.roomInfo['room_facility'] && req.session.roomInfo['room_facility'].length){
        req.session.roomInfo['room_facility'].forEach(f =>{
            k.push({
                facility_title: f,
                facility_icon: roomFacility[f]
            }) 
        })
        req.session.roomInfo['room_facility'] = k;
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

        return renderView(req, res, "pages/dashboard/pg-rooms/create-room", {
            pageTitle: "Add room",
            errorObj: parseError,
            oldValue: req.session.roomInfo || false,
        });

    }

    const r = new Rooms();
    const roomId = await r.addNewRoom(req.session.roomInfo);

    if (roomId) {
        delete req.session.roomInfo;
        delete req.session.uploadFiles;
        return res.redirect("/dashboard/rooms");
    }

    return renderView(req, res, "pages/dashboard/pg-rooms/create-room", {
        pageTitle: "Add Room",
        oldValue: false,
        errorObj: false
    });
}

const getRoomEdit = async (req, res, next) => {
    const { rid } = req.query;
    const gr = new Rooms(rid);
    const grData = await gr.getRoom();
    return renderView(req, res, "pages/dashboard/pg-rooms/create-room", {
        pageTitle: "Add Room",
        isedit: true,
        oldValue: grData || false,
        rid: grData.id
    });
}

const postRoomEdit = async (req, res, next) => {

    const parseError = {};
    const { rid } = req.body;
    const gr = new Rooms(rid);
    const grData = await gr.getRoom();
    const k = [];
    

    req.body["room_image"] = grData.room_image;

    if (!req.session.roomInfo) {
        req.session.roomInfo = { ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles };
    } else {
        delete req.session.roomInfo;
        req.session.roomInfo = { ...req.session.roomInfo, ...JSON.parse(JSON.stringify(req.body)), ...req.session.uploadFiles }
    }

    req.session.roomInfo['room_facility'].length && req.session.roomInfo['room_facility'].forEach(f =>{
        k.push({
            facility_title: f,
            facility_icon: roomFacility[f]
        }) 
    });
    req.session.roomInfo['room_facility'] = k;

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

        return renderView(req, res, "pages/dashboard/pg-rooms/create-room", {
            pageTitle: "Add room",
            isedit: true,
            errorObj: parseError,
            oldValue: req.session.roomInfo || false,
            rid: rid
        });

    }
  


    const isRoomUpdated = await gr.editRoom(req.session.roomInfo);
    if (isRoomUpdated) {
        delete req.session.roomInfo;
        delete req.session.uploadFiles;
        return res.redirect("/dashboard/rooms");
    }

}

const removeRoom = async (req, res, next) => {
    console.log("Remove =>>>>", req.body.room_id);
    const j = new Rooms(req.body.room_id);
    await j.removeRoom();
    return res.redirect("/dashboard/rooms");
}

const clearAllSessionData =(req,res,next) => {
    console.log("sesseion cleared");
    next()
}

const ajaxGetRoom = async (req,res,next) => {
    const {roomId} = req.body
    if(roomId){
        const room = new Rooms(roomId);
        const d = await room.getRoom();

        let x = [];
        d.room_mates.length && d.room_mates.forEach(pd => {
            x.push({
                name: pd.fullName,
                mobile_no: `${getAllDialCode[pd.country]}-${pd.mobile_no}`,
                profile: pd.profile_image
            });
        });

        d.room_mates = x;

        return res.status(200).send(JSON.stringify({
            success: true,
            data: d,
            errMessage: null
        }));
    }

    return res.status(404).send(JSON.stringify({
        success: false,
        data: null,
        errMessage: "Room Not Found"
    }));


}

const ajaxGetRoomMates = async (req,res,next) =>{
    try{
        const p = new Person();
        const gpPgUser = await p.getAllPgPerson();
    
        const person = [];
        gpPgUser.length && gpPgUser.forEach(p =>{
            person.push({
                id: p.id,
                fullName:p.fullName,
                profile:p.profile_image,
                city:p.city
            });
        })
        
    
        return res.status(200).send(JSON.stringify({
            success: true,
            data: person,
            errMessage: null
        }));

    }catch(e){
        return res.status(500).send(JSON.stringify({
            success: false,
            data: null,
            errMessage: "Server Error"
        }));
    }
}

const ajaxPostRoomMates = async (req,res,next) =>{
    const {person,roomid} = req.body;
    if(roomid && person){
        const r = new Rooms();
        let isAdded = await r.addRoomMate(roomid,person);
        if(isAdded){
            return res.status(200).send(JSON.stringify({
                success: true,
                data: isAdded.room_no,
                errMessage: null
            }));
        }else{
            return res.status(404).send(JSON.stringify({
                success: false,
                data: null,
                errMessage: "Person not found"
            }));    
        }
        
    }else{
        return res.status(404).send(JSON.stringify({
            success: false,
            data: null,
            errMessage: "Person not found"
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
    getEditGuardian,
    postEditGurdian,
    postPerson,
    getStates,
    postVerifyCode,
    getRoomFrm,
    postRoomFrm,
    getCreateRoomFrm,
    postCreateRoomFrm,
    getRoomEdit,
    postRoomEdit,
    removeRoom,
    getRoomList,
    clearAllSessionData,
    ajaxGetRoom,
    ajaxGetRoomMates,
    ajaxPostRoomMates
}
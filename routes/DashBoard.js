const express = require("express");
const fileUploads = require("../utils/file-upload-helper");
const setCurrentUser = require("../middelware/set-current");
const { personalInfoValidator, parentGuardianValidator, paymentFormValidator } = require("../validation-rules/admin/new-person-validator");
const router = express.Router();
const {
   getDashBoard,
   getAllPgPerson,
   getNewPgPersonFrm,
   postNewPgPersonFrm,
   getNewPgPersonGuardianFrm,
   postNewPgPersonGuardianFrm,
   getPaymentFrm,
   postPaymentFrm,
   getStates,
   postVerifyCode,
   getEditPerson,
   postEditPerson,
   getEditGuardian,
   postEditGurdian,
   postPerson
} = require("../controllers/admin/DashBoard");

const uploadFields = [
   { name: 'person-image', maxCount: 1 },
   { name: 'person-doc-front', maxCount: 1 },
   { name: 'person-doc-back', maxCount: 1 },
   { name: 'person2-doc-front', maxCount: 1 },
   { name: 'person2-doc-back', maxCount: 1 }
]


router.get("/", getDashBoard);

router.get("/person", getAllPgPerson);
router.post("/person",fileUploads.none(),postPerson);

router.get("/person/create-new/personal-info", getNewPgPersonFrm);
router.post("/person/create-new/personal-info", fileUploads.fields(uploadFields), personalInfoValidator(), postNewPgPersonFrm);

router.get("/person/create-new/guardian-info", getNewPgPersonGuardianFrm);
router.post("/person/create-new/guardian-info", fileUploads.fields(uploadFields), parentGuardianValidator(), postNewPgPersonGuardianFrm);

router.get("/person/create-new/payment-info", getPaymentFrm);
router.post("/person/create-new/payment-info", fileUploads.none(), paymentFormValidator(), postPaymentFrm);

router.get("/person/edit/personal",setCurrentUser,getEditPerson);
router.post("/person/edit/personal",fileUploads.fields(uploadFields), personalInfoValidator(),postEditPerson)

router.get("/person/edit/guardian",setCurrentUser,getEditGuardian);
router.post("/person/edit/guardian",fileUploads.fields(uploadFields), parentGuardianValidator(),postEditGurdian)

// Ajax Routes
router.post("/states", getStates);
router.post("/verifycode",postVerifyCode);

module.exports = router;
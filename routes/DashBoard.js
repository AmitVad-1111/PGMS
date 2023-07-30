const express = require("express");
const fileUploads = require("../utils/file-upload-helper");
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
   postEditPerson
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
router.get("/person/create-new/personal-info", getNewPgPersonFrm);
router.post("/person/create-new/personal-info", fileUploads.fields(uploadFields), personalInfoValidator(), postNewPgPersonFrm);

router.get("/person/create-new/guardian-info", getNewPgPersonGuardianFrm);
router.post("/person/create-new/guardian-info", fileUploads.fields(uploadFields), parentGuardianValidator(), postNewPgPersonGuardianFrm);

router.get("/person/create-new/payment-info", getPaymentFrm);
router.post("/person/create-new/payment-info", fileUploads.none(), paymentFormValidator(), postPaymentFrm);

router.get("/person/edit/:uid",getEditPerson)
router.post("/person/edit/personal",postEditPerson)

// Ajax Routes
router.post("/states", getStates);
router.post("/verifycode", postVerifyCode);

module.exports = router;
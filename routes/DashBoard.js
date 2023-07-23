const express = require("express");
const fileUploads = require("../utils/file-upload-helper");
const { personalInfoValidator, parentGuardianValidator } = require("../validation-rules/admin/new-person-validator");
const router = express.Router();
const {
   getDashBoard,
   getAllPgPerson,
   getNewPgPersonFrm,
   postNewPgPersonFrm,
   getNewPgPersonGuardianFrm,
   postNewPgPersonGuardianFrm,
   getStates,
   postVerifyCode
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
router.post("/person/create-new/personal-info",fileUploads.fields(uploadFields),personalInfoValidator(), postNewPgPersonFrm);

router.get("/person/create-new/guardian-info", getNewPgPersonGuardianFrm);
router.post("/person/create-new/guardian-info",fileUploads.fields(uploadFields),parentGuardianValidator(), postNewPgPersonGuardianFrm);


// Ajax Routes
router.post("/states", getStates);
router.post("/verifycode",postVerifyCode);

module.exports = router;
const express = require("express");
const fileUploads = require("../utils/file-upload-helper");
const newPersonValidator = require("../validation-rules/admin/new-person-validator");
const router = express.Router();
const {
   getDashBoard,
   getAllPgPerson,
   getNewPgPersonFrm,
   postNewPgPersonFrm,
   getStates
} = require("../controllers/admin/DashBoard");

const uploadFields = [
   { name: 'person-image', maxCount: 1 },
   { name: 'person-doc-front', maxCount: 1 },
   { name: 'person-doc-back', maxCount: 1 }
]

router.get("/", getDashBoard);
router.get("/person", getAllPgPerson);
router.get("/person/create-new", getNewPgPersonFrm);
router.post("/person/create-new",fileUploads.fields(uploadFields), newPersonValidator(), postNewPgPersonFrm);


// Ajax Routes
router.post("/states", getStates);

module.exports = router;
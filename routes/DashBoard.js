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

router.get("/", getDashBoard);
router.get("/person", getAllPgPerson);
router.get("/person/create-new", getNewPgPersonFrm);
router.post("/person/create-new", newPersonValidator(), postNewPgPersonFrm);


// Ajax Routes
router.post("/states", getStates);

module.exports = router;
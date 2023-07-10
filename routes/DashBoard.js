const express = require("express");
const router = express.Router();
const {
   getDashBoard,
   getAllPgPerson,
   getNewPgPersonFrm,
   postNewPgPersonFrm
} = require("../controllers/admin/DashBoard");

router.get("/", getDashBoard);
router.get("/person", getAllPgPerson);
router.get("/person/create-new", getNewPgPersonFrm);
router.post("/person/create-new", postNewPgPersonFrm);


module.exports = router;
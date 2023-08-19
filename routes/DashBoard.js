const express = require("express");
const fileUploads = require("../utils/file-upload-helper");
const setCurrentUser = require("../middelware/set-current");
const { personalInfoValidator, parentGuardianValidator, paymentFormValidator } = require("../validation-rules/admin/new-person-validator");
const roomValidator = require("../validation-rules/admin/add-room-validation");
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
   postPerson,
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
} = require("../controllers/admin/DashBoard");

const uploadFields = [
   { name: 'person-image', maxCount: 1 },
   { name: 'person-doc-front', maxCount: 1 },
   { name: 'person-doc-back', maxCount: 1 },
   { name: 'person2-doc-front', maxCount: 1 },
   { name: 'person2-doc-back', maxCount: 1 },
   { name: 'room_image', maxCount: 1 }
]



/******************************************************
 * DashBoar Routes
 ******************************************************/
router.get("/", getDashBoard);


/******************************************************
 * PG Inmates Routes
 ******************************************************/
router.get("/person", getAllPgPerson);

//remove person
router.post("/person", fileUploads.none(), postPerson);

router.get("/person/create-new/personal-info", getNewPgPersonFrm);
router.post("/person/create-new/personal-info", fileUploads.fields(uploadFields), personalInfoValidator(), postNewPgPersonFrm);

router.get("/person/create-new/guardian-info", getNewPgPersonGuardianFrm);
router.post("/person/create-new/guardian-info", fileUploads.fields(uploadFields), parentGuardianValidator(), postNewPgPersonGuardianFrm);

router.get("/person/create-new/payment-info", getPaymentFrm);
router.post("/person/create-new/payment-info", fileUploads.none(), paymentFormValidator(), postPaymentFrm);

router.get("/person/create-new/room-info", getRoomFrm);
router.post("/person/create-new/room-info",fileUploads.none(),postRoomFrm);

router.get("/person/edit/personal", setCurrentUser, getEditPerson);
router.post("/person/edit/personal", fileUploads.fields(uploadFields), personalInfoValidator(), postEditPerson)

router.get("/person/edit/guardian", setCurrentUser, getEditGuardian);
router.post("/person/edit/guardian", fileUploads.fields(uploadFields), parentGuardianValidator(), postEditGurdian)


/******************************************************
 * PG Room Routes
 ******************************************************/
router.get("/rooms", getRoomList);
router.get("/rooms/create", getCreateRoomFrm);
router.post("/rooms/create", fileUploads.fields(uploadFields), roomValidator(), postCreateRoomFrm);
router.get("/rooms/edit",getRoomEdit);
router.post("/rooms/edit",fileUploads.fields(uploadFields), roomValidator(),postRoomEdit)
router.post("/rooms/remove",fileUploads.none(),removeRoom);



/******************************************************
 * Ajax Route
 ******************************************************/
router.post("/states", getStates);
router.post("/verifycode", postVerifyCode);
router.post("/session/destroy",clearAllSessionData);
router.post("/getroom",ajaxGetRoom)
router.get("/getRoomMates",ajaxGetRoomMates)
router.post("/postRoomMates",ajaxPostRoomMates)

module.exports = router;
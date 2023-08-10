const {check,body} = require("express-validator");

const fileUplaodCustomLogic = (req, field, defaultError) => {
  const uploadFiles = req.files == undefined ? null : JSON.parse(JSON.stringify(req?.files));
  if (uploadFiles == null) {
    throw new Error(defaultError);
  }
  if (req.uploadInfo && req.uploadInfo.length) {
    const obj = req.uploadInfo.find(f => f.field == field);
    if (obj) {
      throw new Error(obj.errorDetail);
    } else {
      throw new Error(defaultError);
    }
  } else {
    if (Object.keys(uploadFiles).length == 0 && !req.session.uploadFiles) {
      throw new Error(defaultError);
    }
  }

  return true;
}

const roomValidator = () =>{
  return [
    body("room_no")
      .isLength({ min: 1 })
      .withMessage("Name is too small")
      .isLength({ max: 50 })
      .withMessage("Name is too big")
      .matches("^[a-zA-Z0-9- ]+$")
      .withMessage("you can only use alphanumeric , space and (-) dash"),
    /* ----------------------------------------------------------------------------------- */
      body("room_location").custom((value,{req})=>{
        if(value.trim() == ""){
          throw new Error("Please enter location");
        }
        return true;
      }),
    /* ----------------------------------------------------------------------------------- */
    body("num_sharing").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please enter no of person can share room")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("room_facility").custom((value, { req }) => {
      if (!Array.isArray(value) || value?.length == 0) {
        throw new Error("Please choose room facilities");
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    check("room_image").custom((value, { req }) => {
      const mode = req.body?.mode || undefined;
      if (mode && mode == "edit" && req.session?.userInfo["room_image"] == "") {
        return fileUplaodCustomLogic(req, "room_image", "Please upload room image");
      } else if (mode == undefined) {
        return fileUplaodCustomLogic(req, "room_image", "Please upload room image");
      }
      return true;
    }),
  ]
}

module.exports = roomValidator;
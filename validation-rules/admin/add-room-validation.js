const {check,body} = require("express-validator");
const PgRoom = require("../../models/admin/PgRoom");

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
      .withMessage("you can only use alphanumeric, space and (-) dash")
      .custom(async (value,{req}) => {
        const name = value?.trim();
        const mode = req.body?.mode || undefined;
        if(name?.length == 0){
          throw new Error("Please enter valid room name");
        }else if(name?.length){
          const d = await PgRoom.findOne({room_no: name});
          if(mode == "edit" && d && d._id != req.body.rid){
            throw new Error("Room alredy added with this name, please use different name");
          }else if(mode == undefined){
            if(d){
              throw new Error("Room alredy added with this name, please use different name");
            }
          }
        }
        return true;
      }),
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
      console.log(req.body)
      if (mode && mode == "edit" && req.body.rimg == "") {
        return fileUplaodCustomLogic(req, "room_image", "Please upload room image");
      } else if (mode == undefined) {
        return fileUplaodCustomLogic(req, "room_image", "Please upload room image");
      }
      return true;
    }),
  ]
}

module.exports = roomValidator;
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const getDirPath = (file) => {

  const dirPath = path.join(__dirname, "../public/images/uploads");
  if (file.fieldname == 'person-image') {
    return dirPath + "/pg-profiles";
  }

  if (
    file.fieldname == 'person-doc-front' ||
    file.fieldname == 'person-doc-back' ||
    file.fieldname == 'person2-doc-front' ||
    file.fieldname == 'person2-doc-back') {
    return dirPath + "/pg-docs";
  }

  if(file.fieldname == "room_image"){
    return dirPath + "/pg-room";
  }

  return dirPath;
}


/**
 * Multer Configuration
 */
const Storage = multer.diskStorage({
  destination: (req, file, cb) => {

    let savePath = getDirPath(file);
    try {
      if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
      }
      cb(null, savePath);
    } catch (err) {
      throw new Error(err)
    }

  },
  filename: (req, file, cb) => {
    let prefix, relPath;
    if (!req.session.uploadFiles) {
      req.session.uploadFiles = {};
    }
    if (file.fieldname == 'person-image') {
      prefix = "person-";
      relPath = "/pg-profiles";
    }

    if (
      file.fieldname == 'person-doc-front' ||
      file.fieldname == 'person-doc-back' ||
      file.fieldname == 'person2-doc-front' ||
      file.fieldname == 'person2-doc-back') {
      prefix = "person-doc-";
      relPath = "/pg-docs";
    }

    if(file.fieldname == "room_image"){
      prefix = "room-img-";
      relPath = "/pg-room";
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + "." + file.mimetype.split("/")[1];
    req.session.uploadFiles[file.fieldname] = `${relPath}/${prefix}${uniqueSuffix}`;
    cb(null, `${prefix}${uniqueSuffix}`)
  }
});


const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/gif", "image/png", "image/pdf"];
  req.uploadInfo = [];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const errorObj = {};
    errorObj.field = file.fieldname;
    errorObj.errorDetail = "only following file types are allowed (JPG, JPEG, GIF, PNG, PDF)";
    errorObj.errortype = "mimetype";
    req.uploadInfo.push(errorObj)
    cb(null, false);
  }

}

const fileUploads = multer({
  storage: Storage,
  fileFilter: fileFilter
})

module.exports = fileUploads;
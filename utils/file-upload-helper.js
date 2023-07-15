const multer = require("multer");
const path = require("path");

/**
 * Multer Configuration
 */
const Storage = multer.diskStorage({
  destination: (req,file,cb)=>{
   const dirPath = path.join(__dirname , "../public/images/pg-profiles");
     cb(null,dirPath);
  },
  filename: (req,file,cb)=>{
    console.log(file)
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + ".csv"
    cb(null, file.originalname)
  }
});

const fileUploads = multer({
  storage: Storage,
})

module.exports = fileUploads;
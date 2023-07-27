const { body, check } = require("express-validator");
const PgPerson = require("../../models/admin/PgPerson");

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

const personalInfoValidator = () => {
  return [
    /*******************************************************
      Parsonal Form Validation
     *******************************************************/

    body("person-fullname")
      .isLength({ min: 2 })
      .withMessage("Name is too small")
      .isLength({ max: 50 })
      .withMessage("Name is too big")
      .matches("^[a-zA-Z ]+$")
      .withMessage("Please enter valid Name"),

    /* ----------------------------------------------------------------------------------- */
    body("person-email").isEmail().withMessage("Please enter valid email").custom(async (value, { req }) => {

      const chk = await PgPerson.findOne({ email: value }).countDocuments();
      console.log("Is Already Registered : ", chk);
      if (chk > 0) {
        throw new Error("Someone already registered with this email");
      }
      return true
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person-gender").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select gender")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person-mobile", "Please enter valid mobile no")
      .isLength({ min: 1 })
      .isMobilePhone(),
    /* ----------------------------------------------------------------------------------- */
    body("person-dob").custom((value, { req }) => {
      if (value == '') {
        throw new Error("Date of birth is required")
      }

      const oldDt = new Date(value);
      const current = new Date();

      const diff = current.getFullYear() - oldDt.getFullYear();

      if (diff < 10) {
        throw new Error("Person should be at least 10 years old")
      }

      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person-doc-type").custom((value) => {
      if (value == undefined) {
        throw new Error("please select document type");
      }
      return true
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person-address-ln1")
      .isLength({ min: 1 }).withMessage("Please enter address")
      .matches("^[a-zA-Z0-9  -:]+$").withMessage("Please enter valid address"),
    /* ----------------------------------------------------------------------------------- */
    body("person-country").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select country")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person-state").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select state")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person-city", "Please enter valid city name").isLength({ min: 3, max: 20 }).isAlpha(),
    /* ----------------------------------------------------------------------------------- */
    body("person-zipcode", "Please enter valid zipcode").isLength({ min: 1, max: 6 }).isAlphanumeric(),
    /* ----------------------------------------------------------------------------------- */
    check("person-image").custom((value, { req }) => {
      return fileUplaodCustomLogic(req, "person-image", "Profile image reqired");
    }),
    /* ----------------------------------------------------------------------------------- */
    check("person-doc-front").custom((value, { req }) => {
      return fileUplaodCustomLogic(req, "person-doc-front", "Please upload ID document");
    }),

    /* ----------------------------------------------------------------------------------- */
    check("person-doc-back").custom((value, { req }) => {
      if (req.body["person-doc-type"] == "aadhar") {
        return fileUplaodCustomLogic(req, "person-doc-back", "Please upload ID document");
      }
      return true;
    })


  ];
}


const parentGuardianValidator = () => {
  return [

    /*******************************************************
      Parent/Guardian Form Validation
     *******************************************************/
    body("person2-fullname")
      .isLength({ min: 2 })
      .withMessage("Name is too small")
      .isLength({ max: 50 })
      .withMessage("Name is too big")
      .matches("^[a-zA-Z ]+$")
      .withMessage("Please enter valid Name"),

    /* ----------------------------------------------------------------------------------- */
    body("person2-email").isEmail().withMessage("Please enter valid email"),
    /* ----------------------------------------------------------------------------------- */
    body("person2-gender").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select gender")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person2-mobile", "Please enter valid mobile no")
      .isLength({ min: 1 })
      .isMobilePhone(),
    /* ----------------------------------------------------------------------------------- */
    body("person2-doc-type").custom((value) => {
      if (value == undefined) {
        throw new Error("please select document type");
      }
      return true
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person2-address-ln1")
      .isLength({ min: 1 }).withMessage("Please enter address")
      .matches("^[a-zA-Z0-9  -:]+$").withMessage("Please enter valid address"),
    /* ----------------------------------------------------------------------------------- */
    body("person2-country").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select country")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person2-state").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select state")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person2-city", "Please enter valid city name").isLength({ min: 3, max: 20 }).isAlpha(),
    /* ----------------------------------------------------------------------------------- */
    body("person2-zipcode", "Please enter valid zipcode").isLength({ min: 1, max: 6 }).isAlphanumeric(),
    /* ----------------------------------------------------------------------------------- */
    check("person2-doc-front").custom((value, { req }) => {
      return fileUplaodCustomLogic(req, "person2-doc-front", "Please upload ID document");
    }),

    /* ----------------------------------------------------------------------------------- */
    check("person2-doc-back").custom((value, { req }) => {
      if (req.body["person2-doc-type"] == "aadhar") {
        return fileUplaodCustomLogic(req, "person2-doc-back", "Please upload ID document");
      }
      return true;
    })
  ]
}

const paymentFormValidator = () => {
  return [
    body("payment-type").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select payment type")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("payment-amt").custom((value, { req }) => {
      const amt = parseInt(value);
      if (!Number.isInteger(amt)) {
        throw new Error("Please enter valid payment amount")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("payment-status").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select payment status")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("payment-currency").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select payment status")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("payment-ref-id").custom((value, { req }) => {
      if (req.body["payment-type"] == "online" && value.trim() == "") {
        throw new Error("Please enter transection referance id");
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("payment-comment").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please enter payment summary");
      }
      return true;
    }),
  ]
}

module.exports = {
  personalInfoValidator,
  parentGuardianValidator,
  paymentFormValidator
};
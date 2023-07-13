const { body } = require("express-validator");

const newPersonValidator = () => {
  return [
    body("person-fullname")
      .isLength({ min: 2 })
      .withMessage("Name is too small")
      .isLength({ max: 50 })
      .withMessage("Name is too big")
      .matches("^[a-zA-Z ]+$")
      .withMessage("Please enter valid Name"),

    /* ----------------------------------------------------------------------------------- */
    body("person-email").isEmail().withMessage("Please enter valid email"),
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
    body("person-dob").custom((value,{req})=>{
      if(value == ''){
        throw new Error("Date of birth is required")
      }

      const oldDt = new Date(value);
      const current = new Date();

      const diff = current.getFullYear() - oldDt.getFullYear();

      if(diff < 10){
        throw new Error("Person should be at least 10 years old")  
      }
      
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person-doc-type").custom((value)=>{
      if(value == undefined){
        throw new Error("please select document type");
      }
      return true
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person-address-ln1")
    .isLength({min:1}).withMessage("Please enter address")
    .matches("^[a-zA-Z0-9  -:]+$").withMessage("Please enter valid address"),
    /* ----------------------------------------------------------------------------------- */
    body("person-country").custom((value, { req }) => {
      if (value.trim() == "") {
        throw new Error("Please select country")
      }
      return true;
    }),
    /* ----------------------------------------------------------------------------------- */
    body("person-city","Please enter valid city name").isLength({min:3, max:20}).isAlpha(),
    /* ----------------------------------------------------------------------------------- */
    body("person-zipcode","Please enter valid zipcode").isLength({min:1, max:6}).isAlphanumeric()

  ]
}

module.exports = newPersonValidator;
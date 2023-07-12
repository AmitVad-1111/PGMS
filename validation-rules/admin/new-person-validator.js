const { body } = require("express-validator");

const newPersonValidator = () => {
  return [
    body("person-fullname")
      .isLength({ min: 2 })
      .withMessage("Name is too small")
      .isLength({ max: 50 })
      .withMessage("Name is too big")
      .matches("^[a-zA-Z ]+$")
      .withMessage("Please enter valid Name")
    /* ----------------------------------------------------------------------------------- */
  ]
}

module.exports = newPersonValidator;
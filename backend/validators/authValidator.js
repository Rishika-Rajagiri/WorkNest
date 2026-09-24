const {body} = require("express-validator");

const registerValidation=[
  body("name")
  .trim()
  .notEmpty()
  .withMessage("Name is required"),

  body("email")
  .trim()
  .isEmail()
  .withMessage("please provide a valid email"),

  body("password")
  .isLength({min:6})
  .withMessage("password must be atleast 6 characters"),

  body("role")
  .isIn(["client","freelancer"])
  .withMessage("Role must be client or freelancer")
];

module.exports={registerValidation}
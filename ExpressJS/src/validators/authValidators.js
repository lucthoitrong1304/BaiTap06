const { body } = require("express-validator");
const validate = require("../middleware/validate");

const validateRegister = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Tên không được để trống"),
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu phải có ít nhất 8 ký tự")
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).{8,}$/)
    .withMessage(
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 ký tự đặc biệt",
    ),
  validate,
];

// Hàm validation cho Login
const validateLogin = [
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu phải có ít nhất 8 ký tự"),
  validate,
];

module.exports = { validateRegister, validateLogin };

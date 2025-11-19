const {
  createUserService,
  loginService,
  getUserService,
  forgotPasswordService,
  resetPasswordService,
} = require("../services/userService");

const { validateRegister, validateLogin } = require("../validators/authValidators");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const data = await createUserService(name, email, password);
  return res.status(200).json(data);
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = await loginService(email, password);
  return res.status(200).json(data);
};

const getUser = async (req, res) => {
  const data = await getUserService();
  return res.status(200).json(data);
};

const getAccount = async (req, res) => {
  return res.status(200).json({ EC: 0, EM: "OK", DT: req.user });
};

const handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(200).json({ EC: 1, EM: "Thiếu email" });
  }
  const data = await forgotPasswordService(email);
  return res.status(200).json(data);
};

const handleResetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(200).json({ EC: 1, EM: "Thiếu token hoặc mật khẩu mới" });
  }
  const data = await resetPasswordService(token, password);
  return res.status(200).json(data);
};

module.exports = {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  handleForgotPassword,
  handleResetPassword,
  validateRegister,
  validateLogin,
};

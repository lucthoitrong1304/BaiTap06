const express = require("express");
const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  handleForgotPassword,
  handleResetPassword,
  validateRegister,
  validateLogin,
} = require("../controllers/userController");

const { getChatHistories, getChatDetail } = require("../controllers/chatController");

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const delay = require("../middleware/delay");
const apiLimiter = require("../middleware/rateLimiter");

const routerAPI = express.Router();

routerAPI.post("/register", apiLimiter, ...validateRegister, createUser);
routerAPI.post("/login", apiLimiter, ...validateLogin, handleLogin);
routerAPI.post("/forgot-password", apiLimiter, handleForgotPassword);
routerAPI.post("/reset-password", apiLimiter, handleResetPassword);

routerAPI.get("/", (req, res) => {
  return res.status(200).json("Lục Thới Trọng - 22110254");
});

routerAPI.use(auth);

routerAPI.get("/user", authorize("Admin"), getUser);
routerAPI.get("/account", authorize(["Admin", "User"]), delay, getAccount);


// API lịch sử chat.
routerAPI.get(
  "/chat-histories",
  authorize(["Admin", "User"]), // Chỉ cho phép Admin và User truy cập
  getChatHistories
);
routerAPI.get(
  "/chat-histories/:chatHistoryId",
  authorize(["Admin", "User"]), // Chỉ cho phép Admin và User truy cập
  getChatDetail
);

module.exports = routerAPI;

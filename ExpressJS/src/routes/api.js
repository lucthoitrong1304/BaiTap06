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

const {
  getChatHistories,
  getChatDetail,
  createNewChat,
} = require("../controllers/chatController");

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
// API lấy danh sách (kèm Search & Filter)
routerAPI.get(
  "/chat-histories",
  authorize(["Admin", "User"]),
  getChatHistories,
);

// 2. UPDATE: Route tạo mới đoạn chat (Insert MySQL + Sync Elasticsearch)
routerAPI.post(
  "/chat-histories",
  authorize(["Admin", "User"]), // User đăng nhập mới được tạo
  createNewChat,
);

// API lấy chi tiết
routerAPI.get(
  "/chat-histories/:chatHistoryId",
  authorize(["Admin", "User"]),
  getChatDetail,
);

module.exports = routerAPI;

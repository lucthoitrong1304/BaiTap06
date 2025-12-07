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

const { getProducts } = require("../controllers/productController");
const { getCategories } = require("../controllers/categoryController");

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const delay = require("../middleware/delay");
const { authLimiter, publicLimiter } = require("../middleware/rateLimiter");

const routerAPI = express.Router();

routerAPI.post("/register", authLimiter, ...validateRegister, createUser);
routerAPI.post("/login", authLimiter, ...validateLogin, handleLogin);
routerAPI.post("/forgot-password", authLimiter, handleForgotPassword);
routerAPI.post("/reset-password", authLimiter, handleResetPassword);
routerAPI.get("/products", publicLimiter, getProducts);
routerAPI.get("/categories", publicLimiter, getCategories);

routerAPI.get("/", (req, res) => {
  return res.status(200).json("Lục Thới Trọng - 22110254");
});

routerAPI.use(auth);

routerAPI.get("/user", authorize(["Admin"]), getUser);
routerAPI.get("/account", authorize(["Admin", "User"]), delay, getAccount);

module.exports = routerAPI;

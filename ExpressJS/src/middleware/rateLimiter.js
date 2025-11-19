// middleware/rateLimiter.js

const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // Giới hạn 5 request mỗi IP trong 1 phút
  standardHeaders: true, // Thêm header RateLimit
  legacyHeaders: false, // Tắt header X-RateLimit
  statusCode: 429, // Trạng thái HTTP 429 Too Many Requests
  message: async (req, res) => {
    return res.status(429).json({
      EC: 4,
      EM: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 1 phút.",
      DT: ""
    });
  }
});

module.exports = apiLimiter;
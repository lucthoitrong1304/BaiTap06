const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
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

// 2. Limiter thoáng cho Public (Xem sản phẩm, danh mục...)
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 60, // Cho phép 60 request/phút (trung bình 1 giây 1 cái -> thoải mái lướt)
  message: {
    EC: 4,
    EM: "Bạn gửi quá nhiều yêu cầu, vui lòng chậm lại.",
    DT: ""
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  publicLimiter
};
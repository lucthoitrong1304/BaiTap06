const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // 1. Kiểm tra xem người dùng đã được xác thực chưa (req.user phải tồn tại)
    //    Và kiểm tra xem vai trò của họ có nằm trong danh sách roles được phép không.

    // Kiểm tra logic: Nếu role của user KHÔNG có trong mảng roles cho phép
    if (req.user && roles.length > 0 && !roles.includes(req.user.role)) {
      // 2. Nếu không có quyền, trả về lỗi 403 Forbidden
      return res.status(403).json({
        EC: 5,
        EM: "Bạn không có quyền truy cập tài nguyên này.",
        DT: "",
      });
    }

    // 3. Nếu có quyền hoặc danh sách roles rỗng (cho phép mọi user đã xác thực)
    next();
  };
};

module.exports = authorize;

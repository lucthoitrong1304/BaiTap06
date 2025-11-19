require("dotenv").config();
const jwt = require("jsonwebtoken");

const white_lists = ["/", "/register", "/login"];

const auth = (req, res, next) => {
  try {
    let isWhiteList = false;
    for (let i = 0; i < white_lists.length; i++) {
      if (req.originalUrl === `/v1/api${white_lists[i]}`) {
        isWhiteList = true;
        break;
      }
    }

    if (isWhiteList) {
      return next();
    }

    if (req?.headers?.authorization?.split(" ")?.[1]) {
      const token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      };

      return next();
    } else {
      return res.status(401).json({
        EC: 1,
        EM: "Bạn chưa truyền Access Token ở header",
        DT: "",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      EC: 2,
      EM: "Token bị hết hạn hoặc không hợp lệ",
      DT: "",
    });
  }
};

module.exports = auth;

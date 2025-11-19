require("dotenv").config();
const User = require("../models/user"); // Import model Sequelize
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createTransport } = require("nodemailer");
const { Op } = require("sequelize");
const crypto = require("crypto");

const saltRounds = 10;

const createUserService = async (name, email, password) => {
  try {
    const user = await User.findOne({
      where: { email: email },
    });
    if (user) {
      return { EC: 1, EM: "Email đã tồn tại" };
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);

    let result = await User.create({
      name: name,
      email: email,
      password: hashPassword,
      role: "User",
    });

    return {
      EC: 0,
      EM: "Tạo user thành công",
      DT: result.get({ plain: true }),
    };
  } catch (error) {
    console.log(error);
    return { EC: -1, EM: "Lỗi server", DT: error };
  }
};

const loginService = async (emaill, password) => {
  try {
    const user = await User.findOne({
      where: { email: emaill },
    });

    if (user) {
      const isMatchPassword = await bcrypt.compare(password, user.password);

      if (!isMatchPassword) {
        return {
          EC: 2,
          EM: "Email/Password không hợp lệ",
        };
      } else {
        const payload = {
          email: user.email,
          name: user.name,
          role: user.role,
        };

        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE || "1h",
        });

        return {
          EC: 0,
          EM: "Đăng nhập thành công",
          DT: {
            // Data
            access_token,
            user: {
              email: user.email,
              name: user.name,
              role: user.role,
            },
          },
        };
      }
    } else {
      return {
        EC: 1,
        EM: "Email/Password không hợp lệ",
      };
    }
  } catch (error) {
    console.log(error);
    return { EC: -1, EM: "Lỗi server", DT: error };
  }
};

const getUserService = async () => {
  try {
    let result = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    return { EC: 0, EM: "OK", DT: result };
  } catch (error) {
    console.log(error);
    return { EC: -1, EM: "Lỗi server", DT: error };
  }
};

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const forgotPasswordService = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return { EC: 0, EM: "Nếu email tồn tại, một link reset đã được gửi." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu",
      html: `<p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.</p>
                   <p>Vui lòng click vào link sau để đặt lại mật khẩu (link có hiệu lực trong 10 phút):</p>
                   <a href="${resetURL}">${resetURL}</a>
                   <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return { EC: 0, EM: "Một link reset đã được gửi tới email của bạn." };
  } catch (error) {
    console.log(error);
    if (user) {
      user.resetToken = null;
      user.resetTokenExpires = null;
      await user.save();
    }
    return { EC: -1, EM: "Lỗi server khi gửi mail", DT: error };
  }
};

const resetPasswordService = async (token, newPassword) => {
  try {
    const hashToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        resetToken: hashToken,
        resetTokenExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return { EC: 1, EM: "Token không hợp lệ hoặc đã hết hạn." };
    }

    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetToken = null;
    user.resetTokenExpires = null;

    await user.save();

    return { EC: 0, EM: "Cập nhật mật khẩu thành công." };
  } catch (error) {
    console.log(error);
    return { EC: -1, EM: "Lỗi server", DT: error };
  }
};

module.exports = {
  createUserService,
  loginService,
  getUserService,
  forgotPasswordService,
  resetPasswordService,
};

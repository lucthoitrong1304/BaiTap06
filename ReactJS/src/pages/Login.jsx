import { useState, useContext } from "react";
import { loginUser } from "../services/api";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx"; // 1. Import Context

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // 2. Lấy hàm login từ kho

  const [valueLogin, setValueLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valueLogin || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser(valueLogin, password);
      const data = response.data;

      if (data && data.EC === 0) {
        login(data.DT.user, data.DT.access_token);

        toast.success(data.EM);
        navigate("/");
      } else {
        toast.error(data.EM);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Đăng Nhập
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="text"
              value={valueLogin}
              onChange={(e) => setValueLogin(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6 flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

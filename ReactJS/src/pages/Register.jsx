import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { registerUser } from "../services/api.js";
import { toast } from "react-hot-toast";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    // Bật trạng thái loading
    setIsLoading(true);

    try {
      const response = await registerUser(data.name, data.email, data.password);
      const apiData = response.data;

      if (apiData.EC === 0) {
        toast.success("Đăng ký tài khoản thành công!");
      } else if (apiData.EC === 1) {
        toast.error(apiData.EM); // Hiển thị "Email đã tồn tại"
      } else if (apiData.EC === -1) {
        toast.error("Lỗi hệ thống, vui lòng thử lại sau.");
        console.error("Lỗi server:", apiData.DT);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API đăng ký:", error);
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Đăng Ký Tài Khoản
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Trường Họ và Tên */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Họ và Tên
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: true })}
              aria-invalid={errors.name ? "true" : "false"}
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name?.type === "required" && (
              <span className="mt-1 block text-sm font-semibold text-red-600">
                Vui lòng nhập Họ và Tên.
              </span>
            )}
          </div>

          {/* Trường Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Vui lòng nhập Email.",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Email không hợp lệ.",
                },
              })}
              aria-invalid={errors.email ? "true" : "false"}
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <span className="mt-1 block text-sm font-semibold text-red-600">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Trường Mật khẩu */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Vui lòng nhập Mật khẩu.",
                minLength: {
                  value: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự.",
                },
                // Quy tắc Regex mới
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).{8,}$/,
                  message:
                    "Mật khẩu phải có ít nhất 8 ký tự, bao gồm: 1 chữ hoa, 1 chữ thường và 1 ký tự đặc biệt (!@#$%^&*).",
                },
              })}
              aria-invalid={errors.password ? "true" : "false"}
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.password && (
              <span className="mt-1 block text-sm font-semibold text-red-600">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Nút Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer justify-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Đăng Ký"}
            </button>
          </div>
        </form>

        {/* Liên kết Đăng nhập */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

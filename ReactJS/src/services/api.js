import axios from "axios";

const API_BASE_URL = "http://localhost:8080/v1/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Gọi API đăng nhập
 * @param {string} email - Email hoặc tên đăng nhập
 * @param {string} password - Mật khẩu
 */
export const loginUser = (email, password) => {
  return apiClient.post("/login", { email, password });
};

/**
 * Gọi API đăng ký
 * @param {string} name
 * @param {string} email
 * @param {string} password
 */
export const registerUser = (name, email, password) => {
  return apiClient.post("/register", { name, email, password });
};

/**
 * Gọi API quên mật khẩu
 * @param {string} email
 */
export const forgotPassword = (email) => {
  return apiClient.post("/forgot-password", { email });
};

/**
 * Gọi API reset mật khẩu
 * @param {string} token
 * @param {string} password
 */
export const resetPassword = (token, password) => {
  // Tên thuộc tính phải khớp với req.body bên backend
  return apiClient.post("/reset-password", { token, password });
};

/**
 * Lấy danh sách danh mục
 */
export const getCategories = () => {
  return apiClient.get("/categories");
};

/**
 * Lấy danh sách sản phẩm (có phân trang & lọc nâng cao)
 * params là object chứa: { page, limit, categoryId, name, minPrice, maxPrice, sort }
 */
export const getProducts = (params) => {
  return apiClient.get("/products", { params });
};
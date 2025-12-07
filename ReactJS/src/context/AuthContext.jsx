import { createContext, useState, useEffect } from "react";

// 1. Khởi tạo giá trị mặc định
export const AuthContext = createContext({
  user: null, // Mặc định chưa có user
  login: (userData, token) => {}, // Hàm placeholder
  logout: () => {}, // Hàm placeholder
});

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Khi tải trang, kiểm tra localStorage để giữ đăng nhập
  useEffect(() => {
    const storedUser = localStorage.getItem("user_info");
    const token = localStorage.getItem("access_token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user_info", JSON.stringify(userData));
    localStorage.setItem("access_token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user_info");
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

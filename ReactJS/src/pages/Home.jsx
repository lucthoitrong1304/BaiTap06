import { useEffect, useState } from "react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { getCategories, getProducts } from "../services/api";
import { toast } from "react-hot-toast";

const Home = () => {
  // --- Data States ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // --- Pagination States ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // --- Filter States ---
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState(""); // Từ khóa tìm kiếm
  const [sortOrder, setSortOrder] = useState("createdAt-desc"); // Mặc định mới nhất
  const [priceRange, setPriceRange] = useState({ min: "", max: "" }); // Khoảng giá

  // Biến tạm để nhập liệu ô tìm kiếm (tránh call API mỗi lần gõ phím)
  const [tempSearch, setTempSearch] = useState("");

  // 1. Fetch Categories (Chạy 1 lần đầu)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        if (res.data && res.data.EC === 0) {
          setCategories(res.data.DT);
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Products (Chạy khi bất kỳ điều kiện lọc nào thay đổi)
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Gom tất cả params lại để gửi đi
        const params = {
          page: page,
          limit: 8,
          categoryId: selectedCategory,
          name: searchText, // Backend cần key là 'name'
          sort: sortOrder, // Backend cần key là 'sort'
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
        };

        const res = await getProducts(params);
        if (res.data && res.data.EC === 0) {
          setProducts(res.data.DT.products);
          setTotalPages(res.data.DT.totalPages);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        toast.error("Không tải được sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce nhỏ hoặc gọi trực tiếp (ở đây gọi trực tiếp khi dependency thay đổi)
    fetchProducts();
  }, [page, selectedCategory, searchText, sortOrder, priceRange]); // Dependency Array quan trọng

  // --- Handlers ---

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchText(tempSearch); // Cập nhật state chính để trigger useEffect
    setPage(1);
  };

  const handleApplyPriceFilter = () => {
    // Clone state cũ để ép React render lại nếu cần, hoặc giữ nguyên logic object
    setPriceRange({ ...priceRange });
    setPage(1);
  };

  const handleClearFilter = () => {
    setSelectedCategory(null);
    setSearchText("");
    setTempSearch("");
    setSortOrder("createdAt-desc");
    setPriceRange({ min: "", max: "" });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* ================= SIDEBAR ================= */}
          <aside className="w-full flex-shrink-0 space-y-6 lg:w-64">
            {/* 1. Danh mục */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
              {/* Tiêu đề */}
              <div className="border-b border-gray-100 bg-gray-50/50 p-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                  >
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                  Danh Mục
                </h2>
              </div>

              <ul className="space-y-1 p-3">
                {/* Nút Tất cả sản phẩm */}
                <li>
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`group flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      selectedCategory === null
                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100" // Style khi đang chọn
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600" // Style mặc định
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {/* Dấu chấm tròn nhỏ trang trí */}
                      <span
                        className={`h-2 w-2 rounded-full transition-all ${selectedCategory === null ? "scale-125 bg-blue-600" : "bg-gray-300 group-hover:bg-blue-400"}`}
                      ></span>
                      Tất cả sản phẩm
                    </span>
                  </button>
                </li>

                {/* List Categories từ API */}
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`group flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        selectedCategory === cat.id
                          ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full transition-all ${selectedCategory === cat.id ? "scale-125 bg-blue-600" : "bg-gray-300 group-hover:bg-blue-400"}`}
                        ></span>
                        {cat.name}
                      </span>

                      {/* Mũi tên nhỏ bên phải chỉ hiện khi hover hoặc active */}
                      <svg
                        className={`h-4 w-4 transition-all duration-200 ${selectedCategory === cat.id ? "text-blue-600 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Lọc Giá (Mới) */}
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Khoảng Giá
              </h2>
              <div className="flex flex-col gap-3">
                <input
                  type="number"
                  placeholder="Thấp nhất (VNĐ)"
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Cao nhất (VNĐ)"
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                />
                <button
                  onClick={handleApplyPriceFilter}
                  className="mt-2 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Nút Xóa bộ lọc */}
            <button
              onClick={handleClearFilter}
              className="w-full rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Xóa tất cả bộ lọc
            </button>
          </aside>

          {/* ================= MAIN CONTENT ================= */}
          <div className="flex-1">
            {/* --- TOP BAR: Search & Sort --- */}
            <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              {/* Search Box */}
              <form
                onSubmit={handleSearch}
                className="relative w-full sm:max-w-xs"
              >
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full rounded-md border border-gray-300 py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </button>
              </form>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sắp xếp:</span>
                <select
                  className="rounded-md border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm focus:border-blue-500 focus:outline-none"
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="createdAt-desc">Mới nhất</option>
                  <option value="createdAt-asc">Cũ nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên: A-Z</option>
                </select>
              </div>
            </div>

            {/* --- PRODUCTS GRID --- */}
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg bg-white p-10 text-center shadow-sm">
                <svg
                  className="mb-4 h-16 w-16 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500">
                  Không tìm thấy sản phẩm nào phù hợp.
                </p>
                <button
                  onClick={handleClearFilter}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="flex items-center px-4 text-sm font-medium text-gray-700">
                  Trang {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

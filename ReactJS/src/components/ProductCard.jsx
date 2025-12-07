const ProductCard = ({ product }) => {
  // Format tiền tệ Việt Nam
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Ảnh sản phẩm */}
      <div className="aspect-square w-full overflow-hidden bg-gray-200">
        <img
          src={product.image || "https://via.placeholder.com/300"} // Placeholder nếu ko có ảnh
          alt={product.name}
          className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* Thông tin */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          className="mb-2 line-clamp-2 text-sm font-medium text-gray-900"
          title={product.name}
        >
          {product.name}
        </h3>
        {product.category && (
          <p className="mb-2 text-xs text-gray-500">{product.category.name}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(product.price)}
          </span>
          <button className="rounded-md bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-600 hover:text-white">
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
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

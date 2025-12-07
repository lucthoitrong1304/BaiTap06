const Product = require("../models/product");
const Category = require("../models/category");
const { Op } = require("sequelize");

/**
 * Lấy danh sách sản phẩm với bộ lọc nâng cao (Search, Filter, Sort, Pagination)
 * @param {object} queryString - Object chứa toàn bộ tham số từ URL (req.query)
 */
const getProductsService = async (queryString) => {
  try {
    // 1. Phân trang
    const page = parseInt(queryString.page) || 1;
    const limit = parseInt(queryString.limit) || 10;
    const offset = (page - 1) * limit;

    const { name, categoryId, minPrice, maxPrice, sort } = queryString;

    // 2. Xây dựng mệnh đề WHERE (Bộ lọc điều kiện)
    let whereClause = {};

    // -- Tìm kiếm theo tên (Fuzzy Search - Tương đối)
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }

    // -- Lọc theo danh mục
    if (categoryId) {
      whereClause.idCategory = categoryId;
    }

    // -- Lọc theo khoảng giá
    if (minPrice && maxPrice) {
      whereClause.price = { [Op.between]: [minPrice, maxPrice] };
    } else if (minPrice) {
      whereClause.price = { [Op.gte]: minPrice }; // >= minPrice
    } else if (maxPrice) {
      whereClause.price = { [Op.lte]: maxPrice }; // <= maxPrice
    }

    // 3. Xây dựng mệnh đề ORDER (Sắp xếp)
    // Mặc định: Mới nhất lên đầu
    let orderClause = [['createdAt', 'DESC']];

    if (sort) {
      // Ví dụ client gửi: ?sort=price-asc hoặc ?sort=price-desc
      const [field, type] = sort.split('-');
      // Kiểm tra sơ bộ để tránh lỗi query
      if (field === 'price' || field === 'name' || field === 'createdAt') {
        orderClause = [[field, type.toUpperCase()]]; // type phải là 'ASC' hoặc 'DESC'
      }
    }

    // 4. Gọi DB
    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: orderClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    return {
      EC: 0,
      EM: "Lấy danh sách sản phẩm thành công",
      DT: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products: rows,
      },
    };
  } catch (error) {
    console.log("Lỗi service getProducts:", error);
    return {
      EC: -1,
      EM: "Lỗi server nội bộ",
      DT: [],
    };
  }
};

module.exports = {
  getProductsService,
};

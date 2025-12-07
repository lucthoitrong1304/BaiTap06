const Category = require("../models/category");

const getAllCategoriesService = async () => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return {
      EC: 0,
      EM: "Lấy danh sách danh mục thành công",
      DT: categories,
    };
  } catch (error) {
    console.log("Lỗi service getAllCategories:", error);
    return {
      EC: -1,
      EM: "Lỗi server nội bộ",
      DT: [],
    };
  }
};

module.exports = {
  getAllCategoriesService,
};

const { getAllCategoriesService } = require("../services/categoryService");

const getCategories = async (req, res) => {
  try {
    const data = await getAllCategoriesService();
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi controller category",
      DT: "",
    });
  }
};

module.exports = {
  getCategories,
};

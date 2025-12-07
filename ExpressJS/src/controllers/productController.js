const { getProductsService } = require("../services/productService");

const getProducts = async (req, res) => {
  try {
    // Truyền toàn bộ req.query (chứa page, limit, name, sort, minPrice...) sang Service
    const data = await getProductsService(req.query);

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi controller product",
      DT: "",
    });
  }
};

module.exports = {
  getProducts,
};

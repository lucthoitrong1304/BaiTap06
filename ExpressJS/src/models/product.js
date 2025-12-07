const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Category = require("./category");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    des: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idCategory: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      }
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

Category.hasMany(Product, { foreignKey: 'idCategory', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'idCategory', as: 'category' });

module.exports = Product;
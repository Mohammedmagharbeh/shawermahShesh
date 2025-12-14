const user = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const products = require("../models/products");
const dotenv = require("dotenv");
const Category = require("../models/Category");
dotenv.config();

exports.getuser = async (req, res) => {
  try {
    const users = await user.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.userLogin = async (req, res) => {
  const { phone } = req.body;
  try {
    const userLog = await user.findOne({ phone });
    if (!userLog) {
      return res.status(400).json({ message: "user not found" });
    }
    const isMatch = await bcrypt.compare(password, userLog.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong information" });
    }
    const token = jwt.sign({ userId: userLog._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({ message: "token found", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const productsCache = new NodeCache({ stdTTL: 60 });

exports.getAllProducts = async (req, res) => {
  try {
    const { category, isSpicy, hasTypeChoices, hasProteinChoices } = req.query;

    // Build a unique key based on the query parameters
    // const cacheKey = JSON.stringify({
    //   category,
    //   isSpicy,
    //   hasTypeChoices,
    //   hasProteinChoices,
    // });

    // Check if cached response exists
    // const cachedData = productsCache.get(cacheKey);
    // if (cachedData) {
    //   return res.status(200).json({
    //     message: "Products fetched successfully (from cache)",
    //     data: cachedData,
    //   });
    // }

    const query = {};

    // Handle category
    if (category) {
      const categoryDoc = await Category.findById(category).lean();
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    // Boolean filters
    if (isSpicy !== undefined) query.isSpicy = isSpicy === "true";
    if (hasTypeChoices !== undefined)
      query.hasTypeChoices = hasTypeChoices === "true";
    if (hasProteinChoices !== undefined)
      query.hasProteinChoices = hasProteinChoices === "true";

    // Query DB
    const productsList = await products
      .find(query)
      .populate("category")
      .sort({ position: 1 })
      .lean();

    // Store in cache
    // productsCache.set(cacheKey, productsList);

    res.status(200).json({
      message: "Products fetched successfully",
      data: productsList,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await products.findById(id).populate("category").lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: error.message });
  }
};

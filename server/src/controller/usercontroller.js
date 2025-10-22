const user = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CATEGORIES } = require("../constants");
const products = require("../models/products");
const dotenv = require("dotenv");
dotenv.config();

// get endpoint
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
    const token = jwt.sign({ userId: userLog._id }, "goback", {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "token found", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verify = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

exports.home = async (req, res) => {
  const getuser = req.user;
  try {
    const checkuser = await user.findById(getuser);
    res.status(200).json({ user: checkuser, role: checkuser.role }); // إضافة role في الاستجابة
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;

    // Validate category if provided
    if (category) {
      const isValidCategory = CATEGORIES.some((c) => c.en === category);
      if (!isValidCategory) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    // Build query
    const query = category ? { category } : {};

    // Fetch products
    const result = await products.find(query).sort({ _id: -1 }); // newest first

    res.status(200).json({
      message: "Products fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await products.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product fetched successfully", data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

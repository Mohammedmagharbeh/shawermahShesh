// controllers/categoryController.js
const Category = require("../models/Category");

// جلب كل الـ categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ data: categories, message: "Categories fetched Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) return res.status(400).json({ message: "Invalid Category" });

    return res
      .status(200)
      .json({ data: category, message: "category Fetched Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Something went wrong" });
  }
};

// إضافة category جديدة
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    const saved = await category.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// تعديل category
const updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// حذف category
const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCategory,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};

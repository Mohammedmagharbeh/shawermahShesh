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
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};

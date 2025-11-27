// controllers/categoryController.js
const categoryModel = require("../models/Category");

// جلب كل الـ categories
const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find().sort({ position: 1 }).lean();
    res.json({ data: categories, message: "Categories fetched Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categoryModel.findById(id);
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
    const category = new categoryModel({ name });
    const saved = await category.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// تعديل category
const updateCategory = async (req, res) => {
  try {
    const updated = await categoryModel.findByIdAndUpdate(
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
    await categoryModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderedIds" });
    }

    // Update position for each product
    const updates = orderedIds.map((id, index) =>
      categoryModel.findByIdAndUpdate(id, { position: index }, { new: true })
    );

    await Promise.all(updates);

    res.json({ success: true, message: "Categories reordered successfully" });
  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCategory,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};

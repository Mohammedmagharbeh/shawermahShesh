// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController.js");

// جلب كل الـ categories
router.get("/", getCategories);

// إضافة category جديدة
router.post("/", addCategory);

// تعديل category
router.put("/:id", updateCategory);

// حذف category
router.delete("/:id", deleteCategory);

module.exports = router;

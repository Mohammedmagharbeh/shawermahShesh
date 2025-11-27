// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  reorderCategories,
} = require("../controller/categoryController.js");

// جلب كل الـ categories
router.get("/", getCategories);

router.get("/:id", getCategory);

// إضافة category جديدة
router.post("/", addCategory);

router.put("/reorder", reorderCategories);

// تعديل category
router.put("/:id", updateCategory);

// حذف category
router.delete("/:id", deleteCategory);

module.exports = router;

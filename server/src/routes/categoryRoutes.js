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
const validateJWT = require("../middlewares/validateJWT");
const requireRole = require("../middlewares/requireRole");

// جلب كل الـ categories
router.get("/", getCategories);

router.get("/:id", getCategory);

// إضافة category جديدة
router.post("/", validateJWT, requireRole("admin"), addCategory);

router.put("/reorder", validateJWT, requireRole("admin"), reorderCategories);

// تعديل category
router.put("/:id", validateJWT, requireRole("admin"), updateCategory);

// حذف category
router.delete("/:id", validateJWT, requireRole("admin"), deleteCategory);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const {
//   getAllPromoCodes,
//   createPromoCode,
//   updatePromoCode,
//   deletePromoCode,
//   validatePromoCode,
// } = require("../controller/promoCodeController");

// // عدّل middleware الحماية حسب يلي عندك بمشروعك (مثلاً verifyAdmin أو protectAdmin)
// // const { verifyAdmin } = require("../middleware/authMiddleware");

// // Public - للزبون
// router.get("/validate", validatePromoCode);

// // Admin routes
// router.get("/", getAllPromoCodes);
// router.post("/", createPromoCode);
// router.patch("/:id", updatePromoCode);
// router.delete("/:id", deletePromoCode);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
} = require("../controller/promoCodeController");
const verifyUser = require("../middlewares/userverify");

// عدّل middleware حماية الأدمن حسب يلي عندك بمشروعك (verifyAdmin مثلاً)
// const verifyAdmin = require("../middleware/verifyAdmin");

// ✅ Customer — لازم يكون مسجل دخول عشان نعرف مين هو ونحسب استخدامه
router.get("/validate", verifyUser, validatePromoCode);

// Admin routes (ضيف verifyAdmin قبل كل وحدة منهم لو عندك)
router.get("/", getAllPromoCodes);
router.post("/", createPromoCode);
router.patch("/:id", updatePromoCode);
router.delete("/:id", deletePromoCode);

module.exports = router;

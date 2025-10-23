const express = require("express");
const {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
} = require("../controller/slideController"); // لاحظ controller مفرد

const router = express.Router();

router.get("/", getSlides);
router.post("/", createSlide);
router.put("/:id", updateSlide);
router.delete("/:id", deleteSlide);

module.exports = router;

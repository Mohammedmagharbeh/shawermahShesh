const express = require("express");
const validateJWT = require("../middlewares/validateJWT");
const {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
} = require("../controller/slideController"); // لاحظ controller مفرد

const router = express.Router();

router.get("/", getSlides);
router.post("/", validateJWT, createSlide);
router.put("/:id", validateJWT, updateSlide);
router.delete("/:id", validateJWT, deleteSlide);

module.exports = router;

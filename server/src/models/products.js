const mongoose = require("mongoose");
const { CATEGORIES } = require("../constants");

const productSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  image: { type: String, required: false, default: "" },
  category: { type: String, enum: CATEGORIES, required: true },
  description: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  isSpicy: { type: Boolean, default: false },
});

module.exports = mongoose.model("Product", productSchema);

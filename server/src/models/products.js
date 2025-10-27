const mongoose = require("mongoose");
const { CATEGORIES } = require("../constants");

const productSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  image: { type: String, default: "" },
  category: {
    type: String,
    enum: CATEGORIES.map((c) => c.en),
    required: true,
  },
  description: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  isSpicy: { type: Boolean, default: false },

  // 🧾 Base price (for products with no variations)
  basePrice: { type: Number, required: true, min: 0 },

  // 🍗 Optional price variations
  hasTypeChoices: { type: Boolean, default: false }, // true if it has sandwich/meal types
  hasProteinChoices: { type: Boolean, default: false }, // true if it has chicken/meat options

  // Nested optional price structure
  prices: {
    chicken: {
      sandwich: { type: Number },
      meal: { type: Number },
    },
    meat: {
      sandwich: { type: Number },
      meal: { type: Number },
    },
  },

  discount: { type: Number, default: 0, min: 0, max: 100 },
});

module.exports = mongoose.model("Product", productSchema);

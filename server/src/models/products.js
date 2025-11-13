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
    ar: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },

  isSpicy: { type: Boolean, default: false },

  // 🧾 Base price (for products without variations)
  basePrice: { type: Number, required: true, min: 0 },

  // 🍗 Variation flags
  hasTypeChoices: { type: Boolean, default: false }, // sandwich / meal
  hasProteinChoices: { type: Boolean, default: false }, // chicken / meat

  prices: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  discount: { type: Number, default: 0, min: 0, max: 100 },

  additions: [
    {
      name: {
        ar: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
      },
      price: { type: Number, required: true, min: 0 },
    },
  ],
  inStock: { type: Boolean, default: true },
});

module.exports = mongoose.model("Product", productSchema);

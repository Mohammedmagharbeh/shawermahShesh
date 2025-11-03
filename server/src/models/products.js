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

  // 🧾 Base price (for products without variations)
  basePrice: { type: Number, required: true, min: 0 },

  // 🍗 Variation flags
  hasTypeChoices: { type: Boolean, default: false }, // sandwich / meal
  hasProteinChoices: { type: Boolean, default: false }, // chicken / meat

  // 🧮 Variation prices
  prices: {
    chicken: {
      sandwich: { type: Number, min: 0 },
      meal: { type: Number, min: 0 },
    },
    meat: {
      sandwich: { type: Number, min: 0 },
      meal: { type: Number, min: 0 },
    },
  },

  discount: { type: Number, default: 0, min: 0, max: 100 },

  // 🧂 Additions specific to this product
  // additions: [
  //   {
  //     name: { type: String, required: true },
  //     price: { type: Number, required: true, min: 0 },
  //   },
  // ],
  additions: [
  {
    name: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    price: { type: Number, required: true, min: 0 },
  },
],

});

module.exports = mongoose.model("Product", productSchema);

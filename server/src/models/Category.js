// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  position: { type: Number, default: 0 },
});

module.exports = mongoose.model("Category", categorySchema);

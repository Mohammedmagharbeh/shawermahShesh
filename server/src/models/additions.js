const mongoose = require("mongoose");

const additionsSchema = new mongoose.Schema({
  name: {
    ar: { type: String, trim: true, required: true },
    en: { type: String, trim: true, required: true },
  },
  price: { type: Number, required: true, min: 0 },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});
const additions = mongoose.model("additions", additionsSchema);
module.exports = additions;

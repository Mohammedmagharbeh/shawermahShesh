const mongoose = require("mongoose");

const additionsSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
});
const additions = mongoose.model("additions", additionsSchema);
module.exports = additions;


const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true }
  },
  subtitle: {
    ar: { type: String },
    en: { type: String }
  },
  relatedTo: { type: String },
});

const Slide = mongoose.model("Slide", slideSchema);

module.exports = Slide;
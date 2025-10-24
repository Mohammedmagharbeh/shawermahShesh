const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  relatedTo: { type: String },
});

const Slide = mongoose.model("Slide", slideSchema);

module.exports = Slide;

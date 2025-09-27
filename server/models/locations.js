const mongoose = require("mongoose");

const locationsSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  SECNO: { type: Number, required: true, unique: true },
  deliveryCost: { type: Number, required: true },
});
const locations = mongoose.model("locations", locationsSchema);
module.exports = locations;

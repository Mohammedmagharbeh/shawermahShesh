const mongoose = require("mongoose");

const deliverySettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
    },
    // Configurable maximum orders that can be assigned to the same rider (Cap: max 5)
    maxOrdersPerRider: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("deliverySettings", deliverySettingSchema);

const mongoose = require("mongoose");

const pushTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ["ios", "android"] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("pushtokens", pushTokenSchema);
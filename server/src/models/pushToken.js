// const mongoose = require("mongoose");

// const pushTokenSchema = new mongoose.Schema(
//   {
//     token: { type: String, required: true, unique: true },
//     platform: { type: String, enum: ["ios", "android"] },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("pushtokens", pushTokenSchema);

const mongoose = require("mongoose");

const pushTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ["ios", "android"] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("pushtokens", pushTokenSchema);
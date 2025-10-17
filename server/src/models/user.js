const { USER_ROLES } = require("../constants");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: USER_ROLES, default: "user", required: true },
    otp: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);
module.exports = User;

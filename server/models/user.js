const moongoose = require("mongoose");

const userShcsema = new moongoose.Schema({
  phone: { type: String, required: true, unique: true },
  role: { type: String, default: "user", required: true },
  otp: String,
  otpExpires: Date,
});

const user = moongoose.model("users", userShcsema);
module.exports = user;

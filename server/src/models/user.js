// const moongoose = require("mongoose");
// const { USER_ROLES } = require("../constants");

// const userShcsema = new moongoose.Schema({
//   phone: { type: String, required: true, unique: true },
//   role: { type: String, enum: USER_ROLES, default: "user", required: true },
//   otp: String,
//   otpExpires: Date,
// });

// const user = moongoose.model("users", userShcsema);
// module.exports = user;const mongoose = require("mongoose");
const { USER_ROLES } = require("../constants");

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, default: "" }, // 🟢 إضافة الاسم لتوافق الإحصائيات
  role: { type: String, enum: USER_ROLES, default: "user", required: true },
  otp: String,
  otpExpires: Date,
});

const User = mongoose.model("users", userSchema);
module.exports = User;


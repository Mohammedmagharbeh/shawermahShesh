// // const userSchema = new mongoose.Schema(
// //   {
// //     phone: { type: String, sparse: true, unique: true },
// //     username: { type: String, sparse: true, unique: true },
// //     role: { type: String, enum: USER_ROLES, default: "user", required: true },
// //     otp: String,
// //     otpExpires: Date,
// //   },
// //   { timestamps: true }
// // );

const { USER_ROLES, DRIVER_STATUSES } = require("../constants");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, sparse: true, unique: true },
    username: { type: String, sparse: true, unique: true },
    password: { type: String },
    name: { type: String },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    apartment: { type: String },
    role: { type: String, enum: USER_ROLES, default: "user", required: true },
    otp: String,
    otpExpires: Date,
    otpLastSentAt: Date,

    // Driver specific fields (for role: "rider")
    driverStatus: {
      type: String,
      enum: DRIVER_STATUSES,
      default: "unavailable",
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
      default: null,
    },
    returnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Compound index: supports role-filter + createdAt sort used by GET /users
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ role: 1, driverStatus: 1, returnedAt: 1 });

const User = mongoose.model("users", userSchema);
module.exports = User;

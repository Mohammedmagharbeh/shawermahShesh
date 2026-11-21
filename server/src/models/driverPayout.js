const mongoose = require("mongoose");

const driverPayoutSchema = new mongoose.Schema(
  {
    payoutCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    orderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "orders",
        required: true,
      },
    ],
    orderCount: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CLIQ"],
      default: "CASH",
    },
    note: {
      type: String,
      default: "",
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["COMPLETED", "VOIDED"],
      default: "COMPLETED",
      index: true,
    },
    voidReason: {
      type: String,
      default: null,
    },
    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    voidedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

driverPayoutSchema.index({ driverId: 1, createdAt: -1 });

const DriverPayout = mongoose.model("DriverPayout", driverPayoutSchema);
module.exports = DriverPayout;

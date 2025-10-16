// const moongoose = require("mongoose");
// const {
//   ORDER_STATUSES,
//   PAYMENT_METHODS,
//   PAYMENT_STATUSES,
// } = require("../constants");

// const ordersSchema = new moongoose.Schema(
//   {
//     products: [
//       {
//         productId: { type: moongoose.Schema.Types.ObjectId, ref: "Product" },
//         quantity: { type: Number, required: true, default: 1, min: 1 },
//         additions: [
//           { type: moongoose.Schema.Types.ObjectId, ref: "additions" },
//         ],
//         priceAtPurchase: { type: Number, required: true },
//         isSpicy: { type: Boolean, default: false },
//         notes: { type: String, default: "" },
//       },
//     ],
//     totalPrice: { type: Number, required: true },
//     userId: {
//       type: moongoose.Schema.Types.ObjectId,
//       ref: "users",
//       index: true,
//     },
//     status: {
//       type: String,
//       enum: ORDER_STATUSES,
//       default: "pending",
//       index: true,
//     },
//     shippingAddress: {
//       type: moongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "locations",
//     },
//     payment: {
//       status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
//       method: { type: String, enum: PAYMENT_METHODS, required: true },
//       transactionId: { type: String },
//       paidAt: { type: Date },
//     },
//     orderType: {
//       type: String,
//       enum: ["delivery", "pickup"],
//       required: true,
//     },
//     userDetails: {
//       type: {
//         name: { type: String, required: true },
//         apartment: { type: String },
//       },
//       required: true,
//     },
//     sequenceNumber: { type: Number, required: true },
//   },
//   { timestamps: true }
// );

// const orders = moongoose.model("orders", ordersSchema);
// module.exports = orders;
const mongoose = require("mongoose");
const {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} = require("../constants");

const ordersSchema = new mongoose.Schema(
  {
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        additions: [{ type: mongoose.Schema.Types.ObjectId, ref: "additions" }],
        priceAtPurchase: { type: Number, required: true },
        isSpicy: { type: Boolean, default: false },
        notes: { type: String, default: "" },
      },
    ],
    totalPrice: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      index: true,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "locations",
    },
    payment: {
      status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
      method: { type: String, enum: PAYMENT_METHODS, required: true },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
    orderType: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    userDetails: {
      type: {
        name: { type: String, required: true },
        apartment: { type: String },
      },
      required: true,
    },
    sequenceNumber: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("orders", ordersSchema);
module.exports = Order;

const moongoose = require("mongoose");
const {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} = require("../constants");

const ordersSchema = new moongoose.Schema(
  {
    products: [
      {
        productId: { type: moongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    userId: {
      type: moongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      index: true,
    },
    shippingAddress: {
      type: moongoose.Schema.Types.ObjectId,
      required: true,
      ref: "locations",
    },
    payment: {
      status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
      method: { type: String, enum: PAYMENT_METHODS, required: true },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

const orders = moongoose.model("orders", ordersSchema);
module.exports = orders;

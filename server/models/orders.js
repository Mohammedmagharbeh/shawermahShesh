const moongoose = require("mongoose");

// القيم المسموح بها
const ORDER_STATUSES = ["pending", "completed", "cancelled"];
const PAYMENT_METHODS = ["cash", "card", "online"];
const PAYMENT_STATUSES = ["unpaid", "paid"];

const ordersSchema = new moongoose.Schema(
  {
    products: [
      {
        productId: { type: moongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    totalPrice: { type: Number, required: true },
    userId: { type: moongoose.Schema.Types.ObjectId, ref: "users" },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    shippingAddress: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "unpaid",
    },
  },
  { timestamps: true }
);

const orders = moongoose.model("orders", ordersSchema);
module.exports = orders;

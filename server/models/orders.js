import { Schema, model } from "mongoose";

const orderssShcsema = new Schema(
  {
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "product" },
        quantity: { type: Number, require: true, default: 1 },
      },
    ],
    totalPrice: { type: Number, require: true },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    shippingAddress: { type: String, require: true },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      require: true,
    },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
  },
  { timestamps: true }
);

const orders = model("orders", orderssShcsema);

export default orders;

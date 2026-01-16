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
        additions: [
          {
            name: {
              ar: { type: String, trim: true },
              en: { type: String, trim: true },
            },
            price: Number,
          },
        ],
        priceAtPurchase: { type: Number, required: true },
        isSpicy: { type: Boolean, default: false },
        notes: { type: String, default: "" },
        selectedProtein: { type: String }, // meat or chicken
        selectedType: { type: String }, // meal or sandwich
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
      ref: "locations",
      default: null,
      required: false,
    },
    payment: {
      status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
      method: { type: String, enum: PAYMENT_METHODS },
      transactionId: { type: String },
      paidAt: { type: Date, default: Date.now() },
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
    // جعلناه غير مطلوب (required: false) لأننا سنولده تلقائياً بالأسفل
    sequenceNumber: { type: Number, unique: true },
  },
  { timestamps: true }
);


ordersSchema.pre("save", async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const lastOrder = await mongoose
        .model("orders")
        .findOne({}, { sequenceNumber: 1 })
        .sort({ sequenceNumber: -1 }); 

      if (lastOrder && lastOrder.sequenceNumber) {
        doc.sequenceNumber = lastOrder.sequenceNumber + 1;
      } else {
        doc.sequenceNumber = 3140;
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Order = mongoose.model("orders", ordersSchema);
module.exports = Order;
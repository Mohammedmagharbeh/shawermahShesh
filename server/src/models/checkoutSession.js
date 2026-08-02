const mongoose = require("mongoose");

const checkoutSessionSchema = new mongoose.Schema(
  {
    orderData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      description:
        "Holds the entire payload necessary to create a finalized Order document",
    },
    paymentGateway: {
      type: String,
      enum: ["montypay", "zaincash"],
      default: "montypay",
    },
    // TTL index: 2 hours. Abandoned or unconfirmed sessions are purged automatically.
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "2h",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CheckoutSession", checkoutSessionSchema);

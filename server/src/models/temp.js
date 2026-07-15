const mongoose = require("mongoose");

const promoCodeUsageSchema = new mongoose.Schema(
  {
    promoCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
      required: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true },
);

// فهرسة تسريع للاستعلام الأكثر استخدامًا: "قديش هالمستخدم استخدم هالكود؟"
promoCodeUsageSchema.index({ code: 1, userId: 1 });

module.exports = mongoose.model("PromoCodeUsage", promoCodeUsageSchema);
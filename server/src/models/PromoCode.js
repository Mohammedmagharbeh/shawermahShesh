// const mongoose = require("mongoose");

// const promoCodeSchema = new mongoose.Schema(
//   {
//     code: {
//       type: String,
//       required: true,
//       unique: true,
//       uppercase: true,
//       trim: true,
//     },
//     discountPercentage: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 100,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     expiryDate: {
//       type: Date,
//       default: null,
//     },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("PromoCode", promoCodeSchema);


const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    // ✅ الحد الأقصى لعدد مرات استخدام نفس الزبون لنفس الكود.
    // null أو 0 = بدون حد (استخدام غير محدود)
    maxUsesPerUser: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);
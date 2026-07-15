// const PromoCode = require("../models/PromoCode");

// // GET /api/promo-codes  (Admin)
// exports.getAllPromoCodes = async (req, res) => {
//   try {
//     const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
//     res.status(200).json(promoCodes);
//   } catch (err) {
//     res.status(500).json({ message: "فشل تحميل أكواد الخصم" });
//   }
// };

// // POST /api/promo-codes  (Admin)
// exports.createPromoCode = async (req, res) => {
//   try {
//     const { code, discountPercentage, isActive, expiryDate } = req.body;

//     if (!code || !discountPercentage) {
//       return res.status(400).json({ message: "الكود ونسبة الخصم مطلوبين" });
//     }

//     const existing = await PromoCode.findOne({ code: code.toUpperCase() });
//     if (existing) {
//       return res.status(409).json({ message: "هذا الكود مستخدم مسبقًا" });
//     }

//     const promoCode = await PromoCode.create({
//       code: code.toUpperCase(),
//       discountPercentage,
//       isActive: isActive ?? true,
//       expiryDate: expiryDate || null,
//     });

//     res.status(201).json(promoCode);
//   } catch (err) {
//     res.status(500).json({ message: "فشل إنشاء الكود" });
//   }
// };

// // PATCH /api/promo-codes/:id  (Admin)
// exports.updatePromoCode = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updated = await PromoCode.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });

//     if (!updated) {
//       return res.status(404).json({ message: "الكود غير موجود" });
//     }

//     res.status(200).json(updated);
//   } catch (err) {
//     res.status(500).json({ message: "فشل التحديث" });
//   }
// };

// // DELETE /api/promo-codes/:id  (Admin)
// exports.deletePromoCode = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await PromoCode.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({ message: "الكود غير موجود" });
//     }

//     res.status(200).json({ message: "تم الحذف بنجاح" });
//   } catch (err) {
//     res.status(500).json({ message: "فشل الحذف" });
//   }
// };

// // GET /api/promo-codes/validate?code=XXXX  (Customer - Public)
// exports.validatePromoCode = async (req, res) => {
//   try {
//     const { code } = req.query;

//     if (!code) {
//       return res.status(400).json({ message: "الكود مطلوب" });
//     }

//     const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

//     if (!promoCode) {
//       return res.status(404).json({ message: "الكود غير موجود" });
//     }

//     if (!promoCode.isActive) {
//       return res.status(400).json({ message: "هذا الكود غير مفعّل" });
//     }

//     if (promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date()) {
//       return res.status(400).json({ message: "هذا الكود منتهي الصلاحية" });
//     }

//     res.status(200).json({
//       code: promoCode.code,
//       discountPercentage: promoCode.discountPercentage,
//       isActive: promoCode.isActive,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "فشل التحقق من الكود" });
//   }
// };


const PromoCode = require("../models/PromoCode");
// const PromoCodeUsage = require("../models/Promocodeusage");
const PromoCodeUsage = require("../models/PromoCodeUsage");
// GET /api/promo-codes  (Admin)
exports.getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    res.status(200).json(promoCodes);
  } catch (err) {
    res.status(500).json({ message: "فشل تحميل أكواد الخصم" });
  }
};

// POST /api/promo-codes  (Admin)
exports.createPromoCode = async (req, res) => {
  try {
    const { code, discountPercentage, isActive, expiryDate, maxUsesPerUser } =
      req.body;

    if (!code || !discountPercentage) {
      return res.status(400).json({ message: "الكود ونسبة الخصم مطلوبين" });
    }

    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: "هذا الكود مستخدم مسبقًا" });
    }

    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      discountPercentage,
      isActive: isActive ?? true,
      expiryDate: expiryDate || null,
      maxUsesPerUser:
        maxUsesPerUser === undefined || maxUsesPerUser === ""
          ? null
          : Number(maxUsesPerUser),
    });

    res.status(201).json(promoCode);
  } catch (err) {
    res.status(500).json({ message: "فشل إنشاء الكود" });
  }
};

// PATCH /api/promo-codes/:id  (Admin)
exports.updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PromoCode.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "الكود غير موجود" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "فشل التحديث" });
  }
};

// DELETE /api/promo-codes/:id  (Admin)
exports.deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PromoCode.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "الكود غير موجود" });
    }

    // نظف سجلات الاستخدام المرتبطة فيه (اختياري، حسب رغبتك بالإبقاء عليها كتاريخ)
    await PromoCodeUsage.deleteMany({ promoCode: id });

    res.status(200).json({ message: "تم الحذف بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "فشل الحذف" });
  }
};

// GET /api/promo-codes/validate?code=XXXX  (Customer - يتطلب تسجيل دخول)
// لازم يمر عبر middleware التحقق (verifyUser) قبل ما يوصل هون، عشان يكون req.userId موجود
exports.validatePromoCode = async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.userId;

    if (!code) {
      return res.status(400).json({ message: "الكود مطلوب" });
    }

    if (!userId) {
      return res.status(401).json({ message: "الرجاء تسجيل الدخول لاستخدام كود الخصم" });
    }

    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

    if (!promoCode) {
      return res.status(404).json({ message: "الكود غير موجود" });
    }

    if (!promoCode.isActive) {
      return res.status(400).json({ message: "هذا الكود غير مفعّل" });
    }

    if (promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date()) {
      return res.status(400).json({ message: "هذا الكود منتهي الصلاحية" });
    }

    // ✅ التحقق من عدد مرات استخدام هالزبون تحديدًا لهالكود
    if (promoCode.maxUsesPerUser && promoCode.maxUsesPerUser > 0) {
      const usageCount = await PromoCodeUsage.countDocuments({
        promoCode: promoCode._id,
        userId,
      });

      if (usageCount >= promoCode.maxUsesPerUser) {
        return res.status(403).json({
          message: `لقد استخدمت هذا الكود الحد الأقصى المسموح (${promoCode.maxUsesPerUser} مرة)`,
          code: "PROMO_LIMIT_REACHED",
        });
      }
    }

    res.status(200).json({
      code: promoCode.code,
      discountPercentage: promoCode.discountPercentage,
      isActive: promoCode.isActive,
      maxUsesPerUser: promoCode.maxUsesPerUser,
    });
  } catch (err) {
    res.status(500).json({ message: "فشل التحقق من الكود" });
  }
};

/**
 * ✅ Helper — استدعيها من داخل أي controller بيأكد نجاح الدفع فعليًا
 * (zainCash confirm, orangeMoney confirm, montypay success/webhook)
 * بعد ما تتأكد إنه الطلب انحفظ بنجاح.
 *
 * مثال استخدام:
 *   const { recordPromoUsage } = require("../controllers/promoCodeController");
 *   if (orderData.promoCode) {
 *     await recordPromoUsage(orderData.promoCode, userId, savedOrder._id);
 *   }
 */
exports.recordPromoUsage = async (code, userId, orderId = null) => {
  if (!code || !userId) return null;

  const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });
  if (!promoCode) return null;

  const usage = await PromoCodeUsage.create({
    promoCode: promoCode._id,
    code: promoCode.code,
    userId,
    orderId,
  });

  return usage;
};
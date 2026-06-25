// const express = require("express");
// const router = express.Router();
// const {
//   getServicers,
//   rtpOtpValidate,
//   rtpOtpConfirm,
// } = require("../controller/orangeMoneyService");
// const Order = require("../models/orders");
// const Cart = require("../models/cart");
// const { v4: uuidv4 } = require("uuid");

// // GET /orange/servicers
// router.get("/servicers", async (req, res) => {
//   try {
//     const servicers = await getServicers();
//     res.json({ success: true, servicers });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // POST /orange/initiate
// router.post("/initiate", async (req, res) => {
//   try {
//     const { phone, amount, servicerCode } = req.body;
//     console.log("=== INITIATE REQUEST ===", { phone, amount, servicerCode });

//     if (!phone || !amount || !servicerCode) {
//       return res
//         .status(400)
//         .json({ success: false, error: "phone, amount, servicerCode مطلوبين" });
//     }

//     const alias = `00962${phone.replace(/^0/, "")}`;
//     const merchantReference = uuidv4();

//     const result = await rtpOtpValidate({
//       alias,
//       aliasType: "MOBL",
//       amount,
//       servicerCode,
//       merchantReference,
//     });

//     console.log("=== INITIATE RESULT ===", result);

//     if (!result.isSuccess) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           error: result.errors?.[0]?.description || "فشل إرسال OTP",
//         });
//     }

//     res.json({
//       success: true,
//       merchantReference,
//       message: "تم إرسال OTP على رقمك",
//     });
//   } catch (err) {
//     console.error("initiate error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // POST /orange/confirm
// router.post("/confirm", async (req, res) => {
//   try {
//     const { phone, amount, servicerCode, merchantReference, otp, orderData } =
//       req.body;
//     console.log("=== CONFIRM REQUEST ===", {
//       phone,
//       amount,
//       servicerCode,
//       merchantReference,
//       otp,
//     });

//     if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
//       return res.status(400).json({ success: false, error: "بيانات ناقصة" });
//     }

//     if (!orderData?.totalPrice) {
//       return res
//         .status(400)
//         .json({ success: false, error: "orderData.totalPrice مطلوب" });
//     }

//     if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: "orderData.products مطلوب" });
//     }

//     if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
//       return res
//         .status(400)
//         .json({ success: false, error: "كل منتج لازم يحتوي priceAtPurchase" });
//     }

//     const alias = `00962${phone.replace(/^0/, "")}`;

//     const result = await rtpOtpConfirm({
//       alias,
//       aliasType: "MOBL",
//       amount,
//       servicerCode,
//       merchantReference,
//       otp,
//     });

//     console.log("=== CONFIRM RESULT ===", result);

//     if (!result.isSuccess) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           error: result.errors?.[0]?.description || "فشل التحقق من OTP",
//         });
//     }

//     const order = await Order.create({
//       ...orderData,
//       status: "Processing",
//       payment: {
//         method: "orange_money",
//         transactionId: result.TransactionReference || merchantReference,
//         status: "paid",
//         paidAt: new Date(),
//       },
//     });

//     await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

//     const io = req.app.get("io");
//     if (io) io.emit("newOrder", order);

//     console.log("=== ORDER CREATED ===", order._id);

//     return res.json({
//       success: true,
//       orderId: order._id,
//       transactionReference: result.TransactionReference || merchantReference,
//     });
//   } catch (err) {
//     console.error("confirm error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  getServicers,
  rtpOtpValidate,
  rtpOtpConfirm,
} = require("../controller/orangeMoneyService");
const Order = require("../models/orders");
const Cart = require("../models/cart");
const { v4: uuidv4 } = require("uuid");

// ─── Helper: هل رد Orange Money يعتبر نجاحاً مالياً حقيقياً؟ ────────────────
/**
 * أورانج ماني ترجع isSuccess: true لاتصال الـ API.
 * هنا نفحص الحالات الداخلية للمعاملة لضمان خصم الفلوس فعلياً.
 */
function isOrangePaymentSuccess(result) {
  if (!result || !result.isSuccess) return false;

  // استخراج حالة المعاملة الداخلية من الرد (تأتي بصيغ مختلفة حسب بيئة أورانج)
  const txStatus = result.TransactionStatus || result.Response?.TransactionStatus || result.status || result.Status;
  const resultCode = result.ResultCode || result.Response?.ResultCode || result.resultCode;

  // إذا وجدنا حالة معاملة واضحة، يجب أن تكون SUCCESS أو Completed
  if (txStatus) {
    const statusUpper = txStatus.toUpperCase();
    if (statusUpper !== "SUCCESS" && statusUpper !== "COMPLETED") {
      return false;
    }
  }

  // إذا أورانج ترجع ResultCode (عادة "00" أو "0" تعني نجاح، وبعض البيئات ترجع كلمة "Success")
  if (resultCode != null) {
    const codeStr = resultCode.toString().toLowerCase();
    if (codeStr !== "0" && codeStr !== "00" && codeStr !== "success") {
      return false;
    }
  }

  return true;
}

// ─── Route 1: GET /orange/servicers ─────────────────────────────────────────
router.get("/servicers", async (req, res) => {
  try {
    const servicers = await getServicers();
    res.json({ success: true, servicers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Route 2: POST /orange/initiate (إرسال OTP) ──────────────────────────────
router.post("/initiate", async (req, res) => {
  try {
    const { phone, amount, servicerCode } = req.body;
    console.log("=== INITIATE REQUEST ===", { phone, amount, servicerCode });

    if (!phone || !amount || !servicerCode) {
      return res
        .status(400)
        .json({ success: false, error: "phone, amount, servicerCode مطلوبين" });
    }

    const alias = `00962${phone.replace(/^0/, "")}`;
    const merchantReference = uuidv4();

    // إضافة تايم أوت لحماية الاتصال كأسلوب زين كاش
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 15000),
    );

    const result = await Promise.race([
      rtpOtpValidate({
        alias,
        aliasType: "MOBL",
        amount,
        servicerCode,
        merchantReference,
      }),
      timeoutPromise,
    ]);

    console.log("=== INITIATE RESULT ===", result);

    if (!result || !result.isSuccess) {
      return res.status(400).json({
        success: false,
        error: result?.errors?.[0]?.description || "فشل إرسال OTP من مزود الخدمة",
      });
    }

    res.json({
      success: true,
      merchantReference,
      message: "تم إرسال OTP على رقمك",
    });
  } catch (err) {
    console.error("initiate error:", err);
    if (err.message === "TIMEOUT") {
      return res.status(504).json({
        success: false,
        error: "انتهت مهلة الاتصال بخدمة أورانج ماني. الرجاء المحاولة لاحقاً.",
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Route 3: POST /orange/confirm (تأكيد الخصم وإنشاء الطلب) ───────────────────
router.post("/confirm", async (req, res) => {
  try {
    const { phone, amount, servicerCode, merchantReference, otp, orderData } = req.body;
    console.log("=== CONFIRM REQUEST ===", { phone, amount, servicerCode, merchantReference, otp });

    // التحققات الأولية
    if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
      return res.status(400).json({ success: false, error: "بيانات ناقصة" });
    }

    if (orderData) {
      if (!orderData.totalPrice) {
        return res.status(400).json({ success: false, error: "orderData.totalPrice مطلوب" });
      }
      if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
        return res.status(400).json({ success: false, error: "orderData.products مطلوب" });
      }
      if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
        return res.status(400).json({ success: false, error: "كل منتج لازم يحتوي priceAtPurchase" });
      }
    }

    const alias = `00962${phone.replace(/^0/, "")}`;

    // Step 1: إرسال طلب التأكيد والخصم الفعلي إلى أورانج ماني
    const result = await rtpOtpConfirm({
      alias,
      aliasType: "MOBL",
      amount,
      servicerCode,
      merchantReference,
      otp,
    });

    console.log("=== CONFIRM RESULT ===", JSON.stringify(result, null, 2));

    // ✅ الفحص الحاسم مثل زين كاش: التحقق من نجاح المعاملة المالية الفعلية وليس فقط الـ API
    if (!isOrangePaymentSuccess(result)) {
      const errorMsg =
        result?.errors?.[0]?.description ||
        result?.ResponseDescription ||
        result?.TechnicalMessage ||
        "تم رفض عملية الخصم المالي؛ قد يكون الرصيد غير كافٍ أو المعاملة منتهية.";
      
      return res.status(400).json({
        success: false,
        error: `فشل تأكيد عملية الدفع: ${errorMsg}`,
      });
    }

    // Step 2: الخصم المالي نجح 100% — الآن نقوم بإنشاء الطلب في قاعدة البيانات وتصفير السلة
    let order = null;
    if (orderData) {
      try {
        const transactionId = result.TransactionReference || result.Response?.TransactionReference || merchantReference;

        order = await Order.create({
          ...orderData,
          status: "Processing",
          payment: {
            method: "orange_money",
            transactionId: transactionId,
            status: "paid",
            paidAt: new Date(),
          },
        });

        // تصفير السلة بعد نجاح العملية بالكامل
        await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

        // إطلاق حدث لوحة التحكم (Socket.io)
        const io = req.app.get("io");
        if (io) io.emit("newOrder", order);

        console.log(`✅ Orange Money order ${order._id} created and paid. Ref: ${transactionId}`);
      } catch (orderError) {
        console.error("[Orange Money] Order creation error:", orderError.message);
        
        // سيناريو الحماية (مثل زين كاش): الدفع انخصم بس السيرفر علق بإنشاء الطلب
        return res.status(500).json({
          success: true, // نرجع true لأن الفلوس انخصمت فعلياً ونعلم العميل يتواصل مع الإدارة
          message: "تم الخصم والدفع بنجاح، ولكن حدث خطأ تقني داخلي أثناء تسجيل الطلب. يرجى تزويد الدعم برقم المرجع المالي.",
          transactionReference: result.TransactionReference || merchantReference,
          orderError: orderError.message,
        });
      }
    }

    // الرد النهائي الناجح
    return res.json({
      success: true,
      orderId: order?._id || null,
      orderCreated: !!order,
      transactionReference: result.TransactionReference || merchantReference,
    });

  } catch (err) {
    console.error("confirm error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
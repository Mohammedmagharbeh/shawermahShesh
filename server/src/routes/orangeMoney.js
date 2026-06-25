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


// =========================
// GET SERVICERS
// =========================
router.get("/servicers", async (req, res) => {
  try {
    const servicers = await getServicers();

    console.log("🔥 SERVICERS RESULT:", servicers);

    return res.json({
      success: true,
      servicers,
    });

  } catch (err) {
    console.error("SERVICERS ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// =========================
// INITIATE OTP
// =========================
router.post("/initiate", async (req, res) => {
  try {
    const { phone, amount, servicerCode } = req.body;

    console.log("🔥 INITIATE REQUEST:", { phone, amount, servicerCode });

    if (!phone || !amount || !servicerCode) {
      return res.status(400).json({
        success: false,
        error: "phone, amount, servicerCode مطلوبين",
      });
    }

    const alias = `00962${phone.replace(/^0/, "")}`;
    const merchantReference = uuidv4();

    const result = await rtpOtpValidate({
      alias,
      aliasType: "MOBL",
      amount,
      servicerCode,
      merchantReference,
    });

    console.log("🔥 INITIATE RESPONSE:", result);

    if (!result?.isSuccess) {
      return res.status(400).json({
        success: false,
        error: result?.errors?.[0]?.description || "فشل إرسال OTP",
      });
    }

    return res.json({
      success: true,
      merchantReference,
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error("INITIATE ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// =========================
// CONFIRM PAYMENT
// =========================
router.post("/confirm", async (req, res) => {
  try {
    const {
      phone,
      amount,
      servicerCode,
      merchantReference,
      otp,
      orderData,
    } = req.body;

    console.log("🔥 CONFIRM REQUEST:", {
      phone,
      amount,
      servicerCode,
      merchantReference,
      otp,
    });

    if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
      return res.status(400).json({
        success: false,
        error: "بيانات ناقصة",
      });
    }

    const alias = `00962${phone.replace(/^0/, "")}`;

    const result = await rtpOtpConfirm({
      alias,
      aliasType: "MOBL",
      amount,
      servicerCode,
      merchantReference,
      otp,
    });

    console.log("🔥 CONFIRM RESPONSE FULL:", result);

    // =========================
    // ❌ IMPORTANT VALIDATION
    // =========================
    const isPaid =
      result?.isSuccess === true &&
      result?.TransactionReference &&
      result?.ResponseCode === "00";

    if (!isPaid) {
      return res.status(400).json({
        success: false,
        error: "Payment not completed",
        details: result,
      });
    }

    // =========================
    // CREATE ORDER ONLY IF PAID
    // =========================
    const order = await Order.create({
      ...orderData,
      status: "Paid",
      payment: {
        method: "orange_money",
        transactionId:
          result.TransactionReference || merchantReference,
        status: "paid",
        paidAt: new Date(),
      },
    });

    // clear cart
    await Cart.findOneAndUpdate(
      { userId: orderData.userId },
      { products: [] }
    );

    // realtime event
    const io = req.app.get("io");
    if (io) io.emit("newOrder", order);

    console.log("🔥 ORDER SAVED:", order._id);

    return res.json({
      success: true,
      orderId: order._id,
      transactionReference:
        result.TransactionReference || merchantReference,
    });

  } catch (err) {
    console.error("CONFIRM ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;

// // const express = require("express");
// // const router = express.Router();
// // const {
// //   getServicers,
// //   rtpOtpValidate,
// //   rtpOtpConfirm,
// // } = require("../controller/orangeMoneyService");
// // const Order = require("../models/orders");
// // const Cart = require("../models/cart");
// // const { v4: uuidv4 } = require("uuid");

// // // GET /orange/servicers
// // router.get("/servicers", async (req, res) => {
// //   try {
// //     const servicers = await getServicers();
// //     res.json({ success: true, servicers });
// //   } catch (err) {
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // // POST /orange/initiate
// // router.post("/initiate", async (req, res) => {
// //   try {
// //     const { phone, amount, servicerCode } = req.body;
// //     console.log("=== INITIATE REQUEST ===", { phone, amount, servicerCode });

// //     if (!phone || !amount || !servicerCode) {
// //       return res
// //         .status(400)
// //         .json({ success: false, error: "phone, amount, servicerCode مطلوبين" });
// //     }

// //     const alias = `00962${phone.replace(/^0/, "")}`;
// //     const merchantReference = uuidv4();

// //     const result = await rtpOtpValidate({
// //       alias,
// //       aliasType: "MOBL",
// //       amount,
// //       servicerCode,
// //       merchantReference,
// //     });

// //     console.log("=== INITIATE RESULT ===", result);

// //     if (!result.isSuccess) {
// //       return res
// //         .status(400)
// //         .json({
// //           success: false,
// //           error: result.errors?.[0]?.description || "فشل إرسال OTP",
// //         });
// //     }

// //     res.json({
// //       success: true,
// //       merchantReference,
// //       message: "تم إرسال OTP على رقمك",
// //     });
// //   } catch (err) {
// //     console.error("initiate error:", err);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // // POST /orange/confirm
// // router.post("/confirm", async (req, res) => {
// //   try {
// //     const { phone, amount, servicerCode, merchantReference, otp, orderData } =
// //       req.body;
// //     console.log("=== CONFIRM REQUEST ===", {
// //       phone,
// //       amount,
// //       servicerCode,
// //       merchantReference,
// //       otp,
// //     });

// //     if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
// //       return res.status(400).json({ success: false, error: "بيانات ناقصة" });
// //     }

// //     if (!orderData?.totalPrice) {
// //       return res
// //         .status(400)
// //         .json({ success: false, error: "orderData.totalPrice مطلوب" });
// //     }

// //     if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
// //       return res
// //         .status(400)
// //         .json({ success: false, error: "orderData.products مطلوب" });
// //     }

// //     if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
// //       return res
// //         .status(400)
// //         .json({ success: false, error: "كل منتج لازم يحتوي priceAtPurchase" });
// //     }

// //     const alias = `00962${phone.replace(/^0/, "")}`;

// //     const result = await rtpOtpConfirm({
// //       alias,
// //       aliasType: "MOBL",
// //       amount,
// //       servicerCode,
// //       merchantReference,
// //       otp,
// //     });

// //     console.log("=== CONFIRM RESULT ===", result);

// //     if (!result.isSuccess) {
// //       return res
// //         .status(400)
// //         .json({
// //           success: false,
// //           error: result.errors?.[0]?.description || "فشل التحقق من OTP",
// //         });
// //     }

// //     const order = await Order.create({
// //       ...orderData,
// //       status: "Processing",
// //       payment: {
// //         method: "orange_money",
// //         transactionId: result.TransactionReference || merchantReference,
// //         status: "paid",
// //         paidAt: new Date(),
// //       },
// //     });

// //     await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

// //     const io = req.app.get("io");
// //     if (io) io.emit("newOrder", order);

// //     console.log("=== ORDER CREATED ===", order._id);

// //     return res.json({
// //       success: true,
// //       orderId: order._id,
// //       transactionReference: result.TransactionReference || merchantReference,
// //     });
// //   } catch (err) {
// //     console.error("confirm error:", err);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // module.exports = router;

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
//       return res.status(400).json({
//         success: false,
//         error: "phone, amount, servicerCode مطلوبين",
//       });
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
//       return res.status(400).json({
//         success: false,
//         error: result.errors?.[0]?.description || "فشل إرسال OTP",
//       });
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
//       return res.status(400).json({
//         success: false,
//         error: "orderData.totalPrice مطلوب",
//       });
//     }

//     if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "orderData.products مطلوب",
//       });
//     }

//     if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
//       return res.status(400).json({
//         success: false,
//         error: "كل منتج لازم يحتوي priceAtPurchase",
//       });
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
//       return res.status(400).json({
//         success: false,
//         error: result.errors?.[0]?.description || "فشل التحقق من OTP",
//       });
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

// GET /orange/servicers
router.get("/servicers", async (req, res) => {
  try {
    const servicers = await getServicers();
    res.json({ success: true, servicers });
  } catch (err) {
    console.error("=== SERVICERS ERROR ===", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /orange/initiate
router.post("/initiate", async (req, res) => {
  try {
    const { phone, amount, servicerCode } = req.body;
    console.log("=== INITIATE REQUEST ===", { phone, amount, servicerCode });

    if (!phone || !amount || !servicerCode) {
      return res.status(400).json({
        success: false,
        error: "phone, amount, servicerCode مطلوبين",
      });
    }

    const alias = `00962${phone.replace(/^0/, "")}`;
    const merchantReference = uuidv4();

    console.log("=== INITIATE ALIAS ===", alias);
    console.log("=== INITIATE MERCHANT REF ===", merchantReference);

    const result = await rtpOtpValidate({
      alias,
      aliasType: "MOBL",
      amount,
      servicerCode,
      merchantReference,
    });

    console.log("=== INITIATE RESULT ===", JSON.stringify(result, null, 2));

    if (!result.isSuccess) {
      console.error("=== INITIATE FAILED ===", result.errors);
      return res.status(400).json({
        success: false,
        error: result.errors?.[0]?.description || "فشل إرسال OTP",
      });
    }

    res.json({
      success: true,
      merchantReference,
      message: "تم إرسال OTP على رقمك",
    });
  } catch (err) {
    console.error("=== INITIATE ERROR ===", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /orange/confirm
router.post("/confirm", async (req, res) => {
  try {
    const { phone, amount, servicerCode, merchantReference, otp, orderData } = req.body;
    console.log("=== CONFIRM REQUEST ===", { phone, amount, servicerCode, merchantReference, otp });

    if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
      return res.status(400).json({ success: false, error: "بيانات ناقصة" });
    }

    if (!orderData?.totalPrice) {
      return res.status(400).json({ success: false, error: "orderData.totalPrice مطلوب" });
    }

    if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
      return res.status(400).json({ success: false, error: "orderData.products مطلوب" });
    }

    if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
      return res.status(400).json({ success: false, error: "كل منتج لازم يحتوي priceAtPurchase" });
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

    console.log("=== CONFIRM RESULT ===", JSON.stringify(result, null, 2));

    if (!result.isSuccess) {
      console.error("=== CONFIRM FAILED ===", result.errors);
      return res.status(400).json({
        success: false,
        error: result.errors?.[0]?.description || "فشل التحقق من OTP",
      });
    }

    console.log("=== CONFIRM SUCCESS - CREATING ORDER ===");

    const order = await Order.create({
      ...orderData,
      status: "Processing",
      payment: {
        method: "orange_money",
        transactionId: result.TransactionReference || merchantReference,
        status: "paid",
        paidAt: new Date(),
      },
    });

    await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

    const io = req.app.get("io");
    if (io) io.emit("newOrder", order);

    console.log("=== ORDER CREATED ===", order._id);

    return res.json({
      success: true,
      orderId: order._id,
      transactionReference: result.TransactionReference || merchantReference,
    });
  } catch (err) {
    console.error("=== CONFIRM ERROR ===", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
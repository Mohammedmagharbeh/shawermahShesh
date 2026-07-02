// // // // // const express = require("express");
// // // // // const router = express.Router();
// // // // // const {
// // // // //   getServicers,
// // // // //   rtpOtpValidate,
// // // // //   rtpOtpConfirm,
// // // // // } = require("../controller/orangeMoneyService");
// // // // // const Order = require("../models/orders");
// // // // // const Cart = require("../models/cart");
// // // // // const { v4: uuidv4 } = require("uuid");

// // // // // // GET /orange/servicers
// // // // // router.get("/servicers", async (req, res) => {
// // // // //   try {
// // // // //     const servicers = await getServicers();
// // // // //     res.json({ success: true, servicers });
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ success: false, error: err.message });
// // // // //   }
// // // // // });

// // // // // // POST /orange/initiate
// // // // // router.post("/initiate", async (req, res) => {
// // // // //   try {
// // // // //     const { phone, amount, servicerCode } = req.body;
// // // // //     console.log("=== INITIATE REQUEST ===", { phone, amount, servicerCode });

// // // // //     if (!phone || !amount || !servicerCode) {
// // // // //       return res
// // // // //         .status(400)
// // // // //         .json({ success: false, error: "phone, amount, servicerCode مطلوبين" });
// // // // //     }

// // // // //     const alias = `00962${phone.replace(/^0/, "")}`;
// // // // //     const merchantReference = uuidv4();

// // // // //     const result = await rtpOtpValidate({
// // // // //       alias,
// // // // //       aliasType: "MOBL",
// // // // //       amount,
// // // // //       servicerCode,
// // // // //       merchantReference,
// // // // //     });

// // // // //     console.log("=== INITIATE RESULT ===", result);

// // // // //     if (!result.isSuccess) {
// // // // //       return res
// // // // //         .status(400)
// // // // //         .json({
// // // // //           success: false,
// // // // //           error: result.errors?.[0]?.description || "فشل إرسال OTP",
// // // // //         });
// // // // //     }

// // // // //     res.json({
// // // // //       success: true,
// // // // //       merchantReference,
// // // // //       message: "تم إرسال OTP على رقمك",
// // // // //     });
// // // // //   } catch (err) {
// // // // //     console.error("initiate error:", err);
// // // // //     res.status(500).json({ success: false, error: err.message });
// // // // //   }
// // // // // });

// // // // // // POST /orange/confirm
// // // // // router.post("/confirm", async (req, res) => {
// // // // //   try {
// // // // //     const { phone, amount, servicerCode, merchantReference, otp, orderData } =
// // // // //       req.body;
// // // // //     console.log("=== CONFIRM REQUEST ===", {
// // // // //       phone,
// // // // //       amount,
// // // // //       servicerCode,
// // // // //       merchantReference,
// // // // //       otp,
// // // // //     });

// // // // //     if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
// // // // //       return res.status(400).json({ success: false, error: "بيانات ناقصة" });
// // // // //     }

// // // // //     if (!orderData?.totalPrice) {
// // // // //       return res
// // // // //         .status(400)
// // // // //         .json({ success: false, error: "orderData.totalPrice مطلوب" });
// // // // //     }

// // // // //     if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
// // // // //       return res
// // // // //         .status(400)
// // // // //         .json({ success: false, error: "orderData.products مطلوب" });
// // // // //     }

// // // // //     if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
// // // // //       return res
// // // // //         .status(400)
// // // // //         .json({ success: false, error: "كل منتج لازم يحتوي priceAtPurchase" });
// // // // //     }

// // // // //     const alias = `00962${phone.replace(/^0/, "")}`;

// // // // //     const result = await rtpOtpConfirm({
// // // // //       alias,
// // // // //       aliasType: "MOBL",
// // // // //       amount,
// // // // //       servicerCode,
// // // // //       merchantReference,
// // // // //       otp,
// // // // //     });

// // // // //     console.log("=== CONFIRM RESULT ===", result);

// // // // //     if (!result.isSuccess) {
// // // // //       return res
// // // // //         .status(400)
// // // // //         .json({
// // // // //           success: false,
// // // // //           error: result.errors?.[0]?.description || "فشل التحقق من OTP",
// // // // //         });
// // // // //     }

// // // // //     const order = await Order.create({
// // // // //       ...orderData,
// // // // //       status: "Processing",
// // // // //       payment: {
// // // // //         method: "orange_money",
// // // // //         transactionId: result.TransactionReference || merchantReference,
// // // // //         status: "paid",
// // // // //         paidAt: new Date(),
// // // // //       },
// // // // //     });

// // // // //     await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

// // // // //     const io = req.app.get("io");
// // // // //     if (io) io.emit("newOrder", order);

// // // // //     console.log("=== ORDER CREATED ===", order._id);

// // // // //     return res.json({
// // // // //       success: true,
// // // // //       orderId: order._id,
// // // // //       transactionReference: result.TransactionReference || merchantReference,
// // // // //     });
// // // // //   } catch (err) {
// // // // //     console.error("confirm error:", err);
// // // // //     res.status(500).json({ success: false, error: err.message });
// // // // //   }
// // // // // });

// // // // // module.exports = router;

// // // // const express = require("express");
// // // // const router = express.Router();
// // // // const {
// // // //   getServicers,
// // // //   rtpOtpValidate,
// // // //   rtpOtpConfirm,
// // // // } = require("../controller/orangeMoneyService");
// // // // const Order = require("../models/orders");
// // // // const Cart = require("../models/cart");
// // // // const { v4: uuidv4 } = require("uuid");

// // // // // GET /orange/servicers
// // // // router.get("/servicers", async (req, res) => {
// // // //   try {
// // // //     const servicers = await getServicers();
// // // //     res.json({ success: true, servicers });
// // // //   } catch (err) {
// // // //     res.status(500).json({ success: false, error: err.message });
// // // //   }
// // // // });

// // // // // POST /orange/initiate
// // // // router.post("/initiate", async (req, res) => {
// // // //   try {
// // // //     const { phone, amount, servicerCode } = req.body;
// // // //     console.log("=== INITIATE REQUEST ===", { phone, amount, servicerCode });

// // // //     if (!phone || !amount || !servicerCode) {
// // // //       return res.status(400).json({
// // // //         success: false,
// // // //         error: "phone, amount, servicerCode مطلوبين",
// // // //       });
// // // //     }

// // // //     const alias = `00962${phone.replace(/^0/, "")}`;
// // // //     const merchantReference = uuidv4();

// // // //     const result = await rtpOtpValidate({
// // // //       alias,
// // // //       aliasType: "MOBL",
// // // //       amount,
// // // //       servicerCode,
// // // //       merchantReference,
// // // //     });

// // // //     console.log("=== INITIATE RESULT ===", result);

// // // //     if (!result.isSuccess) {
// // // //       return res.status(400).json({
// // // //         success: false,
// // // //         error: result.errors?.[0]?.description || "فشل إرسال OTP",
// // // //       });
// // // //     }

// // // //     res.json({
// // // //       success: true,
// // // //       merchantReference,
// // // //       message: "تم إرسال OTP على رقمك",
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("initiate error:", err);
// // // //     res.status(500).json({ success: false, error: err.message });
// // // //   }
// // // // });

// // // // // POST /orange/confirm
// // // // router.post("/confirm", async (req, res) => {
// // // //   try {
// // // //     const { phone, amount, servicerCode, merchantReference, otp, orderData } =
// // // //       req.body;
// // // //     console.log("=== CONFIRM REQUEST ===", {
// // // //       phone,
// // // //       amount,
// // // //       servicerCode,
// // // //       merchantReference,
// // // //       otp,
// // // //     });

// // // //     if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
// // // //       return res.status(400).json({ success: false, error: "بيانات ناقصة" });
// // // //     }

// // // //     if (!orderData?.totalPrice) {
// // // //       return res.status(400).json({
// // // //         success: false,
// // // //         error: "orderData.totalPrice مطلوب",
// // // //       });
// // // //     }

// // // //     if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
// // // //       return res.status(400).json({
// // // //         success: false,
// // // //         error: "orderData.products مطلوب",
// // // //       });
// // // //     }

// // // //     if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
// // // //       return res.status(400).json({
// // // //         success: false,
// // // //         error: "كل منتج لازم يحتوي priceAtPurchase",
// // // //       });
// // // //     }

// // // //     const alias = `00962${phone.replace(/^0/, "")}`;

// // // //     const result = await rtpOtpConfirm({
// // // //       alias,
// // // //       aliasType: "MOBL",
// // // //       amount,
// // // //       servicerCode,
// // // //       merchantReference,
// // // //       otp,
// // // //     });

// // // //     console.log("=== CONFIRM RESULT ===", result);

// // // //     if (!result.isSuccess) {
// // // //       return res.status(400).json({
// // // //         success: false,
// // // //         error: result.errors?.[0]?.description || "فشل التحقق من OTP",
// // // //       });
// // // //     }

// // // //     const order = await Order.create({
// // // //       ...orderData,
// // // //       status: "Processing",
// // // //       payment: {
// // // //         method: "orange_money",
// // // //         transactionId: result.TransactionReference || merchantReference,
// // // //         status: "paid",
// // // //         paidAt: new Date(),
// // // //       },
// // // //     });

// // // //     await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

// // // //     const io = req.app.get("io");
// // // //     if (io) io.emit("newOrder", order);

// // // //     console.log("=== ORDER CREATED ===", order._id);

// // // //     return res.json({
// // // //       success: true,
// // // //       orderId: order._id,
// // // //       transactionReference: result.TransactionReference || merchantReference,
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("confirm error:", err);
// // // //     res.status(500).json({ success: false, error: err.message });
// // // //   }
// // // // });

// // // // module.exports = router;

// // // const express = require("express");
// // // const router = express.Router();
// // // const {
// // //   getServicers,
// // //   rtpOtpValidate,
// // //   rtpOtpConfirm,
// // //   inquiryRequestToPayStatus,
// // // } = require("../controller/orangeMoneyService");
// // // const Order = require("../models/orders");
// // // const Cart = require("../models/cart");
// // // const { v4: uuidv4 } = require("uuid");

// // // // GET /orange/servicers
// // // router.get("/servicers", async (req, res) => {
// // //   try {
// // //     const servicers = await getServicers();
// // //     res.json({ success: true, servicers });
// // //   } catch (err) {
// // //     console.error("=== SERVICERS ERROR ===", err.message);
// // //     res.status(500).json({ success: false, error: err.message });
// // //   }
// // // });

// // // // POST /orange/initiate
// // // router.post("/initiate", async (req, res) => {
// // //   try {
// // //     const { phone, amount, servicerCode } = req.body;
// // //     console.log("=== INITIATE REQUEST ===", { phone, amount, servicerCode });

// // //     if (!phone || !amount || !servicerCode) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         error: "phone, amount, servicerCode مطلوبين",
// // //       });
// // //     }

// // //     const alias = `00962${phone.replace(/^0/, "")}`;
// // //     // const merchantReference = uuidv4();
// // //     const merchantReference = uuidv4().replace(/-/g, "").slice(0, 32);

// // //     console.log("=== INITIATE ALIAS ===", alias);
// // //     console.log("=== INITIATE MERCHANT REF ===", merchantReference);

// // //     const result = await rtpOtpValidate({
// // //       alias,
// // //       aliasType: "MOBL",
// // //       amount,
// // //       servicerCode,
// // //       merchantReference,
// // //     });

// // //     console.log("=== INITIATE RESULT ===", JSON.stringify(result, null, 2));

// // //     if (!result.isSuccess) {
// // //       console.error("=== INITIATE FAILED ===", result.errors);
// // //       return res.status(400).json({
// // //         success: false,
// // //         error: result.errors?.[0]?.description || "فشل إرسال OTP",
// // //       });
// // //     }

// // //     res.json({
// // //       success: true,
// // //       merchantReference,
// // //       message: "تم إرسال OTP على رقمك",
// // //     });
// // //   } catch (err) {
// // //     console.error("=== INITIATE ERROR ===", err.message);
// // //     res.status(500).json({ success: false, error: err.message });
// // //   }
// // // });

// // // // POST /orange/confirm
// // // router.post("/confirm", async (req, res) => {
// // //   try {
// // //     const { phone, amount, servicerCode, merchantReference, otp, orderData } = req.body;
// // //     console.log("=== CONFIRM REQUEST ===", { phone, amount, servicerCode, merchantReference, otp });

// // //     if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
// // //       return res.status(400).json({ success: false, error: "بيانات ناقصة" });
// // //     }

// // //     if (!orderData?.totalPrice) {
// // //       return res.status(400).json({ success: false, error: "orderData.totalPrice مطلوب" });
// // //     }

// // //     if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
// // //       return res.status(400).json({ success: false, error: "orderData.products مطلوب" });
// // //     }

// // //     if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
// // //       return res.status(400).json({ success: false, error: "كل منتج لازم يحتوي priceAtPurchase" });
// // //     }

// // //     const alias = `00962${phone.replace(/^0/, "")}`;

// // //     const result = await rtpOtpConfirm({
// // //       alias,
// // //       aliasType: "MOBL",
// // //       amount,
// // //       servicerCode,
// // //       merchantReference,
// // //       otp,
// // //     });

// // //     console.log("=== CONFIRM RESULT ===", JSON.stringify(result, null, 2));

// // //     if (!result.isSuccess) {
// // //       console.error("=== CONFIRM FAILED ===", result.errors);
// // //       return res.status(400).json({
// // //         success: false,
// // //         error: result.errors?.[0]?.description || "فشل التحقق من OTP",
// // //       });
// // //     }

// // //     // انتظر 3 ثواني وبعدين اعمل inquiry
// // //     console.log("=== WAITING 3 SECONDS FOR INQUIRY ===");
// // //     await new Promise((resolve) => setTimeout(resolve, 3000));

// // //     const statusCheck = await inquiryRequestToPayStatus({ merchantReference });
// // //     console.log("=== INQUIRY RESULT ===", JSON.stringify(statusCheck, null, 2));
// // //     console.log("=== INQUIRY STATUS CODE ===", statusCheck.StatusCode);
// // //     console.log("=== INQUIRY STATUS MESSAGE ===", statusCheck.StatusMessageEn);
// // //     console.log("=== INQUIRY TRANSACTION REF ===", statusCheck.TransactionReference);

// // //     // عمل الأوردر بغض النظر عن الـ inquiry عشان نشوف شو بيرجع
// // //     console.log("=== CREATING ORDER ===");

// // //     const order = await Order.create({
// // //       ...orderData,
// // //       status: "Processing",
// // //       payment: {
// // //         method: "orange_money",
// // //         transactionId: statusCheck.TransactionReference || result.TransactionReference || merchantReference,
// // //         status: "paid",
// // //         paidAt: new Date(),
// // //       },
// // //     });

// // //     await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

// // //     const io = req.app.get("io");
// // //     if (io) io.emit("newOrder", order);

// // //     console.log("=== ORDER CREATED ===", order._id);

// // //     return res.json({
// // //       success: true,
// // //       orderId: order._id,
// // //       transactionReference: statusCheck.TransactionReference || merchantReference,
// // //       inquiryStatus: statusCheck.StatusMessageEn,
// // //     });
// // //   } catch (err) {
// // //     console.error("=== CONFIRM ERROR ===", err.message);
// // //     res.status(500).json({ success: false, error: err.message });
// // //   }
// // // });

// // // module.exports = router;

// // const express = require("express");
// // const router = express.Router();
// // const {
// //   getServicers,
// //   rtpOtpValidate,
// //   rtpOtpConfirm,
// //   inquiryRequestToPayStatus,
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
// //     console.error("=== SERVICERS ERROR ===", err.message);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // // POST /orange/initiate
// // router.post("/initiate", async (req, res) => {
// //   try {
// //     const { phone, amount, servicerCode } = req.body;
// //     console.log("=== INITIATE REQUEST ===", { phone, amount, servicerCode });

// //     if (!phone || !amount || !servicerCode) {
// //       return res.status(400).json({
// //         success: false,
// //         error: "phone, amount, servicerCode مطلوبين",
// //       });
// //     }

// //     const alias = `00962${phone.replace(/^0/, "")}`;
// //     const merchantReference = uuidv4().replace(/-/g, "").slice(0, 32);

// //     console.log("=== INITIATE ALIAS ===", alias);
// //     console.log("=== INITIATE MERCHANT REF ===", merchantReference);

// //     const result = await rtpOtpValidate({
// //       alias,
// //       aliasType: "MOBL",
// //       amount,
// //       servicerCode,
// //       merchantReference,
// //     });

// //     console.log("=== INITIATE RESULT ===", JSON.stringify(result, null, 2));

// //     if (!result.isSuccess) {
// //       console.error("=== INITIATE FAILED ===", result.errors);
// //       return res.status(400).json({
// //         success: false,
// //         error: result.errors?.[0]?.description || "فشل إرسال OTP",
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       merchantReference,
// //       message: "تم إرسال OTP على رقمك",
// //     });
// //   } catch (err) {
// //     console.error("=== INITIATE ERROR ===", err.message);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // // POST /orange/confirm
// // router.post("/confirm", async (req, res) => {
// //   try {
// //     const { phone, amount, servicerCode, merchantReference, otp, orderData } = req.body;
// //     console.log("=== CONFIRM REQUEST ===", { phone, amount, servicerCode, merchantReference, otp });

// //     if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
// //       return res.status(400).json({ success: false, error: "بيانات ناقصة" });
// //     }

// //     if (!orderData?.totalPrice) {
// //       return res.status(400).json({ success: false, error: "orderData.totalPrice مطلوب" });
// //     }

// //     if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
// //       return res.status(400).json({ success: false, error: "orderData.products مطلوب" });
// //     }

// //     if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
// //       return res.status(400).json({ success: false, error: "كل منتج لازم يحتوي priceAtPurchase" });
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

// //     console.log("=== CONFIRM RESULT ===", JSON.stringify(result, null, 2));

// //     if (!result.isSuccess) {
// //       console.error("=== CONFIRM FAILED ===", result.errors);
// //       return res.status(400).json({
// //         success: false,
// //         error: result.errors?.[0]?.description || "فشل التحقق من OTP",
// //       });
// //     }

// //     // انتظر 3 ثواني وبعدين اعمل inquiry
// //     console.log("=== WAITING 3 SECONDS FOR INQUIRY ===");
// //     await new Promise((resolve) => setTimeout(resolve, 3000));

// //     const statusCheck = await inquiryRequestToPayStatus({ merchantReference });
// //     console.log("=== INQUIRY RESULT ===", JSON.stringify(statusCheck, null, 2));

// //     // ✅ الإصلاح الرئيسي: نزع payment من orderData عشان ما يـoverride الـ payment الصحيح
// //     const { payment: _ignored, ...cleanOrderData } = orderData;

// //     const order = await Order.create({
// //       ...cleanOrderData,
// //       status: "Processing",
// //       payment: {
// //         method: "orange_money",
// //         transactionId:
// //           statusCheck.TransactionReference ||
// //           result.TransactionReference ||
// //           merchantReference,
// //         status: "paid",
// //         paidAt: new Date(),
// //       },
// //     });

// //     // ✅ الإصلاح الرئيسي: populate الأوردر قبل ما نبعته على الـ socket
// //     // بدونه الداش بورد ما بيعرف يعرض المنتجات والزبون وبتصير بيضا
// //     const populatedOrder = await order.populate([
// //       { path: "products.productId" },
// //       { path: "userId" },
// //       { path: "shippingAddress" },
// //     ]);

// //     await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

// //     const io = req.app.get("io");
// //     if (io) io.emit("newOrder", populatedOrder);

// //     console.log("=== ORDER CREATED ===", order._id);

// //     return res.json({
// //       success: true,
// //       orderId: order._id,
// //       transactionReference:
// //         statusCheck.TransactionReference || merchantReference,
// //       inquiryStatus: statusCheck.StatusMessageEn,
// //     });
// //   } catch (err) {
// //     console.error("=== CONFIRM ERROR ===", err.message);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // module.exports = router;

// // const express = require("express");
// // const router = express.Router();
// // const {
// //   getServicers,
// //   rtpOtpValidate,
// //   rtpOtpConfirm,
// //   inquiryRequestToPayStatus,
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
// //     console.error("=== SERVICERS ERROR ===", err.message);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // // POST /orange/initiate
// // router.post("/initiate", async (req, res) => {
// //   try {
// //     const { phone, amount, servicerCode } = req.body;
// //     console.log("=== INITIATE REQUEST ===", { phone, amount, servicerCode });

// //     if (!phone || !amount || !servicerCode) {
// //       return res.status(400).json({
// //         success: false,
// //         error: "phone, amount, servicerCode مطلوبين",
// //       });
// //     }

// //     const alias = `00962${phone.replace(/^0/, "")}`;
// //     const merchantReference = uuidv4().replace(/-/g, "").slice(0, 32);

// //     console.log("=== INITIATE ALIAS ===", alias);
// //     console.log("=== INITIATE MERCHANT REF ===", merchantReference);

// //     const result = await rtpOtpValidate({
// //       alias,
// //       aliasType: "MOBL",
// //       amount,
// //       servicerCode,
// //       merchantReference,
// //     });

// //     console.log("=== INITIATE RESULT ===", JSON.stringify(result, null, 2));

// //     if (!result.isSuccess) {
// //       console.error("=== INITIATE FAILED ===", result.errors);
// //       return res.status(400).json({
// //         success: false,
// //         error: result.errors?.[0]?.description || "فشل إرسال OTP",
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       merchantReference,
// //       message: "تم إرسال OTP على رقمك",
// //     });
// //   } catch (err) {
// //     console.error("=== INITIATE ERROR ===", err.message);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // // POST /orange/confirm
// // router.post("/confirm", async (req, res) => {
// //   try {
// //     const { phone, amount, servicerCode, merchantReference, otp, orderData } = req.body;
// //     console.log("=== CONFIRM REQUEST ===", { phone, amount, servicerCode, merchantReference, otp });

// //     // ─── التحقق من البيانات الأساسية ───────────────────────────────────────
// //     if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
// //       return res.status(400).json({ success: false, error: "بيانات ناقصة" });
// //     }

// //     if (!orderData?.totalPrice) {
// //       return res.status(400).json({ success: false, error: "orderData.totalPrice مطلوب" });
// //     }

// //     if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
// //       return res.status(400).json({ success: false, error: "orderData.products مطلوب" });
// //     }

// //     if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
// //       return res.status(400).json({ success: false, error: "كل منتج لازم يحتوي priceAtPurchase" });
// //     }

// //     // ─── إرسال OTP للأورنج ─────────────────────────────────────────────────
// //     const alias = `00962${phone.replace(/^0/, "")}`;

// //     const result = await rtpOtpConfirm({
// //       alias,
// //       aliasType: "MOBL",
// //       amount,
// //       servicerCode,
// //       merchantReference,
// //       otp,
// //     });

// //     console.log("=== CONFIRM RESULT ===", JSON.stringify(result, null, 2));

// //     // التحقق من نجاح الـ request على مستوى الشبكة
// //     if (!result.isSuccess) {
// //       console.error("=== CONFIRM FAILED ===", result.errors);
// //       return res.status(400).json({
// //         success: false,
// //         error: result.errors?.[0]?.description || "فشل التحقق من OTP",
// //       });
// //     }

// //     // ─── انتظر 3 ثواني ثم تحقق من حالة الدفع الفعلية ─────────────────────
// //     console.log("=== WAITING 3 SECONDS FOR INQUIRY ===");
// //     await new Promise((resolve) => setTimeout(resolve, 3000));

// //     const statusCheck = await inquiryRequestToPayStatus({ merchantReference });
// //     console.log("=== INQUIRY RESULT ===", JSON.stringify(statusCheck, null, 2));

// //     // ─── ✅ الإصلاح الرئيسي: التحقق من الحالة الفعلية للدفع ───────────────
// //     // الأورنج قد يرجع isSuccess: true للـ request حتى لو OTP غلط
// //     // الحالة الحقيقية موجودة في الـ inquiry
// //     const SUCCESS_STATUSES = ["Success", "Successful", "SUCCESS", "Paid", "PAID", "Approved", "APPROVED"];

// //     const isActuallyPaid =
// //       SUCCESS_STATUSES.includes(statusCheck?.StatusMessageEn) ||
// //       SUCCESS_STATUSES.includes(statusCheck?.Status) ||
// //       SUCCESS_STATUSES.includes(statusCheck?.StatusMessage) ||
// //       statusCheck?.StatusCode === "000" ||
// //       statusCheck?.StatusCode === "00";

// //     console.log("=== IS ACTUALLY PAID ===", isActuallyPaid);
// //     console.log("=== STATUS MESSAGE EN ===", statusCheck?.StatusMessageEn);
// //     console.log("=== STATUS CODE ===", statusCheck?.StatusCode);

// //     if (!isActuallyPaid) {
// //       console.error("=== PAYMENT NOT CONFIRMED BY INQUIRY ===", statusCheck);
// //       return res.status(400).json({
// //         success: false,
// //         error:
// //           statusCheck?.StatusMessageAr ||
// //           statusCheck?.StatusMessageEn ||
// //           "رمز OTP غير صحيح أو انتهت صلاحيته",
// //       });
// //     }

// //     // ─── إنشاء الأوردر بعد التأكد من نجاح الدفع ──────────────────────────
// //     // نزع payment من orderData عشان ما يـoverride الـ payment الصحيح
// //     const { payment: _ignored, ...cleanOrderData } = orderData;

// //     const order = await Order.create({
// //       ...cleanOrderData,
// //       status: "Processing",
// //       payment: {
// //         method: "orange_money",
// //         transactionId:
// //           statusCheck.TransactionReference ||
// //           result.TransactionReference ||
// //           merchantReference,
// //         status: "paid",
// //         paidAt: new Date(),
// //       },
// //     });

// //     // populate الأوردر قبل إرساله على الـ socket
// //     const populatedOrder = await order.populate([
// //       { path: "products.productId" },
// //       { path: "userId" },
// //       { path: "shippingAddress" },
// //     ]);

// //     await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

// //     const io = req.app.get("io");
// //     if (io) io.emit("newOrder", populatedOrder);

// //     console.log("=== ORDER CREATED ===", order._id);

// //     return res.json({
// //       success: true,
// //       orderId: order._id,
// //       transactionReference:
// //         statusCheck.TransactionReference || merchantReference,
// //       inquiryStatus: statusCheck.StatusMessageEn,
// //     });
// //   } catch (err) {
// //     console.error("=== CONFIRM ERROR ===", err.message);
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
//   inquiryRequestToPayStatus,
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
//     console.error("=== SERVICERS ERROR ===", err.message);
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
//     const merchantReference = uuidv4().replace(/-/g, "").slice(0, 32);

//     console.log("=== INITIATE ALIAS ===", alias);
//     console.log("=== INITIATE MERCHANT REF ===", merchantReference);

//     const result = await rtpOtpValidate({
//       alias,
//       aliasType: "MOBL",
//       amount,
//       servicerCode,
//       merchantReference,
//     });

//     console.log("=== INITIATE RESULT ===", JSON.stringify(result, null, 2));

//     if (!result.isSuccess) {
//       console.error("=== INITIATE FAILED ===", result.errors);
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
//     console.error("=== INITIATE ERROR ===", err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // POST /orange/confirm
// router.post("/confirm", async (req, res) => {
//   try {
//     const { phone, amount, servicerCode, merchantReference, otp, orderData } = req.body;
//     console.log("=== CONFIRM REQUEST ===", { phone, amount, servicerCode, merchantReference, otp });

//     // ─── التحقق من البيانات الأساسية ───────────────────────────────────────
//     if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
//       return res.status(400).json({ success: false, error: "بيانات ناقصة" });
//     }

//     if (!orderData?.totalPrice) {
//       return res.status(400).json({ success: false, error: "orderData.totalPrice مطلوب" });
//     }

//     if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
//       return res.status(400).json({ success: false, error: "orderData.products مطلوب" });
//     }

//     if (!orderData.products.every((p) => p.priceAtPurchase != null)) {
//       return res.status(400).json({ success: false, error: "كل منتج لازم يحتوي priceAtPurchase" });
//     }

//     // ─── إرسال OTP للأورنج ─────────────────────────────────────────────────
//     const alias = `00962${phone.replace(/^0/, "")}`;

//     const result = await rtpOtpConfirm({
//       alias,
//       aliasType: "MOBL",
//       amount,
//       servicerCode,
//       merchantReference,
//       otp,
//     });

//     console.log("=== CONFIRM RESULT ===", JSON.stringify(result, null, 2));

//     // التحقق من نجاح الـ request على مستوى الشبكة
//     if (!result.isSuccess) {
//       console.error("=== CONFIRM FAILED ===", result.errors);
//       return res.status(400).json({
//         success: false,
//         error: result.errors?.[0]?.description || "فشل التحقق من OTP",
//       });
//     }

//     // ─── انتظر 3 ثواني ثم تحقق من حالة الدفع الفعلية ─────────────────────
//     console.log("=== WAITING 3 SECONDS FOR INQUIRY ===");
//     await new Promise((resolve) => setTimeout(resolve, 3000));

//     const statusCheck = await inquiryRequestToPayStatus({ merchantReference });
//     console.log("=== INQUIRY RESULT ===", JSON.stringify(statusCheck, null, 2));

//     // ─── ✅ الإصلاح الرئيسي: التحقق من الحالة الفعلية للدفع ───────────────
//     // الأورنج بيرجع isSuccess: true للـ request حتى لو OTP غلط (مؤكد من اللوقز الفعلية)
//     // الحالة الحقيقية هي StatusCode: 2 / StatusMessageEn: "Paid" تحديداً
//     // أي StatusCode تاني (مثلاً 61 = Invalid OTP) يعني الدفع ما تم فعلياً
//     const isActuallyPaid =
//       statusCheck?.StatusCode === 2 &&
//       statusCheck?.StatusMessageEn === "Paid";

//     console.log("=== IS ACTUALLY PAID ===", isActuallyPaid);
//     console.log("=== STATUS MESSAGE EN ===", statusCheck?.StatusMessageEn);
//     console.log("=== STATUS CODE ===", statusCheck?.StatusCode);

//     if (!isActuallyPaid) {
//       console.error("=== PAYMENT NOT CONFIRMED BY INQUIRY ===", statusCheck);
//       return res.status(400).json({
//         success: false,
//         error:
//           statusCheck?.StatusMessageAr ||
//           statusCheck?.StatusMessageEn ||
//           "رمز OTP غير صحيح أو انتهت صلاحيته",
//       });
//     }

//     // ─── إنشاء الأوردر بعد التأكد من نجاح الدفع ──────────────────────────
//     // نزع payment من orderData عشان ما يـoverride الـ payment الصحيح
//     const { payment: _ignored, ...cleanOrderData } = orderData;

//     const order = await Order.create({
//       ...cleanOrderData,
//       status: "Processing",
//       payment: {
//         method: "orange_money",
//         transactionId:
//           statusCheck.TransactionReference ||
//           result.TransactionReference ||
//           merchantReference,
//         status: "paid",
//         paidAt: new Date(),
//       },
//     });

//     // populate الأوردر قبل إرساله على الـ socket
//     const populatedOrder = await order.populate([
//       { path: "products.productId" },
//       { path: "userId" },
//       { path: "shippingAddress" },
//     ]);

//     await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

//     const io = req.app.get("io");
//     if (io) io.emit("newOrder", populatedOrder);

//     console.log("=== ORDER CREATED ===", order._id);

//     return res.json({
//       success: true,
//       orderId: order._id,
//       transactionReference:
//         statusCheck.TransactionReference || merchantReference,
//       inquiryStatus: statusCheck.StatusMessageEn,
//     });
//   } catch (err) {
//     console.error("=== CONFIRM ERROR ===", err.message);
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
  inquiryRequestToPayStatus,
} = require("../controller/orangeMoneyService");
const Order = require("../models/orders");
const Cart = require("../models/cart");
const { v4: uuidv4 } = require("uuid");

const ORANGE_MIN_AMOUNT = 15; // الحد الأدنى للدفع عبر Orange Money

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

    // ✅ التحقق من الحد الأدنى للمبلغ (حماية من تحايل الفرونت)
    if (parseFloat(amount) < ORANGE_MIN_AMOUNT) {
      return res.status(400).json({
        success: false,
        error: `الحد الأدنى للدفع عبر Orange Money هو ${ORANGE_MIN_AMOUNT} دينار`,
      });
    }

    const alias = `00962${phone.replace(/^0/, "")}`;
    const merchantReference = uuidv4().replace(/-/g, "").slice(0, 32);

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

    // ─── التحقق من البيانات الأساسية ───────────────────────────────────────
    if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
      return res.status(400).json({ success: false, error: "بيانات ناقصة" });
    }

    // ✅ التحقق من الحد الأدنى هون كمان (حماية مزدوجة)
    if (parseFloat(amount) < ORANGE_MIN_AMOUNT) {
      return res.status(400).json({
        success: false,
        error: `الحد الأدنى للدفع عبر Orange Money هو ${ORANGE_MIN_AMOUNT} دينار`,
      });
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

    // ─── إرسال OTP للأورنج ─────────────────────────────────────────────────
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

    // ─── انتظر 3 ثواني ثم تحقق من حالة الدفع الفعلية ─────────────────────
    console.log("=== WAITING 3 SECONDS FOR INQUIRY ===");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const statusCheck = await inquiryRequestToPayStatus({ merchantReference });
    console.log("=== INQUIRY RESULT ===", JSON.stringify(statusCheck, null, 2));

    // ─── التحقق من الحالة الفعلية للدفع ───────────────────────────────────
    // StatusCode: 2 + StatusMessageEn: "Paid" = الدفع تم فعلاً (مؤكد من اللوقز)
    const isActuallyPaid =
      statusCheck?.StatusCode === 2 &&
      statusCheck?.StatusMessageEn === "Paid";

    console.log("=== IS ACTUALLY PAID ===", isActuallyPaid);
    console.log("=== STATUS MESSAGE EN ===", statusCheck?.StatusMessageEn);
    console.log("=== STATUS CODE ===", statusCheck?.StatusCode);

    if (!isActuallyPaid) {
      console.error("=== PAYMENT NOT CONFIRMED BY INQUIRY ===", statusCheck);
      return res.status(400).json({
        success: false,
        error:
          statusCheck?.StatusMessageAr ||
          statusCheck?.StatusMessageEn ||
          "رمز OTP غير صحيح أو انتهت صلاحيته",
      });
    }

    // ─── إنشاء الأوردر بعد التأكد من نجاح الدفع ──────────────────────────
    const { payment: _ignored, ...cleanOrderData } = orderData;

    const order = await Order.create({
      ...cleanOrderData,
      status: "Processing",
      payment: {
        method: "orange_money",
        transactionId:
          statusCheck.TransactionReference ||
          result.TransactionReference ||
          merchantReference,
        status: "paid",
        paidAt: new Date(),
      },
    });

    const populatedOrder = await order.populate([
      { path: "products.productId" },
      { path: "userId" },
      { path: "shippingAddress" },
    ]);

    await Cart.findOneAndUpdate({ userId: orderData.userId }, { products: [] });

    const io = req.app.get("io");
    if (io) io.emit("newOrder", populatedOrder);

    console.log("=== ORDER CREATED ===", order._id);

    return res.json({
      success: true,
      orderId: order._id,
      transactionReference:
        statusCheck.TransactionReference || merchantReference,
      inquiryStatus: statusCheck.StatusMessageEn,
    });
  } catch (err) {
    console.error("=== CONFIRM ERROR ===", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
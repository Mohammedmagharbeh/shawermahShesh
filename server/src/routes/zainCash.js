<<<<<<< HEAD
// // const express = require("express");
// // const {
// //   initiatePayment,
// //   confirmPayment,
// // } = require("../controller/zainCash.js");

// // const router = express.Router();

// // router.post("/zain/initiate", async (req, res) => {
// //   try {
// //     const { amount, mobile } = req.body;
// //     console.log('init zain');
    
// //     const result = await initiatePayment({ amount, mobile });

// //     return res.json(result);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: "OTP initiation failed" });
// //   }
// // });

// // router.post("/zain/confirm", async (req, res) => {
// //   try {
// //     const { amount, mobile, otp } = req.body;

// //     const result = await confirmPayment({
// //       amount,
// //       mobile,
// //       otp,
// //     });

// //     return res.json(result);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: "Payment failed" });
// //   }
// // });

// // module.exports = router;

// const express = require("express");
// const router = express.Router();
// const { initiatePayment, confirmPayment } = require("../controller/zainCash");

// // مسار بدء الدفع (ارسال OTP)
// router.post("/zain/initiate", async (req, res) => {
//   try {
//     const { amount, mobile } = req.body;

//     if (!amount || !mobile) {
//       return res.status(400).json({ message: "المبلغ ورقم الهاتف مطلوبان" });
//     }

//     const result = await initiatePayment({ amount, mobile });

//     // فحص إذا كان رد زين كاش يحتوي على خطأ في المعالجة
//     if (result.ResultType === "Error") {
//       return res.status(400).json({ 
//         message: "فشل في إرسال الرمز", 
//         detail: result.Description || result.ErrorMsg 
//       });
//     }

//     return res.json(result);
//   } catch (error) {
//     console.error("Initiate Route Error:", error.message);
//     res.status(500).json({ 
//       message: "OTP initiation failed", 
//       error: error.response?.data || error.message 
//     });
//   }
// });

// // مسار تأكيد الدفع (ادخال OTP)
// router.post("/zain/confirm", async (req, res) => {
//   try {
//     const { amount, mobile, otp, note } = req.body;

//     if (!otp) {
//       return res.status(400).json({ message: "رمز التحقق (OTP) مطلوب" });
//     }

//     const result = await confirmPayment({ amount, mobile, otp, note });

//     if (result.ResultType === "Error") {
//       return res.status(400).json({ 
//         message: "فشل تأكيد عملية الدفع", 
//         detail: result.Description || result.ErrorMsg 
//       });
//     }

//     return res.json(result);
//   } catch (error) {
//     console.error("Confirm Route Error:", error.message);
//     res.status(500).json({ 
//       message: "Payment confirmation failed", 
//       error: error.response?.data || error.message 
//     });
//   }
// });

// module.exports = router;


// const express = require("express");
// const {
//   initiatePayment,
//   triggerPayment,
// } = require("../controller/zainCash.js");

// // مسار بدء الدفع (طلب الرمز)
// const router = express.Router();

// // Route 1: Initiate — sends OTP to customer's phone
// router.post("/zain/initiate", async (req, res) => {
//   try {
//     console.log(req.body);

//     const { amount, mobile } = req.body;

//     if (!amount || !mobile) {
//       return res
//         .status(400)
//         .json({ message: "Amount and mobile number are required" });
//     }

//     const result = await initiatePayment({ amount, mobile });

//     // فحص إذا كان هناك خطأ منطقي من زين كاش (مثل رقم غير مسجل)
//     if (result.ResultType === "Error") {
//       return res.status(400).json({ 
//         message: "فشل في إرسال الرمز", 
//         detail: result.Description || result.ErrorMsg 

//     // Inspect Zain's error object
//     if (
//       result?.ErrorObj?.ResultType === "Error" ||
//       (result?.ErrorObj?.ErrorCode && result.ErrorObj.ErrorCode !== "Success")
//     ) {
//       return res.status(400).json({
//         message: "Failed to send OTP",
//         detail: result?.ErrorObj?.ErrorMessage || "Unknown error",
//         raw: result,
//       });
//     }

//     return res.json({ success: true, data: result });
//   } catch (error) {
//     res.status(500).json({ 
//       message: "Server Error during initiation", 
//       error: error.response?.data || error.message 
//     console.error("[ZainCash] Initiate Route Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     return res.status(500).json({
//       message: "OTP initiation failed",
//       error: error.response?.data || error.message,
//     });
//   }
// });

// // مسار تأكيد الدفع (تنفيذ العملية)
// // Route 2: Confirm — customer submits OTP, money moves
// router.post("/zain/confirm", async (req, res) => {
//   try {
//     const { amount, mobile, otp, orderId } = req.body;

//     if (!otp || !amount || !mobile) {
//       return res.status(400).json({ message: "جميع الحقول (المبلغ، الرقم، الرمز) مطلوبة" });
//     if (!amount || !mobile || !otp) {
//       return res
//         .status(400)
//         .json({ message: "Amount, mobile, and OTP are required" });
//     }

//     const result = await triggerPayment({
//       amount,
//       mobile,
//       otp,
//       note: orderId ? `Order #${orderId}` : "ShawarmaShee sh Order",
//       orderId,
//     });

//     if (
//       result?.ErrorObj?.ResultType === "Error" ||
//       (result?.ErrorObj?.ErrorCode && result.ErrorObj.ErrorCode !== "Success")
//     ) {
//       return res.status(400).json({
//         message: "Payment failed",
//         detail: result?.ErrorObj?.ErrorMessage || "Unknown error",
//         raw: result,
//       });
//     }

//     const refId = result?.RefID || null;

//     return res.json({ success: true, refId, data: result });
//   } catch (error) {
//     res.status(500).json({ 
//       message: "Server Error during confirmation", 
//       error: error.response?.data || error.message 
//     console.error("[ZainCash] Confirm Route Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     return res.status(500).json({
//       message: "Payment confirmation failed",
//       error: error.response?.data || error.message,
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const {
  initiatePayment,
  triggerPayment,
} = require("../controller/zainCash.js");

const router = express.Router();

// Route 1: Initiate — sends OTP to customer's phone
router.post("/zain/initiate", async (req, res) => {
  try {
    const { amount, mobile } = req.body;

    // التحقق من المدخلات
    if (!amount || !mobile) {
      return res
        .status(400)
        .json({ message: "المبلغ ورقم الهاتف مطلوبان (Amount and mobile are required)" });
    }

    const result = await initiatePayment({ amount, mobile });

    // فحص أخطاء زين كاش بناءً على الرد المتوقع
    if (
      result?.ErrorObj?.ResultType === "Error" ||
      (result?.ErrorObj?.ErrorCode && result.ErrorObj.ErrorCode !== "Success") ||
      result.ResultType === "Error"
    ) {
      return res.status(400).json({
        message: "فشل في إرسال الرمز (Failed to send OTP)",
        detail: result?.ErrorObj?.ErrorMessage || result.Description || result.ErrorMsg || "Unknown error",
        raw: result,
      });
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("[ZainCash] Initiate Route Error:", {
      message: error.message,
      response: error.response?.data,
    });
    return res.status(500).json({
      message: "خطأ في السيرفر أثناء بدء العملية",
      error: error.response?.data || error.message,
    });
  }
});

// Route 2: Confirm — customer submits OTP, money moves
router.post("/zain/confirm", async (req, res) => {
  try {
    const { amount, mobile, otp, orderId } = req.body;

    // التحقق من المدخلات
    if (!amount || !mobile || !otp) {
      return res.status(400).json({ 
        message: "جميع الحقول (المبلغ، الرقم، الرمز) مطلوبة" 
      });
    }

    const result = await triggerPayment({
      amount,
      mobile,
      otp,
      note: orderId ? `Order #${orderId}` : "Order Payment",
      orderId,
    });

    // فحص نجاح العملية من طرف زين كاش
    if (
      result?.ErrorObj?.ResultType === "Error" ||
      (result?.ErrorObj?.ErrorCode && result.ErrorObj.ErrorCode !== "Success")
    ) {
      return res.status(400).json({
        message: "فشلت عملية الدفع (Payment failed)",
        detail: result?.ErrorObj?.ErrorMessage || "Unknown error",
        raw: result,
      });
    }

    const refId = result?.RefID || null;
    return res.json({ success: true, refId, data: result });
  } catch (error) {
    console.error("[ZainCash] Confirm Route Error:", {
      message: error.message,
      response: error.response?.data,
    });
    return res.status(500).json({
      message: "خطأ في السيرفر أثناء تأكيد الدفع",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
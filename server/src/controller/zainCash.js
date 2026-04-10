<<<<<<< HEAD
// // const axios= require("axios");

// // const ZAIN_URL = process.env.ZAIN_BASE_URL;

// // function baseRequest(serviceId, body) {
// //   return {
// //     ...body,
// //     GeneralData: {
// //       LanguageID: "English",
// //       TerminalShopID: "1",
// //       TerminalUserID: "1",
// //     },
// //     AuthenticationData: {
// //       ServiceID: serviceId,
// //       UserName: process.env.ZAIN_API_USERNAME,
// //       Password: process.env.ZAIN_API_PASSWORD,
// //     },
// //   };
// // }

// // exports.initiatePayment = async ({ amount, mobile })=> {
// //   const payload = baseRequest("1000000013", {
// //     ZCInitMerchDebitReq: {
// //       Amount: amount,
// //       MSISDN962: mobile,
// //     },
// //   });
// //     console.log(process.env.ZAIN_BASE_URL);

// //   const response = await axios.post(ZAIN_URL, payload);
// //   console.log(response.data);
  
// //   return response.data;
// // }

// // exports.confirmPayment = async({ amount, mobile, otp, note }) => {
// //   const payload = baseRequest("1000000014", {
// //     req: {
// //       Amount: amount,
// //       CUSTMSISDN962: mobile,
// //       CustOTP: otp,
// //       MerchPIN: process.env.ZAIN_SERVICE_PIN,
// //       MerchServiceName: process.env.ZAIN_SERVICE_NAME,
// //       Note: note || "Payment via CLIQ",
// //     },
// //   });

// //   const response = await axios.post(ZAIN_URL, payload);
// //   return response.data;
// // }

// const axios = require("axios");

// // تأكد أن الرابط في الـ .env هو: 
// // https://zcstgpublic.jo.zain.com:5001/ZCPublicVPNAPI.svc
// const ZAIN_URL = process.env.ZAIN_BASE_URL;

// /**
//  * دالة بناء الطلب الأساسي الموحدة لـ V3
//  * تضمن إرسال البيانات بالتنسيق الذي يتوقعه السيرفر
//  */
// function baseRequest(serviceId, body) {
//   return {
//     ...body,
//     GeneralData: {
//       LanguageID: "English",
//       TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
//       TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
//     },
//     // ملاحظة: V3 تتطلب "Auth" وليس "AuthenticationData"
//     Auth: {
//       ServiceID: serviceId,
//       UserName: process.env.ZAIN_API_USERNAME,
//       Password: process.env.ZAIN_API_PASSWORD,
//     },
//   };
// }

// // 1. بدء عملية الدفع وإرسال الـ OTP للعميل
// exports.initiatePayment = async ({ amount, mobile }) => {
//   try {
//     const fullUrl = `${ZAIN_URL}/ZCInitiateMerchDebitPayByMerch`;
    
//     // تنسيق رقم الهاتف ليصبح 12 خانة (9627XXXXXXXX)
//     let formattedMobile = mobile.trim().replace(/\D/g, ''); // إزالة أي رموز غير الأرقام
//     if (formattedMobile.startsWith('0')) {
//       formattedMobile = `962${formattedMobile.slice(1)}`;
//     } else if (!formattedMobile.startsWith('962')) {
//       formattedMobile = `962${formattedMobile}`;
//     }

//     const payload = baseRequest("1000000013", {
//       ZCInitMerchDebitReq: {
//         Amount: amount.toString(),
//         MSISDN962: formattedMobile,
//       },
//     });

//     console.log("Sending to ZainCash (Initiate):", JSON.stringify(payload, null, 2));

//     const response = await axios.post(fullUrl, payload, {
//       headers: { 'Content-Type': 'application/json' }
//     });
    
//     return response.data;
//   } catch (error) {
//     // طباعة الخطأ الحقيقي في Terminal السيرفر
//     console.error("ZainCash API Error (Initiate):", error.response?.data || error.message);
//     throw error;
//   }
// };

// // 2. تأكيد عملية الدفع باستخدام الـ OTP
// exports.confirmPayment = async ({ amount, mobile, otp, note }) => {
//   try {
//     const fullUrl = `${ZAIN_URL}/ZCMerchDebitTrigerPayment`;
    
//     let formattedMobile = mobile.trim().replace(/\D/g, '');
//     if (formattedMobile.startsWith('0')) {
//       formattedMobile = `962${formattedMobile.slice(1)}`;
//     }

//     const payload = baseRequest("1000000014", {
//       req: {
//         Amount: amount.toString(),
//         CUSTMSISDN962: formattedMobile,
//         CustOTP: otp,
//         MerchPIN: process.env.ZAIN_SERVICE_PIN,
//         MerchServiceName: process.env.ZAIN_SERVICE_NAME,
//         Note: note || "Order Payment",
//       },
//     });

//     console.log("Sending to ZainCash (Confirm):", JSON.stringify(payload, null, 2));

//     const response = await axios.post(fullUrl, payload, {
//       headers: { 'Content-Type': 'application/json' }
//     });
    
//     return response.data;
//   } catch (error) {
//     console.error("ZainCash API Error (Confirm):", error.response?.data || error.message);
//     throw error;
//   }
// };


// const axios = require("axios");
// const https = require("https");

// // الرابط الأساسي من ملف الـ .env
// const ZAIN_URL = process.env.ZAIN_BASE_URL;

// /**
//  * دالة بناء الطلب الأساسي الموحدة لـ V3 الأردن
//  */
// function baseRequest(serviceId, body) {
//   return {
//     ...body,
//     GeneralData: {
//       LanguageID: "English",
//       TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
//       TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
//     },
//     AuthenticationData: {
//       ServiceID: serviceId,
//       UserName: process.env.ZAIN_API_USERNAME,
//       Password: process.env.ZAIN_API_PASSWORD,
//     },
//   };
// }

// // 1. بدء عملية الدفع (إرسال الـ OTP)
// exports.initiatePayment = async ({ amount, mobile }) => {
//   try {
//     // التعديل الجوهري: إضافة الـ Operation كـ Query Parameter
//     const fullUrl = `${ZAIN_URL}?op=ZCInitiateMerchDebitPayByMerch`;

//     // تنسيق رقم الهاتف ليصبح 9627XXXXXXXX
//     let formattedMobile = mobile.trim().replace(/\D/g, '');
//     if (formattedMobile.startsWith('0')) {
//       formattedMobile = `962${formattedMobile.slice(1)}`;
//     } else if (!formattedMobile.startsWith('962')) {
//       formattedMobile = `962${formattedMobile}`;
//     }
// // Staging may return self-signed cert — rejectUnauthorized: false for staging only;
// // set to true (or remove agent) in production.
// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// const generalData = {
//   LanguageID: "English",
//   TerminalShopID: "1",
//   TerminalUserID: "1",
// };

// function buildAuth(serviceId) {
//   return {
//     ServiceID: String(serviceId),
//     UserName: process.env.ZAIN_API_USERNAME,
//     Password: process.env.ZAIN_API_PASSWORD,
//   };
// }

// /** Normalize mobile → 962XXXXXXXXX */
// function formatMobile(mobile) {
//   const clean = (mobile || "").replace(/\s+/g, "").replace(/-/g, "");
//   if (clean.startsWith("962")) return clean;
//   if (clean.startsWith("0")) return "962" + clean.slice(1);
//   return "962" + clean;
// }

// /** Normalize amount → "X.XXX" (3 decimals string) */
// function formatAmount(amount) {
//   return parseFloat(amount).toFixed(3);
// }

// // Step 1: Send OTP to customer's phone
// exports.initiatePayment = async ({ amount, mobile }) => {
//   const url = `${process.env.ZAIN_BASE_URL}/ZCInitiateMerchDebitPayByMerch`;

//   const body = {
//     ZCInitMerchDebitReq: {
//       Amount: formatAmount(amount),
//       MSISDN962: formatMobile(mobile),
//     },
//     GeneralData: generalData,
//     AuthenticationData: buildAuth(1000000013),
//   };

//     console.log("Requesting ZainCash (Initiate):", JSON.stringify(payload, null, 2));

//     const response = await axios.post(fullUrl, payload, {
//       headers: { 'Content-Type': 'application/json' }
//     });

//     return response.data;
//   } catch (error) {
//     console.error("ZainCash API Error (Initiate):", error.response?.data || error.message);
//     throw error;
//   }
// };


// // 2. تأكيد عملية الدفع (بعد إدخال الـ OTP)
// exports.confirmPayment = async ({ amount, mobile, otp, note }) => {
//   try {
//     // التعديل الجوهري: إضافة الـ Operation كـ Query Parameter
//     const fullUrl = `${ZAIN_URL}?op=ZCMerchDebitTrigerPayment`;

//     let formattedMobile = mobile.trim().replace(/\D/g, '');
//     if (formattedMobile.startsWith('0')) {
//       formattedMobile = `962${formattedMobile.slice(1)}`;
//     } else if (!formattedMobile.startsWith('962')) {
//       formattedMobile = `962${formattedMobile}`;
//     }
//   console.log("[ZainCash] initiatePayment URL:", url);
//   console.log("[ZainCash] initiatePayment body:", JSON.stringify(body, null, 2));

//   const response = await axios.post(url, body, {
//     httpsAgent,
//     headers: { "Content-Type": "application/json" },
//     timeout: 30000,
//   });

//   console.log("[ZainCash] initiatePayment response:", response.data);
//   return response.data;
// };

// // Step 2: Execute payment after customer submits OTP
// exports.triggerPayment = async ({ amount, mobile, otp, note, orderId }) => {
//   const url = `${process.env.ZAIN_BASE_URL}/ZCMerchDebitTrigerPaymentV2`;

//   const body = {
//     req: {
//       Amount: formatAmount(amount),
//       CUSTMSISDN962: formatMobile(mobile),
//       CustOTP: otp,
//       MerchPIN: process.env.ZAIN_SERVICE_PIN,
//       MerchServiceName: process.env.ZAIN_SERVICE_NAME,
//       Note: note || "ShawarmaShee sh Order",
//       MerchRefID: orderId || null,
//     },
//     GeneralData: generalData,
//     AuthenticationData: buildAuth(1000000014),
//   };

//     console.log("Requesting ZainCash (Confirm):", JSON.stringify(payload, null, 2));

//     const response = await axios.post(fullUrl, payload, {
//       headers: { 'Content-Type': 'application/json' }
//     });

//     return response.data;
//   } catch (error) {
//     console.error("ZainCash API Error (Confirm):", error.response?.data || error.message);
//     throw error;
//   }
// };
//   console.log("[ZainCash] triggerPayment URL:", url);
//   console.log("[ZainCash] triggerPayment body:", JSON.stringify(body, null, 2));

//   const response = await axios.post(url, body, {
//     httpsAgent,
//     headers: { "Content-Type": "application/json" },
//     timeout: 30000,
//   });

//   console.log("[ZainCash] triggerPayment response:", response.data);
//   return response.data;
// };


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
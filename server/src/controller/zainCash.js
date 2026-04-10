// const axios= require("axios");

// const ZAIN_URL = process.env.ZAIN_BASE_URL;

// function baseRequest(serviceId, body) {
//   return {
//     ...body,
//     GeneralData: {
//       LanguageID: "English",
//       TerminalShopID: "1",
//       TerminalUserID: "1",
//     },
//     AuthenticationData: {
//       ServiceID: serviceId,
//       UserName: process.env.ZAIN_API_USERNAME,
//       Password: process.env.ZAIN_API_PASSWORD,
//     },
//   };
// }

// exports.initiatePayment = async ({ amount, mobile })=> {
//   const payload = baseRequest("1000000013", {
//     ZCInitMerchDebitReq: {
//       Amount: amount,
//       MSISDN962: mobile,
//     },
//   });
//     console.log(process.env.ZAIN_BASE_URL);

//   const response = await axios.post(ZAIN_URL, payload);
//   console.log(response.data);
  
//   return response.data;
// }

// exports.confirmPayment = async({ amount, mobile, otp, note }) => {
//   const payload = baseRequest("1000000014", {
//     req: {
//       Amount: amount,
//       CUSTMSISDN962: mobile,
//       CustOTP: otp,
//       MerchPIN: process.env.ZAIN_SERVICE_PIN,
//       MerchServiceName: process.env.ZAIN_SERVICE_NAME,
//       Note: note || "Payment via CLIQ",
//     },
//   });

//   const response = await axios.post(ZAIN_URL, payload);
//   return response.data;
// }

const axios = require("axios");

// تأكد أن الرابط في الـ .env هو: 
// https://zcstgpublic.jo.zain.com:5001/ZCPublicVPNAPI.svc
const ZAIN_URL = process.env.ZAIN_BASE_URL;

/**
 * دالة بناء الطلب الأساسي الموحدة لـ V3
 * تضمن إرسال البيانات بالتنسيق الذي يتوقعه السيرفر
 */
function baseRequest(serviceId, body) {
  return {
    ...body,
    GeneralData: {
      LanguageID: "English",
      TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
      TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
    },
    // ملاحظة: V3 تتطلب "Auth" وليس "AuthenticationData"
    Auth: {
      ServiceID: serviceId,
      UserName: process.env.ZAIN_API_USERNAME,
      Password: process.env.ZAIN_API_PASSWORD,
    },
  };
}

// 1. بدء عملية الدفع وإرسال الـ OTP للعميل
exports.initiatePayment = async ({ amount, mobile }) => {
  try {
    const fullUrl = `${ZAIN_URL}/ZCInitiateMerchDebitPayByMerch`;
    
    // تنسيق رقم الهاتف ليصبح 12 خانة (9627XXXXXXXX)
    let formattedMobile = mobile.trim().replace(/\D/g, ''); // إزالة أي رموز غير الأرقام
    if (formattedMobile.startsWith('0')) {
      formattedMobile = `962${formattedMobile.slice(1)}`;
    } else if (!formattedMobile.startsWith('962')) {
      formattedMobile = `962${formattedMobile}`;
    }

    const payload = baseRequest("1000000013", {
      ZCInitMerchDebitReq: {
        Amount: amount.toString(),
        MSISDN962: formattedMobile,
      },
    });

    console.log("Sending to ZainCash (Initiate):", JSON.stringify(payload, null, 2));

    const response = await axios.post(fullUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.data;
  } catch (error) {
    // طباعة الخطأ الحقيقي في Terminal السيرفر
    console.error("ZainCash API Error (Initiate):", error.response?.data || error.message);
    throw error;
  }
};

// 2. تأكيد عملية الدفع باستخدام الـ OTP
exports.confirmPayment = async ({ amount, mobile, otp, note }) => {
  try {
    const fullUrl = `${ZAIN_URL}/ZCMerchDebitTrigerPayment`;
    
    let formattedMobile = mobile.trim().replace(/\D/g, '');
    if (formattedMobile.startsWith('0')) {
      formattedMobile = `962${formattedMobile.slice(1)}`;
    }

    const payload = baseRequest("1000000014", {
      req: {
        Amount: amount.toString(),
        CUSTMSISDN962: formattedMobile,
        CustOTP: otp,
        MerchPIN: process.env.ZAIN_SERVICE_PIN,
        MerchServiceName: process.env.ZAIN_SERVICE_NAME,
        Note: note || "Order Payment",
      },
    });

    console.log("Sending to ZainCash (Confirm):", JSON.stringify(payload, null, 2));

    const response = await axios.post(fullUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.data;
  } catch (error) {
    console.error("ZainCash API Error (Confirm):", error.response?.data || error.message);
    throw error;
  }
};
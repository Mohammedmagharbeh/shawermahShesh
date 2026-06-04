// const soap = require("soap");

// // الرابط المحدث لبيئة الـ Production
// // ملاحظة: الـ VPN يجب أن يكون فعلاً نشطاً على السيرفر لكي يعمل هذا الرابط
// const ZAIN_WSDL_URL = process.env.ZAIN_BASE_URL
//   ? process.env.ZAIN_BASE_URL.includes("?")
//     ? process.env.ZAIN_BASE_URL
//     : `${process.env.ZAIN_BASE_URL}?wsdl`
//   : "https://zcstgpublic.jo.zain.com:5001/ZCPublicVPNAPI.svc?wsdl";

// // لتخطي فحص شهادة الأمان لأن الـ IP داخلي (ضروري جداً في الربط مع زين)
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// /**
//  * تنسيق رقم الهاتف ليصبح بالصيغة المطلوبة (9627xxxxxxxx)
//  */
// function formatMobile(mobile) {
//   const clean = (mobile || "").replace(/[\s-]/g, "");
//   if (clean.startsWith("962")) return clean;
//   if (clean.startsWith("0")) return "962" + clean.slice(1);
//   return "962" + clean;
// }

// /**
//  * تنسيق المبلغ ليصبح 3 خانات عشرية كما تطلب زين كاش
//  */
// function formatAmount(amount) {
//   return parseFloat(amount).toFixed(3);
// }

// let _client = null;

// /**
//  * إنشاء أو استرجاع عميل SOAP
//  */
// async function getClient() {
//   if (_client) return _client;
//   console.log("[ZainCash] Creating SOAP client from:", ZAIN_WSDL_URL);

//   try {
//     // تحديد timeout قصير للاتصال (10 ثواني) لكي لا يعلق السيرفر في حال عدم وجود VPN
//     _client = await soap.createClientAsync(ZAIN_WSDL_URL, {
//       connectionTimeout: 10000,
//       timeout: 10000,
//     });
//     // Apply WS‑Security UsernameToken if credentials are provided
//     if (process.env.ZAIN_API_USERNAME && process.env.ZAIN_API_PASSWORD) {
//       try {
//         if (soap.WSSecurity) {
//           const wsSecurity = new soap.WSSecurity(
//             process.env.ZAIN_API_USERNAME,
//             process.env.ZAIN_API_PASSWORD,
//             { passwordType: "PasswordText" },
//           );
//           _client.setSecurity(wsSecurity);
//           console.log(
//             "[ZainCash] WSSecurity (UsernameToken) applied using env credentials.",
//           );
//         } else {
//           console.warn(
//             "[ZainCash] SOAP library does not expose WSSecurity; cannot set authentication.",
//           );
//         }
//       } catch (secError) {
//         console.error(
//           "[ZainCash] Failed to set SOAP security:",
//           secError.message,
//         );
//       }
//     } else {
//       console.warn(
//         "[ZainCash] ZAIN_API_USERNAME or ZAIN_API_PASSWORD not set; proceeding without SOAP auth.",
//       );
//     }
//     return _client;
//   } catch (error) {
//     console.error(
//       "[ZainCash] Failed to create SOAP client. Check VPN connection.",
//     );
//     throw new Error("Could not connect to ZainCash Server (VPN required)");
//   }
// }

// /**
//  * المرحلة الأولى: طلب رمز التحقق (Initiate Payment)
//  */
// exports.initiatePayment = async ({ amount, mobile }) => {
//   const client = await getClient();

//   const requestData = {
//     req: {
//       Amount: formatAmount(amount),
//       MSISDN962: formatMobile(mobile),
//     },
//     generalData: {
//       LanguageID: "English",
//       TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
//       TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
//     },
//     AuthData: {
//       Password: process.env.ZAIN_API_PASSWORD,
//       ServiceID: "ZCInitiateMerchDebitPayByMerch",
//       UserName: process.env.ZAIN_API_USERNAME,
//     },
//   };

//   console.log(
//     "[ZainCash] Initiate Payload:",
//     JSON.stringify(requestData, null, 2),
//   );

//   try {
//     const [result] =
//       await client.ZCInitiateMerchDebitPayByMerchAsync(requestData);
//     console.log(
//       "[ZainCash] Initiate Response:",
//       JSON.stringify(result, null, 2),
//     );
//     return result;
//   } catch (error) {
//     console.error("[ZainCash] SOAP Error (Initiate):", error.message);
//     throw error.Fault
//       ? new Error("SOAP Fault: " + error.Fault.faultstring)
//       : error;
//   }
// };

// /**
//  * المرحلة الثانية: تأكيد الدفع بعد إدخال الـ OTP
//  */
// exports.confirmPayment = async ({ amount, mobile, otp, note }) => {
//   const client = await getClient();

//   const requestData = {
//     req: {
//       Amount: formatAmount(amount),
//       CUSTMSISDN962: formatMobile(mobile),
//       CustOTP: otp,
//       MerchPIN: process.env.ZAIN_SERVICE_PIN, // الـ PIN الذي وصل بالإيميل المنفصل
//       MerchServiceName: process.env.ZAIN_SERVICE_NAME, // القيمة: YASSINCO
//       Note: note || "ShawarmaSheesh Order",
//     },
//     generalData: {
//       LanguageID: "English",
//       TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
//       TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
//     },
//     AuthData: {
//       Password: process.env.ZAIN_API_PASSWORD,
//       ServiceID: "ZCMerchDebitTrigerPayment",
//       UserName: process.env.ZAIN_API_USERNAME,
//     },
//   };

//   console.log(
//     "[ZainCash] Confirm Payload:",
//     JSON.stringify(requestData, null, 2),
//   );

//   try {
//     const [result] = await client.ZCMerchDebitTrigerPaymentAsync(requestData);
//     console.log(
//       "[ZainCash] Confirm Response:",
//       JSON.stringify(result, null, 2),
//     );
//     return result;
//   } catch (error) {
//     console.error("[ZainCash] SOAP Error (Confirm):", error.message);
//     throw error.Fault
//       ? new Error("SOAP Fault: " + error.Fault.faultstring)
//       : error;
//   }
// };


// const soap = require("soap");

// // الرابط المحدث لبيئة الـ Production
// const ZAIN_WSDL_URL = process.env.ZAIN_BASE_URL
//   ? process.env.ZAIN_BASE_URL.includes("?")
//     ? process.env.ZAIN_BASE_URL
//     : `${process.env.ZAIN_BASE_URL}?wsdl`
//   : "https://zcstgpublic.jo.zain.com:5001/ZCPublicVPNAPI.svc?wsdl";

// // لتخطي فحص شهادة الأمان
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// /**
//  * تنسيق رقم الهاتف ليصبح بالصيغة المطلوبة (9627xxxxxxxx)
//  */
// function formatMobile(mobile) {
//   const clean = (mobile || "").replace(/[\s-]/g, "");
//   if (clean.startsWith("962")) return clean;
//   if (clean.startsWith("0")) return "962" + clean.slice(1);
//   return "962" + clean;
// }

// /**
//  * تنسيق المبلغ ليصبح 3 خانات عشرية
//  */
// function formatAmount(amount) {
//   return parseFloat(amount).toFixed(3);
// }

// let _client = null;

// /**
//  * إنشاء أو استرجاع عميل SOAP
//  */
// async function getClient() {
//   if (_client) return _client;
//   console.log("[ZainCash] Creating SOAP client from:", ZAIN_WSDL_URL);

//   try {
//     // تم إزالة WSSecurity لأن المصادقة تتم عبر AuthData في كل طلب
//     _client = await soap.createClientAsync(ZAIN_WSDL_URL, {
//       connectionTimeout: 10000,
//       timeout: 10000,
//     });
//     console.log("[ZainCash] SOAP client created successfully.");
//     return _client;
//   } catch (error) {
//     console.error("[ZainCash] Failed to create SOAP client. Check VPN connection.");
//     throw new Error("Could not connect to ZainCash Server (VPN required)");
//   }
// }

// /**
//  * المرحلة الأولى: طلب رمز التحقق (Initiate Payment)
//  */
// exports.initiatePayment = async ({ amount, mobile }) => {
//   const client = await getClient();

//   const requestData = {
//     req: {
//       Amount: formatAmount(amount),
//       MSISDN962: formatMobile(mobile),
//     },
//     generalData: {
//       LanguageID: "English",
//       TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
//       TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
//     },
//     AuthData: {
//       Password: process.env.ZAIN_API_PASSWORD,
//       ServiceID: "ZCInitiateMerchDebitPayByMerch",
//       UserName: process.env.ZAIN_API_USERNAME,
//     },
//   };

//   console.log("[ZainCash] Initiate Payload:", JSON.stringify(requestData, null, 2));

//   try {
//     const [result] = await client.ZCInitiateMerchDebitPayByMerchAsync(requestData);
//     console.log("[ZainCash] Initiate Response:", JSON.stringify(result, null, 2));
//     return result;
//   } catch (error) {
//     console.error("[ZainCash] SOAP Error (Initiate):", error.message);
//     throw error.Fault ? new Error("SOAP Fault: " + error.Fault.faultstring) : error;
//   }
// };

// /**
//  * المرحلة الثانية: تأكيد الدفع بعد إدخال الـ OTP
//  */
// exports.confirmPayment = async ({ amount, mobile, otp, note }) => {
//   const client = await getClient();

//   const requestData = {
//     req: {
//       Amount: formatAmount(amount),
//       CUSTMSISDN962: formatMobile(mobile),
//       CustOTP: otp,
//       MerchPIN: process.env.ZAIN_SERVICE_PIN,
//       MerchServiceName: process.env.ZAIN_SERVICE_NAME,
//       Note: note || "ShawarmaSheesh Order",
//     },
//     generalData: {
//       LanguageID: "English",
//       TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
//       TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
//     },
//     AuthData: {
//       Password: process.env.ZAIN_API_PASSWORD,
//       ServiceID: "ZCMerchDebitTrigerPayment",
//       UserName: process.env.ZAIN_API_USERNAME,
//     },
//   };

//   console.log("[ZainCash] Confirm Payload:", JSON.stringify(requestData, null, 2));
  

//   try {
//     const [result] = await client.ZCMerchDebitTrigerPaymentAsync(requestData);
//     console.log("[ZainCash] Confirm Response:", JSON.stringify(result, null, 2));
//     return result;
//   } catch (error) {
//     console.error("[ZainCash] SOAP Error (Confirm):", error.message);
//     throw error.Fault ? new Error("SOAP Fault: " + error.Fault.faultstring) : error;
//   }
// };

const soap = require("soap");

const ZAIN_WSDL_URL = process.env.ZAIN_BASE_URL
  ? process.env.ZAIN_BASE_URL.includes("?")
    ? process.env.ZAIN_BASE_URL
    : `${process.env.ZAIN_BASE_URL}?wsdl`
  : "https://zcstgpublic.jo.zain.com:5001/ZCPublicVPNAPI.svc?wsdl";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function formatMobile(mobile) {
  const clean = (mobile || "").replace(/[\s-]/g, "");
  if (clean.startsWith("962")) return clean;
  if (clean.startsWith("0")) return "962" + clean.slice(1);
  return "962" + clean;
}

function formatAmount(amount) {
  return parseFloat(amount).toFixed(3);
}

let _client = null;

async function getClient() {
  if (_client) return _client;
  console.log("[ZainCash] Creating SOAP client from:", ZAIN_WSDL_URL);

  try {
    _client = await soap.createClientAsync(ZAIN_WSDL_URL, {
      connectionTimeout: 10000,
      timeout: 10000,
    });

    _client.on('request', (xml) => { console.log("--- REQUEST XML --- \n", xml); });
    _client.on('response', (xml) => { console.log("--- RESPONSE XML --- \n", xml); });

    return _client;
  } catch (error) {
    console.error("[ZainCash] Client creation error:", error);
    throw new Error("Could not connect to ZainCash Server");
  }
}

exports.initiatePayment = async ({ amount, mobile }) => {
  const client = await getClient();
  const requestData = {
    req: {
      Amount: formatAmount(amount),
      MSISDN962: formatMobile(mobile),
    },
    generalData: {
      LanguageID: "English",
      TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
      TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
    },
    AuthData: {
      Password: process.env.ZAIN_API_PASSWORD,
      ServiceID: "ZCInitiateMerchDebitPayByMerch",
      UserName: process.env.ZAIN_API_USERNAME,
    },
  };

  const [result] = await client.ZCInitiateMerchDebitPayByMerchAsync(requestData);
  return result;
};

exports.confirmPayment = async ({ amount, mobile, otp, note }) => {
  const client = await getClient();
  
  // هذه الهيكلية تستخدم المسميات التي نجحت في الـ Initiate 
  // مع الحقول الأساسية للـ Confirm لتجنب Unsupported Request
  const requestData = {
    req: {
      Amount: formatAmount(amount),
      CUSTMSISDN962: formatMobile(mobile),  // ✅ اسم صح + ترتيب أول
      OTP: otp,
      MerchPIN: process.env.ZAIN_SERVICE_PIN,
      MerchServiceName: process.env.ZAIN_SERVICE_NAME,
      Note: note || "ShawarmaSheesh Order",
    },
    generalData: {
      LanguageID: "English",
      TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
      TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
    },
    AuthData: {
      Password: process.env.ZAIN_API_PASSWORD,
      ServiceID: "ZCMerchDebitTrigerPayment",
      UserName: process.env.ZAIN_API_USERNAME,
    },
  };

  const [result] = await client.ZCMerchDebitTrigerPaymentAsync(requestData);
  return result;
};
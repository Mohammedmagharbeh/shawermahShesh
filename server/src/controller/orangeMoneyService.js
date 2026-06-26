// // const crypto = require("crypto");
// // const axios = require("axios");

// // const CONFIG = {
// //   BASE_URL: process.env.ORANGE_BASE_URL || "https://om-dev.orange.jo:1445",
// //   USERNAME: process.env.ORANGE_USERNAME,
// //   PASSWORD: process.env.ORANGE_PASSWORD,
// //   API_KEY: "ABC123",
// //   RTP_OTP_AES_KEY: "0fKKYm1pEJt0hh1cuVsF/KAMgaj2xsSWKeqPNAV0gGU=",
// //   RTP_OTP_HMAC_KEY: "UWQtcaBI0sYNjexlSuKzOs1KgrMOPz7g1WlB6tHSmNM=",
// // };

// // console.log("=== ORANGE CONFIG CHECK ===");
// // console.log("BASE_URL:", CONFIG.BASE_URL);
// // console.log("USERNAME:", CONFIG.USERNAME);
// // console.log("PASSWORD exists:", !!CONFIG.PASSWORD);

// // function encryptCliQ(plainText, base64AesKey, base64HmacKey) {
// //   const aesKey = Buffer.from(base64AesKey, "base64");
// //   const hmacKey = Buffer.from(base64HmacKey, "base64");
// //   const iv = crypto.randomBytes(16);
// //   const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
// //   const encrypted = Buffer.concat([
// //     cipher.update(plainText, "utf8"),
// //     cipher.final(),
// //   ]);
// //   const ivAndCipher = Buffer.concat([iv, encrypted]);
// //   const hmac = crypto
// //     .createHmac("sha256", hmacKey)
// //     .update(ivAndCipher)
// //     .digest();
// //   return Buffer.concat([hmac, ivAndCipher]).toString("base64");
// // }

// // function generateSignature(data) {
// //   return crypto.createHash("sha256").update(data).digest("hex");
// // }

// // async function getAccessToken() {
// //   try {
// //     console.log("=== TRYING AUTH ===");
// //     console.log("SENDING AUTH:", {
// //       UserName: CONFIG.USERNAME,
// //       Password: CONFIG.PASSWORD,
// //     }); // ← أضف هاد

// //     const response = await axios.post(
// //       `${CONFIG.BASE_URL}/api/ExternalAPI/V3/Authorization`,
// //       { UserName: CONFIG.USERNAME, Password: CONFIG.PASSWORD },
// //       {
// //         timeout: 30000,
// //         httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
// //       },
// //     );

// //     console.log(
// //       "=== AUTH RESPONSE ===",
// //       JSON.stringify(response.data, null, 2),
// //     );

// //     if (!response.data.isSuccess) {
// //       throw new Error(
// //         response.data.errorDescription || "Orange Money auth failed",
// //       );
// //     }

// //     return response.data.AccessToken;
// //   } catch (err) {
// //     console.error("=== AUTH FAILED ===", {
// //       message: err.message,
// //       code: err.code,
// //       status: err.response?.status,
// //       data: err.response?.data,
// //     });
// //     throw err;
// //   }
// // }

// // async function getServicers() {
// //   const token = await getAccessToken();
// //   const response = await axios.get(
// //     `${CONFIG.BASE_URL}/api/Lookup/GetServicersV2`,
// //     {
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //         "Content-Type": "application/json",
// //       },
// //       timeout: 30000,
// //       httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
// //     },
// //   );

// //   if (!response.data.isSuccess) {
// //     throw new Error("Failed to fetch servicers");
// //   }

// //   return response.data.Response.filter(
// //     (s) => s.RTPMethod === "1" || s.RTPMethod === "3",
// //   );
// // }

// // async function rtpOtpValidate({
// //   alias,
// //   aliasType,
// //   amount,
// //   servicerCode,
// //   merchantReference,
// // }) {
// //   const token = await getAccessToken();
// //   const AES = CONFIG.RTP_OTP_AES_KEY;
// //   const HMAC = CONFIG.RTP_OTP_HMAC_KEY;

// //   const amountStr = parseFloat(amount).toString();

// //   const encAlias = encryptCliQ(alias, AES, HMAC);
// //   const encAliasType = encryptCliQ(aliasType, AES, HMAC);
// //   const encAmount = encryptCliQ(amountStr, AES, HMAC);
// //   const encServicerCode = encryptCliQ(servicerCode, AES, HMAC);
// //   const encMerchantRef = encryptCliQ(merchantReference, AES, HMAC);
// //   const encOtp = encryptCliQ("", AES, HMAC);

// //   const sigString = `${CONFIG.API_KEY}${amountStr}${aliasType}${alias}False${servicerCode}${CONFIG.API_KEY}`;
// //   const signature = generateSignature(sigString);

// //   console.log("=== VALIDATE SIGNATURE STRING ===", sigString);

// //   const response = await axios.post(
// //     `${CONFIG.BASE_URL}/api/ExternalAPI/V3/SendRTPWithOTP`,
// //     {
// //       Alias: encAlias,
// //       AliasType: encAliasType,
// //       Amount: encAmount,
// //       ServicerCode: encServicerCode,
// //       MerchantReference: encMerchantRef,
// //       OTP: encOtp,
// //       IsConfirmed: false,
// //     },
// //     {
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //         Signature: signature,
// //         "Content-Type": "application/json",
// //       },
// //       timeout: 30000,
// //       httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
// //     },
// //   );

// //   return response.data;
// // }

// // async function rtpOtpConfirm({
// //   alias,
// //   aliasType,
// //   amount,
// //   servicerCode,
// //   merchantReference,
// //   otp,
// // }) {
// //   const token = await getAccessToken();
// //   const AES = CONFIG.RTP_OTP_AES_KEY;
// //   const HMAC = CONFIG.RTP_OTP_HMAC_KEY;

// //   const amountStr = parseFloat(amount).toString();

// //   const encAlias = encryptCliQ(alias, AES, HMAC);
// //   const encAliasType = encryptCliQ(aliasType, AES, HMAC);
// //   const encAmount = encryptCliQ(amountStr, AES, HMAC);
// //   const encServicerCode = encryptCliQ(servicerCode, AES, HMAC);
// //   const encMerchantRef = encryptCliQ(merchantReference, AES, HMAC);
// //   const encOtp = encryptCliQ(otp, AES, HMAC);

// //   const sigString = `${CONFIG.API_KEY}${amountStr}${aliasType}${alias}True${servicerCode}${CONFIG.API_KEY}`;
// //   const signature = generateSignature(sigString);

// //   console.log("=== CONFIRM SIGNATURE STRING ===", sigString);

// //   const response = await axios.post(
// //     `${CONFIG.BASE_URL}/api/ExternalAPI/V3/SendRTPWithOTP`,
// //     {
// //       Alias: encAlias,
// //       AliasType: encAliasType,
// //       Amount: encAmount,
// //       ServicerCode: encServicerCode,
// //       MerchantReference: encMerchantRef,
// //       OTP: encOtp,
// //       IsConfirmed: true,
// //     },
// //     {
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //         Signature: signature,
// //         "Content-Type": "application/json",
// //       },
// //       timeout: 30000,
// //       httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
// //     },
// //   );

// //   return response.data;
// // }

// // module.exports = {
// //   getServicers,
// //   rtpOtpValidate,
// //   rtpOtpConfirm,
// // };

// const crypto = require("crypto");
// const axios = require("axios");

// const CONFIG = {
//   BASE_URL: process.env.ORANGE_BASE_URL || "https://orangemoney.orange.jo:1603",
//   USERNAME: process.env.ORANGE_USERNAME,
//   PASSWORD: process.env.ORANGE_PASSWORD,
//   API_KEY: "ABC123",
//   // ✅ Production Keys for RTP OTP
//   RTP_OTP_AES_KEY: "1W92Jk+ipbpBkJg0TvzHOQAskyZeult9Hbz85ax4RMQ=",
//   RTP_OTP_HMAC_KEY: "eXPY4LHUnDBG/fEnTLTESRneGUdSAI4kgXdAL4WAixM=",
// };

// console.log("=== ORANGE CONFIG CHECK ===");
// console.log("BASE_URL:", CONFIG.BASE_URL);
// console.log("USERNAME:", CONFIG.USERNAME);
// console.log("PASSWORD exists:", !!CONFIG.PASSWORD);

// function encryptCliQ(plainText, base64AesKey, base64HmacKey) {
//   const aesKey = Buffer.from(base64AesKey, "base64");
//   const hmacKey = Buffer.from(base64HmacKey, "base64");
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
//   const encrypted = Buffer.concat([
//     cipher.update(plainText, "utf8"),
//     cipher.final(),
//   ]);
//   const ivAndCipher = Buffer.concat([iv, encrypted]);
//   const hmac = crypto
//     .createHmac("sha256", hmacKey)
//     .update(ivAndCipher)
//     .digest();
//   return Buffer.concat([hmac, ivAndCipher]).toString("base64");
// }

// function generateSignature(data) {
//   return crypto.createHash("sha256").update(data).digest("hex");
// }

// async function getAccessToken() {
//   try {
//     console.log("=== TRYING AUTH ===");
//     console.log("SENDING AUTH:", {
//       UserName: CONFIG.USERNAME,
//       Password: CONFIG.PASSWORD,
//     });

//     const response = await axios.post(
//       `${CONFIG.BASE_URL}/api/ExternalAPI/V3/Authorization`,
//       { UserName: CONFIG.USERNAME, Password: CONFIG.PASSWORD },
//       {
//         timeout: 30000,
//         httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
//       },
//     );

//     console.log(
//       "=== AUTH RESPONSE ===",
//       JSON.stringify(response.data, null, 2),
//     );

//     if (!response.data.isSuccess) {
//       throw new Error(
//         response.data.errorDescription || "Orange Money auth failed",
//       );
//     }

//     return response.data.AccessToken;
//   } catch (err) {
//     console.error("=== AUTH FAILED ===", {
//       message: err.message,
//       code: err.code,
//       status: err.response?.status,
//       data: err.response?.data,
//     });
//     throw err;
//   }
// }

// // async function getServicers() {
// //   const token = await getAccessToken();
// //   const response = await axios.get(
// //     `${CONFIG.BASE_URL}/api/Lookup/GetServicersV2`,
// //     {
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //         "Content-Type": "application/json",
// //       },
// //       timeout: 30000,
// //       httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
// //     },
// //   );

// //   if (!response.data.isSuccess) {
// //     throw new Error("Failed to fetch servicers");
// //   }

// //   return response.data.Response.filter(
// //     (s) => s.RTPMethod === "1" || s.RTPMethod === "3",
// //   );
// // }


// async function getServicers() {
//   const token = await getAccessToken();

//   const response = await axios.get(
//     `${CONFIG.BASE_URL}/api/Lookup/GetServicersV2`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       httpsAgent: new (require("https").Agent)({
//         rejectUnauthorized: false,
//       }),
//     }
//   );

//   console.log("=== FULL ORANGE RESPONSE ===");
//   console.log(JSON.stringify(response.data, null, 2));

//   const data = response.data;

//   const servicers =
//     data?.Response ||
//     data?.response ||
//     data?.Result ||
//     [];

//   console.log("=== EXTRACTED SERVICERS ===", servicers);

//   return servicers;
// }

// async function rtpOtpValidate({
//   alias,
//   aliasType,
//   amount,
//   servicerCode,
//   merchantReference,
// }) {
//   const token = await getAccessToken();
//   const AES = CONFIG.RTP_OTP_AES_KEY;
//   const HMAC = CONFIG.RTP_OTP_HMAC_KEY;

//   const amountStr = parseFloat(amount).toString();

//   const encAlias = encryptCliQ(alias, AES, HMAC);
//   const encAliasType = encryptCliQ(aliasType, AES, HMAC);
//   const encAmount = encryptCliQ(amountStr, AES, HMAC);
//   const encServicerCode = encryptCliQ(servicerCode, AES, HMAC);
//   const encMerchantRef = encryptCliQ(merchantReference, AES, HMAC);
//   const encOtp = encryptCliQ("", AES, HMAC);

//   const sigString = `${CONFIG.API_KEY}${amountStr}${aliasType}${alias}False${servicerCode}${CONFIG.API_KEY}`;
//   const signature = generateSignature(sigString);

//   console.log("=== VALIDATE SIGNATURE STRING ===", sigString);

//   const response = await axios.post(
//     `${CONFIG.BASE_URL}/api/ExternalAPI/V3/SendRTPWithOTP`,
//     {
//       Alias: encAlias,
//       AliasType: encAliasType,
//       Amount: encAmount,
//       ServicerCode: encServicerCode,
//       MerchantReference: encMerchantRef,
//       OTP: encOtp,
//       IsConfirmed: false,
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Signature: signature,
//         "Content-Type": "application/json",
//       },
//       timeout: 30000,
//       httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
//     },
//   );

//   return response.data;
// }

// async function rtpOtpConfirm({
//   alias,
//   aliasType,
//   amount,
//   servicerCode,
//   merchantReference,
//   otp,
// }) {
//   const token = await getAccessToken();
//   const AES = CONFIG.RTP_OTP_AES_KEY;
//   const HMAC = CONFIG.RTP_OTP_HMAC_KEY;

//   const amountStr = parseFloat(amount).toString();

//   const encAlias = encryptCliQ(alias, AES, HMAC);
//   const encAliasType = encryptCliQ(aliasType, AES, HMAC);
//   const encAmount = encryptCliQ(amountStr, AES, HMAC);
//   const encServicerCode = encryptCliQ(servicerCode, AES, HMAC);
//   const encMerchantRef = encryptCliQ(merchantReference, AES, HMAC);
//   const encOtp = encryptCliQ(otp, AES, HMAC);

//   const sigString = `${CONFIG.API_KEY}${amountStr}${aliasType}${alias}True${servicerCode}${CONFIG.API_KEY}`;
//   const signature = generateSignature(sigString);

//   console.log("=== CONFIRM SIGNATURE STRING ===", sigString);

//   const response = await axios.post(
//     `${CONFIG.BASE_URL}/api/ExternalAPI/V3/SendRTPWithOTP`,
//     {
//       Alias: encAlias,
//       AliasType: encAliasType,
//       Amount: encAmount,
//       ServicerCode: encServicerCode,
//       MerchantReference: encMerchantRef,
//       OTP: encOtp,
//       IsConfirmed: true,
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Signature: signature,
//         "Content-Type": "application/json",
//       },
//       timeout: 30000,
//       httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
//     },
//   );

//   return response.data;
// }

// module.exports = {
//   getServicers,
//   rtpOtpValidate,
//   rtpOtpConfirm,
// };

// ==================== orangeMoneyService.js (Backend Controller) ====================
const crypto = require("crypto");
const axios = require("axios");

const CONFIG = {
  BASE_URL: process.env.ORANGE_BASE_URL || "https://orangemoney.orange.jo:1603",
  USERNAME: process.env.ORANGE_USERNAME,
  PASSWORD: process.env.ORANGE_PASSWORD,
  API_KEY: "ABC123",

  // ✅ Production Keys — RTP OTP
  RTP_OTP_AES_KEY: "1W92Jk+ipbpBkJg0TvzHOQAskyZeult9Hbz85ax4RMQ=",
  RTP_OTP_HMAC_KEY: "eXPY4LHUnDBG/fEnTLTESRneGUdSAI4kgXdAL4WAixM=",

  // ✅ Production Keys — Inquiry Request To Pay Status
  INQUIRY_AES_KEY: "0X7bJYda+w5Oz+rAxBzeVUWdo9YiMC7woEDC4ug+MGE=",
  INQUIRY_HMAC_KEY: "VHqNFhlow3g4If7csC2CrMhgPX8Dz/iuRA5Pm6FYgas=",
};

console.log("=== ORANGE CONFIG CHECK ===");
console.log("BASE_URL:", CONFIG.BASE_URL);
console.log("USERNAME:", CONFIG.USERNAME);
console.log("PASSWORD exists:", !!CONFIG.PASSWORD);

function encryptCliQ(plainText, base64AesKey, base64HmacKey) {
  const aesKey = Buffer.from(base64AesKey, "base64");
  const hmacKey = Buffer.from(base64HmacKey, "base64");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const ivAndCipher = Buffer.concat([iv, encrypted]);
  const hmac = crypto
    .createHmac("sha256", hmacKey)
    .update(ivAndCipher)
    .digest();
  return Buffer.concat([hmac, ivAndCipher]).toString("base64");
}

function generateSignature(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function getAccessToken() {
  try {
    console.log("=== TRYING AUTH ===");
    console.log("SENDING AUTH:", {
      UserName: CONFIG.USERNAME,
      Password: CONFIG.PASSWORD,
    });

    const response = await axios.post(
      `${CONFIG.BASE_URL}/api/ExternalAPI/V3/Authorization`,
      { UserName: CONFIG.USERNAME, Password: CONFIG.PASSWORD },
      {
        timeout: 30000,
        httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
      },
    );

    console.log(
      "=== AUTH RESPONSE ===",
      JSON.stringify(response.data, null, 2),
    );

    if (!response.data.isSuccess) {
      throw new Error(
        response.data.errorDescription || "Orange Money auth failed",
      );
    }

    return response.data.AccessToken;
  } catch (err) {
    console.error("=== AUTH FAILED ===", {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      data: err.response?.data,
    });
    throw err;
  }
}

// ✅ مؤقتاً: قبول RTPMethod = 1, 2, أو 3 (production عندك بس "2" مفعّل حالياً)
async function getServicers() {
  const token = await getAccessToken();

  const response = await axios.get(
    `${CONFIG.BASE_URL}/api/Lookup/GetServicersV2`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    },
  );

  console.log("=== FULL ORANGE RESPONSE ===");
  console.log(JSON.stringify(response.data, null, 2));

  const data = response.data;
  const servicers = data?.Response || data?.response || data?.Result || [];

  console.log("=== EXTRACTED SERVICERS ===", servicers);

  return servicers.filter((s) =>
    ["1", "2", "3"].includes(s.RTPMethod),
  );
}

async function rtpOtpValidate({
  alias,
  aliasType,
  amount,
  servicerCode,
  merchantReference,
}) {
  const token = await getAccessToken();
  const AES = CONFIG.RTP_OTP_AES_KEY;
  const HMAC = CONFIG.RTP_OTP_HMAC_KEY;

  const amountStr = parseFloat(amount).toString();

  const encAlias = encryptCliQ(alias, AES, HMAC);
  const encAliasType = encryptCliQ(aliasType, AES, HMAC);
  const encAmount = encryptCliQ(amountStr, AES, HMAC);
  const encServicerCode = encryptCliQ(servicerCode, AES, HMAC);
  const encMerchantRef = encryptCliQ(merchantReference, AES, HMAC);
  const encOtp = encryptCliQ("", AES, HMAC);

  const sigString = `${CONFIG.API_KEY}${amountStr}${aliasType}${alias}False${servicerCode}${CONFIG.API_KEY}`;
  const signature = generateSignature(sigString);

  console.log("=== VALIDATE SIGNATURE STRING ===", sigString);

  const response = await axios.post(
    `${CONFIG.BASE_URL}/api/ExternalAPI/V3/SendRTPWithOTP`,
    {
      Alias: encAlias,
      AliasType: encAliasType,
      Amount: encAmount,
      ServicerCode: encServicerCode,
      MerchantReference: encMerchantRef,
      OTP: encOtp,
      IsConfirmed: false,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Signature: signature,
        "Content-Type": "application/json",
      },
      timeout: 30000,
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    },
  );

  return response.data;
}

async function rtpOtpConfirm({
  alias,
  aliasType,
  amount,
  servicerCode,
  merchantReference,
  otp,
}) {
  const token = await getAccessToken();
  const AES = CONFIG.RTP_OTP_AES_KEY;
  const HMAC = CONFIG.RTP_OTP_HMAC_KEY;

  const amountStr = parseFloat(amount).toString();

  const encAlias = encryptCliQ(alias, AES, HMAC);
  const encAliasType = encryptCliQ(aliasType, AES, HMAC);
  const encAmount = encryptCliQ(amountStr, AES, HMAC);
  const encServicerCode = encryptCliQ(servicerCode, AES, HMAC);
  const encMerchantRef = encryptCliQ(merchantReference, AES, HMAC);
  const encOtp = encryptCliQ(otp, AES, HMAC);

  const sigString = `${CONFIG.API_KEY}${amountStr}${aliasType}${alias}True${servicerCode}${CONFIG.API_KEY}`;
  const signature = generateSignature(sigString);

  console.log("=== CONFIRM SIGNATURE STRING ===", sigString);

  const response = await axios.post(
    `${CONFIG.BASE_URL}/api/ExternalAPI/V3/SendRTPWithOTP`,
    {
      Alias: encAlias,
      AliasType: encAliasType,
      Amount: encAmount,
      ServicerCode: encServicerCode,
      MerchantReference: encMerchantRef,
      OTP: encOtp,
      IsConfirmed: true,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Signature: signature,
        "Content-Type": "application/json",
      },
      timeout: 30000,
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    },
  );

  return response.data;
}

// ✅ Inquiry Request To Pay Status (يأكد هل تم الدفع فعلياً)
async function inquiryRequestToPayStatus({ merchantReference }) {
  const token = await getAccessToken();
  const AES = CONFIG.INQUIRY_AES_KEY;
  const HMAC = CONFIG.INQUIRY_HMAC_KEY;

  const encMerchantRef = encryptCliQ(merchantReference, AES, HMAC);

  const sigString = `${CONFIG.API_KEY}${merchantReference}${CONFIG.API_KEY}`;
  const signature = generateSignature(sigString);

  console.log("=== INQUIRY SIGNATURE STRING ===", sigString);

  const response = await axios.post(
    `${CONFIG.BASE_URL}/api/ExternalAPI/V3/InquiryRequestToPayStatus`,
    { MerchantReference: encMerchantRef },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Signature: signature,
        "Content-Type": "application/json",
      },
      timeout: 30000,
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    },
  );

  console.log(
    "=== INQUIRY RESPONSE ===",
    JSON.stringify(response.data, null, 2),
  );

  return response.data;
}

module.exports = {
  getServicers,
  rtpOtpValidate,
  rtpOtpConfirm,
  inquiryRequestToPayStatus,
};
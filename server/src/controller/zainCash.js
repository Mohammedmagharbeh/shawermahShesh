const axios = require("axios");
const https = require("https");

// Staging may return self-signed cert — rejectUnauthorized: false for staging only;
// set to true (or remove agent) in production.
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const generalData = {
  LanguageID: "English",
  TerminalShopID: "1",
  TerminalUserID: "1",
};

function buildAuth(serviceId) {
  return {
    ServiceID: String(serviceId),
    UserName: process.env.ZAIN_API_USERNAME,
    Password: process.env.ZAIN_API_PASSWORD,
  };
}

/** Normalize mobile → 962XXXXXXXXX */
function formatMobile(mobile) {
  const clean = (mobile || "").replace(/\s+/g, "").replace(/-/g, "");
  if (clean.startsWith("962")) return clean;
  if (clean.startsWith("0")) return "962" + clean.slice(1);
  return "962" + clean;
}

/** Normalize amount → "X.XXX" (3 decimals string) */
function formatAmount(amount) {
  return parseFloat(amount).toFixed(3);
}

// Step 1: Send OTP to customer's phone
exports.initiatePayment = async ({ amount, mobile }) => {
  const url = `${process.env.ZAIN_BASE_URL}/ZCInitiateMerchDebitPayByMerch`;

  const body = {
    ZCInitMerchDebitReq: {
      Amount: formatAmount(amount),
      MSISDN962: formatMobile(mobile),
    },
    GeneralData: generalData,
    AuthenticationData: buildAuth(1000000013),
  };

  console.log("[ZainCash] initiatePayment URL:", url);
  console.log("[ZainCash] initiatePayment body:", JSON.stringify(body, null, 2));

  const response = await axios.post(url, body, {
    httpsAgent,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
  });

  console.log("[ZainCash] initiatePayment response:", response.data);
  return response.data;
};

// Step 2: Execute payment after customer submits OTP
exports.triggerPayment = async ({ amount, mobile, otp, note, orderId }) => {
  const url = `${process.env.ZAIN_BASE_URL}/ZCMerchDebitTrigerPaymentV2`;

  const body = {
    req: {
      Amount: formatAmount(amount),
      CUSTMSISDN962: formatMobile(mobile),
      CustOTP: otp,
      MerchPIN: process.env.ZAIN_SERVICE_PIN,
      MerchServiceName: process.env.ZAIN_SERVICE_NAME,
      Note: note || "ShawarmaShee sh Order",
      MerchRefID: orderId || null,
    },
    GeneralData: generalData,
    AuthenticationData: buildAuth(1000000014),
  };

  console.log("[ZainCash] triggerPayment URL:", url);
  console.log("[ZainCash] triggerPayment body:", JSON.stringify(body, null, 2));

  const response = await axios.post(url, body, {
    httpsAgent,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
  });

  console.log("[ZainCash] triggerPayment response:", response.data);
  return response.data;
};

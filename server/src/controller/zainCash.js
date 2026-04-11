const soap = require("soap");

const ZAIN_WSDL_URL = process.env.ZAIN_BASE_URL
  ? `${process.env.ZAIN_BASE_URL}?singleWsdl`
  : "https://zcstgpublic.jo.zain.com:5001/ZCPublicVPNAPI.svc?singleWsdl";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// ─── CRITICAL: WCF DataContractSerializer requires ALL fields in ALPHABETICAL order ───
// AuthData fields must be: Password → ServiceID → UserName  (P < S < U)
// If the order is wrong, WCF throws DeserializationFailed even if values are correct.
// ─────────────────────────────────────────────────────────────────────────────────────

function formatMobile(mobile) {
  const clean = (mobile || "").replace(/[\s-]/g, "");
  if (clean.startsWith("962")) return clean;
  if (clean.startsWith("0")) return "962" + clean.slice(1);
  return "962" + clean;
}

function formatAmount(amount) {
  return parseFloat(amount).toFixed(3);
}

// ─── Cached SOAP client ───────────────────────────────────────────────────────
let _client = null;
async function getClient() {
  if (_client) return _client;
  console.log("[ZainCash] Creating SOAP client from:", ZAIN_WSDL_URL);
  _client = await soap.createClientAsync(ZAIN_WSDL_URL);
  return _client;
}

// ─── 1. Initiate Payment — sends OTP to customer's phone ─────────────────────
exports.initiatePayment = async ({ amount, mobile }) => {
  const client = await getClient();

  const requestData = {
    req: {
      Amount: formatAmount(amount), // "2.700"
      MSISDN962: formatMobile(mobile), // "962XXXXXXXXX"
    },
    generalData: {
      LanguageID: "English",
      TerminalShopID: "1",
      TerminalUserID: "1",
    },
    AuthData: {
      Password: process.env.ZAIN_API_PASSWORD, // P  ← must be FIRST
      ServiceID: "ZCInitiateMerchDebitPayByMerch", // S  ← second
      UserName: process.env.ZAIN_API_USERNAME, // U  ← third
      // WCF DataContractSerializer reads fields alphabetically: P < S < U ✓
    },
  };

  console.log(
    "[ZainCash] initiatePayment Payload:",
    JSON.stringify(requestData, null, 2),
  );

  try {
    const [result] =
      await client.ZCInitiateMerchDebitPayByMerchAsync(requestData);
    console.log(
      "[ZainCash] initiatePayment Response:",
      JSON.stringify(result, null, 2),
    );
    return result;
  } catch (error) {
    console.error("[ZainCash] SOAP Error (Initiate):", error.message || error);
    throw error.Fault
      ? new Error("SOAP Fault: " + error.Fault.faultstring)
      : error;
  }
};

// ─── 2. Confirm Payment — customer submits OTP, money moves ──────────────────
exports.confirmPayment = async ({ amount, mobile, otp, note, orderId }) => {
  const client = await getClient();

  const requestData = {
    req: {
      Amount: formatAmount(amount),
      CUSTMSISDN962: formatMobile(mobile),
      CustOTP: otp,
      MerchPIN: process.env.ZAIN_SERVICE_PIN,
      MerchServiceName: process.env.ZAIN_SERVICE_NAME,
      Note: note || "ShawarmaShee sh Order",
    },
    generalData: {
      LanguageID: "English",
      TerminalShopID: "1",
      TerminalUserID: "1",
    },
    AuthData: {
      Password: process.env.ZAIN_API_PASSWORD, // P  ← first
      ServiceID: "ZCMerchDebitTrigerPayment", // S  ← second
      UserName: process.env.ZAIN_API_USERNAME, // U  ← third
      // P < S < U  ✓
    },
  };

  console.log(
    "[ZainCash] confirmPayment Payload:",
    JSON.stringify(requestData, null, 2),
  );

  try {
    const [result] = await client.ZCMerchDebitTrigerPaymentAsync(requestData);
    console.log(
      "[ZainCash] confirmPayment Response:",
      JSON.stringify(result, null, 2),
    );
    return result;
  } catch (error) {
    console.error("[ZainCash] SOAP Error (Confirm):", error.message || error);
    throw error.Fault
      ? new Error("SOAP Fault: " + error.Fault.faultstring)
      : error;
  }
};

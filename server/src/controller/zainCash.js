const soap = require("soap");

// Default to the VPN/STG singleWsdl URL if not provided by `.env`
const ZAIN_WSDL_URL = process.env.ZAIN_BASE_URL
  ? `${process.env.ZAIN_BASE_URL}?singleWsdl`
  : "https://zcstgpublic.jo.zain.com:5001/ZCPublicVPNAPI.svc?singleWsdl";

// Optionally ignore self-signed certs for the staging soap connection
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const generalData = {
  LanguageID: "English",
  TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
  TerminalUserID: process.env.ZC_TERMINAL_USER_ID || "1",
};

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

// 1. Initiate Payment (Send OTP)
exports.initiatePayment = async ({ amount, mobile }) => {
  const formattedMobile = formatMobile(mobile);

  const requestData = {
    ZCInitMerchDebitReq: {
      Amount: formatAmount(amount),
      MSISDN962: formattedMobile,
    },
    generalData: {
      LanguageID: "English",
      TerminalShopID: process.env.ZC_TERMINAL_SHOP_ID || "1",
      TerminalUserID: "1",
    },
    AuthData: {
      Password: process.env.ZAIN_API_PASSWORD,
      ServiceID: "ZCInitiateMerchDebitPayByMerch", // <--- Changed from "1000000013"
      UserName: process.env.ZAIN_API_USERNAME,
    },
  };

  try {
    console.log("[ZainCash] Requesting SOAP client for Initiate...");
    const client = await soap.createClientAsync(ZAIN_WSDL_URL);

    console.log(
      "[ZainCash] initiatePayment Payload:",
      JSON.stringify(requestData, null, 2),
    );

    const [result] =
      await client.ZCInitiateMerchDebitPayByMerchAsync(requestData);

    console.log(
      "[ZainCash] initiatePayment Response:",
      JSON.stringify(result, null, 2),
    );
    return result;
  } catch (error) {
    console.error("[ZainCash] SOAP Error (Initiate):", error.message || error);
    // Throw error so the router catches it properly
    throw typeof error.Fault !== "undefined"
      ? new Error("SOAP Fault: " + error.Fault.faultstring)
      : error;
  }
};

// 2. Confirm Payment (Verify OTP)
exports.confirmPayment = async ({ amount, mobile, otp, note, orderId }) => {
  const formattedMobile = formatMobile(mobile);

  const requestData = {
    req: {
      Amount: formatAmount(amount),
      CUSTMSISDN962: formattedMobile,
      CustOTP: otp,
      MerchPIN: process.env.ZAIN_SERVICE_PIN,
      MerchServiceName: process.env.ZAIN_SERVICE_NAME,
      Note: note || "ShawarmaShee sh Order",
      // Include MerchRefID if using the V2 endpoint. V1 endpoint ignores it.
      MerchRefID: orderId || null,
    },
    generalData: generalData,
    AuthData: {
      ServiceID: "1000000014",
      UserName: process.env.ZAIN_API_USERNAME,
      Password: process.env.ZAIN_API_PASSWORD,
    },
  };

  try {
    console.log("[ZainCash] Requesting SOAP client for Confirm...");
    const client = await soap.createClientAsync(ZAIN_WSDL_URL);

    console.log(
      "[ZainCash] confirmPayment Payload:",
      JSON.stringify(requestData, null, 2),
    );

    // Notice: ZCMerchDebitTrigerPaymentV2 is the modern endpoint used to include MerchRefID.
    // If the WSDL does not expose the V2 method, you must remove the "V2" suffix. Let's try V2 first.
    let result;
    if (client.ZCMerchDebitTrigerPaymentV2Async) {
      [result] = await client.ZCMerchDebitTrigerPaymentV2Async(requestData);
    } else {
      // Fallback to V1
      [result] = await client.ZCMerchDebitTrigerPaymentAsync(requestData);
    }

    console.log(
      "[ZainCash] confirmPayment Response:",
      JSON.stringify(result, null, 2),
    );
    return result;
  } catch (error) {
    console.error("[ZainCash] SOAP Error (Confirm):", error.message || error);
    throw typeof error.Fault !== "undefined"
      ? new Error("SOAP Fault: " + error.Fault.faultstring)
      : error;
  }
};

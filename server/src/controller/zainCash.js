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

    _client.on("request", (xml) => {
      console.log("--- REQUEST XML --- \n", xml);
    });
    _client.on("response", (xml) => {
      console.log("--- RESPONSE XML --- \n", xml);
    });

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

  const [result] =
    await client.ZCInitiateMerchDebitPayByMerchAsync(requestData);
  return result;
};

exports.confirmPayment = async ({ amount, mobile, otp, note }) => {
  const client = await getClient();

  // هذه الهيكلية تستخدم المسميات التي نجحت في الـ Initiate
  // مع الحقول الأساسية للـ Confirm لتجنب Unsupported Request
  const requestData = {
    req: {
      Amount: formatAmount(amount),
      CUSTMSISDN962: formatMobile(mobile),
      CustOTP: otp,
      // السيرفر يشتكي لأن MerchPIN يأتي هنا مباشرة
      // ولكن ربما يتوقع حقولاً أخرى (مثل RefID) قبلها، أو أن ترتيب هذه الحقول هو السبب
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

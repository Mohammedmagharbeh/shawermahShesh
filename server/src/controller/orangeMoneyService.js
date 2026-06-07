const crypto = require("crypto");
const axios = require("axios");

// ========== CONFIG ==========
const CONFIG = {
  BASE_URL: process.env.ORANGE_BASE_URL || "https://om-dev.orange.jo:1445",
  USERNAME: process.env.ORANGE_USERNAME,
  PASSWORD: process.env.ORANGE_PASSWORD,
  API_KEY: "ABC123",
  // RTP OTP Keys (Staging)
  RTP_OTP_AES_KEY: "0fKKYm1pEJt0hh1cuVsF/KAMgaj2xsSWKeqPNAV0gGU=",
  RTP_OTP_HMAC_KEY: "UWQtcaBI0sYNjexlSuKzOs1KgrMOPz7g1WlB6tHSmNM=",
};

// ========== AES+HMAC ENCRYPTION ==========
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

  const finalData = Buffer.concat([hmac, ivAndCipher]);
  return finalData.toString("base64");
}

// ========== SHA256 SIGNATURE ==========
function generateSignature(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// ========== GET ACCESS TOKEN ==========
async function getAccessToken() {
  const response = await axios.post(
    `${CONFIG.BASE_URL}/api/ExternalAPI/V3/Authorization`,
    {
      UserName: CONFIG.USERNAME,
      Password: CONFIG.PASSWORD,
    },
    { httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }) }
  );

  if (!response.data.isSuccess) {
    throw new Error(
      response.data.errorDescription || "Orange Money auth failed"
    );
  }

  return response.data.AccessToken;
}

// ========== GET ALL SERVICERS ==========
async function getServicers() {
  const token = await getAccessToken();

  const response = await axios.get(
    `${CONFIG.BASE_URL}/api/Lookup/GetServicersV2`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    }
  );

  if (!response.data.isSuccess) {
    throw new Error("Failed to fetch servicers");
  }

  // فلتر بس اللي عندهم RTPMethod = 1 أو 3 (يعني OTP مفعّل)
  return response.data.Response.filter(
    (s) => s.RTPMethod === "1" || s.RTPMethod === "3"
  );
}

// ========== RTP OTP - STEP 1: VALIDATE (بتبعت OTP) ==========
async function rtpOtpValidate({ alias, aliasType, amount, servicerCode, merchantReference }) {
  const token = await getAccessToken();

  const AES = CONFIG.RTP_OTP_AES_KEY;
  const HMAC = CONFIG.RTP_OTP_HMAC_KEY;

  const encAlias = encryptCliQ(alias, AES, HMAC);
  const encAliasType = encryptCliQ(aliasType, AES, HMAC);
  const encAmount = encryptCliQ(amount.toString(), AES, HMAC);
  const encServicerCode = encryptCliQ(servicerCode, AES, HMAC);
  const encMerchantRef = encryptCliQ(merchantReference, AES, HMAC);
  const encOtp = encryptCliQ("", AES, HMAC);

  const sigString = `${CONFIG.API_KEY}${amount}${aliasType}${alias}False${servicerCode}${CONFIG.API_KEY}`;
  const signature = generateSignature(sigString);

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
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    }
  );

  return response.data;
}

// ========== RTP OTP - STEP 2: CONFIRM ==========
async function rtpOtpConfirm({ alias, aliasType, amount, servicerCode, merchantReference, otp }) {
  const token = await getAccessToken();

  const AES = CONFIG.RTP_OTP_AES_KEY;
  const HMAC = CONFIG.RTP_OTP_HMAC_KEY;

  const encAlias = encryptCliQ(alias, AES, HMAC);
  const encAliasType = encryptCliQ(aliasType, AES, HMAC);
  const encAmount = encryptCliQ(amount.toString(), AES, HMAC);
  const encServicerCode = encryptCliQ(servicerCode, AES, HMAC);
  const encMerchantRef = encryptCliQ(merchantReference, AES, HMAC);
  const encOtp = encryptCliQ(otp, AES, HMAC);

  const sigString = `${CONFIG.API_KEY}${amount}${aliasType}${alias}True${servicerCode}${CONFIG.API_KEY}`;
  const signature = generateSignature(sigString);

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
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    }
  );

  return response.data;
}

module.exports = {
  getServicers,
  rtpOtpValidate,
  rtpOtpConfirm,
};
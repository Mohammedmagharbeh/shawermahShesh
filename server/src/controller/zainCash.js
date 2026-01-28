const axios= require("axios");

const ZAIN_URL = process.env.ZAIN_BASE_URL;

function baseRequest(serviceId, body) {
  return {
    ...body,
    GeneralData: {
      LanguageID: "English",
      TerminalShopID: "1",
      TerminalUserID: "1",
    },
    AuthenticationData: {
      ServiceID: serviceId,
      UserName: process.env.ZAIN_API_USERNAME,
      Password: process.env.ZAIN_API_PASSWORD,
    },
  };
}

exports.initiatePayment = async ({ amount, mobile })=> {
  const payload = baseRequest("1000000013", {
    ZCInitMerchDebitReq: {
      Amount: amount,
      MSISDN962: mobile,
    },
  });
    console.log(process.env.ZAIN_BASE_URL);

  const response = await axios.post(ZAIN_URL, payload);
  console.log(response.data);
  
  return response.data;
}

exports.confirmPayment = async({ amount, mobile, otp, note }) => {
  const payload = baseRequest("1000000014", {
    req: {
      Amount: amount,
      CUSTMSISDN962: mobile,
      CustOTP: otp,
      MerchPIN: process.env.ZAIN_SERVICE_PIN,
      MerchServiceName: process.env.ZAIN_SERVICE_NAME,
      Note: note || "Payment via CLIQ",
    },
  });

  const response = await axios.post(ZAIN_URL, payload);
  return response.data;
}

// utils/otp.js

require("dotenv").config();

const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function generateOTP() {
  const random = Math.floor(100000 + Math.random() * 900000);

  return random; // 6-digit
}

async function sendOTP(phone, otp) {
  console.log(otp);
  console.log("phone: ", phone);

  const senderid = "Sh.Sheesh";
  const accname = "highfit";
  const accpass = "RwQ$$8P_m@RA!Dsd88";

  // 3. Build the message
  const msg = `Your OTP is ${otp}`;
  const encodedMsg = encodeURIComponent(msg);
  const encodedPass = encodeURIComponent(accpass);

  // 4. Build the request URL
  const url =
    `https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS/SendSMS` +
    `?senderid=${senderid}&numbers=${phone}&accname=${accname}` +
    `&AccPass=${encodedPass}&msg=${encodedMsg}`;

  // 5. Send request
  const response = await fetch(url);

  // 6. Return OTP + API response
  return { otp, response: response.data };
}

module.exports = { generateOTP, sendOTP };

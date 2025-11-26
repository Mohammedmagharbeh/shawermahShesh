// utils/otp.js

require("dotenv").config();

function generateOTP() {
  const random = Math.floor(1000 + Math.random() * 9000);

  return random; // 6-digit
}

async function sendOTP(phone, otp) {
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

async function sendOrderConfirm(phone) {
  const senderid = "Sh.Sheesh";
  const accname = "highfit";
  const accpass = "RwQ$$8P_m@RA!Dsd88";

  // 3. Build the message
  const msg = `تم التأكيد - طلبك قيد التحضير .`;
  const encodedMsg = encodeURIComponent(msg);
  const encodedPass = encodeURIComponent(accpass);

  // 4. Build the request URL
  const url =
    `https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS/SendSMS` +
    `?senderid=${senderid}&numbers=${phone}&accname=${accname}` +
    `&AccPass=${encodedPass}&msg=${encodedMsg}`;

  // 5. Send request
  const response = await fetch(url);

  return { response: response.data };
}

module.exports = { generateOTP, sendOTP, sendOrderConfirm };

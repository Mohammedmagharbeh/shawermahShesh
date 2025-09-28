// utils/otp.js
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit
}

async function sendOTP(phone, otp) {
  return client.messages.create({
    body: `Your Shawarma Sheesh OTP code is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}

module.exports = { generateOTP, sendOTP };

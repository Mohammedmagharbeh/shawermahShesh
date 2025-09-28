// utils/otp.js

require("dotenv").config();

const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function generateOTP() {
  const random = Math.floor(100000 + Math.random() * 900000);
  console.log(random);

  return random; // 6-digit
}

async function sendOTP(phone, otp) {
  console.log(otp);

  return client.messages.create({
    body: `Your Shawarma Sheesh OTP code is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}

module.exports = { generateOTP, sendOTP };

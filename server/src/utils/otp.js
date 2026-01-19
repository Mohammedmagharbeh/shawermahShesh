// // utils/otp.js

// require("dotenv").config();

// function generateOTP() {
//   const random = Math.floor(1000 + Math.random() * 9000);

//   return random; // 6-digit
// }

// async function sendOTP(phone, otp) {
//   const senderid = "Sh.Sheesh";
//   const accname = "highfit";
//   const accpass = "RwQ$$8P_m@RA!Dsd88";

//   // 3. Build the message
//   const msg = `Your OTP is ${otp}`;
//   const encodedMsg = encodeURIComponent(msg);
//   const encodedPass = encodeURIComponent(accpass);

//   // 4. Build the request URL
//   const url =
//     `https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS/SendSMS` +
//     `?senderid=${senderid}&numbers=${phone}&accname=${accname}` +
//     `&AccPass=${encodedPass}&msg=${encodedMsg}`;

//   // 5. Send request
//   const response = await fetch(url);

//   // 6. Return OTP + API response
//   return { otp, response: response.data };
// }

// async function sendOrderConfirm(phone) {
//   const senderid = "Sh.Sheesh";
//   const accname = "highfit";
//   const accpass = "RwQ$$8P_m@RA!Dsd88";

//   // 3. Build the message
//   const msg = `تم التأكيد - طلبك قيد التحضير .`;
//   const encodedMsg = encodeURIComponent(msg);
//   const encodedPass = encodeURIComponent(accpass);

//   // 4. Build the request URL
//   const url =
//     `https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS/SendSMS` +
//     `?senderid=${senderid}&numbers=${phone}&accname=${accname}` +
//     `&AccPass=${encodedPass}&msg=${encodedMsg}`;

//   // 5. Send request
//   const response = await fetch(url);

//   return { response: response.data };
// }

// module.exports = { generateOTP, sendOTP, sendOrderConfirm };

// utils/otp.js
require("dotenv").config();

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000); 
}

/**
 * @param {string} phone - رقم الهاتف
 * @param {number} otp - الرمز
 * @param {string|null} employeeName - اسم الموظف المرسل من الفرونت إند
 */
async function sendOTP(phone, otp, employeeName = null) {
  const senderid = "Sh.Sheesh";
  const accname = "highfit";
  const accpass = "RwQ$$8P_m@RA!Dsd88";

  // بناء الرسالة: إذا وجد الاسم يتم تضمينه باللغة العربية
  let msg = `Your OTP is ${otp}`;
  if (employeeName) {
msg = `الموظف: ${employeeName.trim()} \nقام بطلب دخول. \nرمز التحقق هو: ${otp}`;  }

  const encodedMsg = encodeURIComponent(msg);
  const encodedPass = encodeURIComponent(accpass);

  const url =
    `https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS/SendSMS` +
    `?senderid=${senderid}&numbers=${phone}&accname=${accname}` +
    `&AccPass=${encodedPass}&msg=${encodedMsg}`;

  try {
    const response = await fetch(url);
    const responseText = await response.text();
    return { otp, response: responseText };
  } catch (error) {
    console.error("خطأ في إرسال SMS:", error);
    throw error;
  }
}

async function sendOrderConfirm(phone) {
  const senderid = "Sh.Sheesh";
  const accname = "highfit";
  const accpass = "RwQ$$8P_m@RA!Dsd88";
  const msg = `تم التأكيد - طلبك قيد التحضير .`;
  
  const encodedMsg = encodeURIComponent(msg);
  const encodedPass = encodeURIComponent(accpass);

  const url = `https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS/SendSMS?senderid=${senderid}&numbers=${phone}&accname=${accname}&AccPass=${encodedPass}&msg=${encodedMsg}`;

  const response = await fetch(url);
  const data = await response.text();
  return { response: data };
}

module.exports = { generateOTP, sendOTP, sendOrderConfirm };
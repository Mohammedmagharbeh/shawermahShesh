require("dotenv").config();

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

async function sendOTP(phone, otp, employeeName = null) {
  const senderid = "Sh.Sheesh";
  const accname = "highfitgym";
  const accpass = "mE5jT3oB3pK8cG1r";

  let msg = `Your OTP is ${otp}`;
  if (employeeName) {
    msg = `الموظف: ${employeeName.trim()} \nقام بطلب دخول. \nرمز التحقق هو: ${otp}`;
  }

  const encodedMsg = encodeURIComponent(msg);
  const encodedPass = encodeURIComponent(accpass);
  const url = `https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS_General/SendSMS?senderid=${senderid}&numbers=${phone}&accname=${accname}&AccPass=${encodedPass}&msg=${encodedMsg}`;

  console.log("Sending SMS with URL:", url);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const responseText = await response.text();
    console.log("SMS API Response:", responseText);
    return { otp, response: responseText };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.warn(
        "SMS Timeout: الطلب أخذ وقتاً طويلاً وتم إيقافه لمنع التكرار.",
      );
      return { otp, response: "timeout" };
    }
    console.error("SMS Error:", error);
    throw error;
  }
}

async function sendOrderConfirm(phone) {
  const senderid = "Sh.Sheesh";
  const accname = "highfitgym";
  const accpass = "mE5jT3oB3pK8cG1r";
  const msg = `تم التأكيد - طلبك قيد التحضير .`;

  const encodedMsg = encodeURIComponent(msg);
  const encodedPass = encodeURIComponent(accpass);
  const url = `https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS_General/SendSMS?senderid=${senderid}&numbers=${phone}&accname=${accname}&AccPass=${encodedPass}&msg=${encodedMsg}`;

  console.log("Sending Order Confirm with URL:", url);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const responseText = await response.text();
    console.log("Order Confirm API Response:", responseText);
    return { response: responseText };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Order Confirm Error:", err);
    return { response: "error" };
  }
}

module.exports = { generateOTP, sendOTP, sendOrderConfirm };

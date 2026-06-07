import axios from "axios";

export async function getServicers() {
  const response = await axios.get("/api/orange/servicers");
  if (!response.data.success) {
    throw new Error(response.data.error || "فشل في جلب قائمة الخدمات");
  }
  return response.data.servicers;
}

export async function rtpOtpValidate({ phone, amount, servicerCode }) {
  const response = await axios.post("/api/orange/initiate", {
    phone,
    amount,
    servicerCode,
  });
  if (!response.data.success) {
    throw new Error(response.data.error || "فشل إرسال الـ OTP");
  }
  return response.data; // { success, merchantReference, message }
}

export async function rtpOtpConfirm({ phone, amount, servicerCode, merchantReference, otp, orderData }) {
  const response = await axios.post("/api/orange/confirm", {
    phone,
    amount,
    servicerCode,
    merchantReference,
    otp,
    orderData,
  });
  if (!response.data.success) {
    throw new Error(response.data.error || "فشل تأكيد الـ OTP");
  }
  return response.data;
}
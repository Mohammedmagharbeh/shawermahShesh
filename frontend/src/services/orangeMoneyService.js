import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function getServicers() {
  const response = await axios.get(`${BASE_URL}/orange/servicers`);
  if (!response.data.success) {
    throw new Error(response.data.error || "فشل في جلب قائمة الخدمات");
  }
  return response.data.servicers;
}

export async function rtpOtpValidate({ phone, amount, servicerCode }) {
  const response = await axios.post(`${BASE_URL}/orange/initiate`, {
    phone,
    amount,
    servicerCode,
  });
  if (!response.data.success) {
    throw new Error(response.data.error || "فشل إرسال الـ OTP");
  }
  return response.data;
}

export async function rtpOtpConfirm({ phone, amount, servicerCode, merchantReference, otp, orderData }) {
  const response = await axios.post(`${BASE_URL}/orange/confirm`, {
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
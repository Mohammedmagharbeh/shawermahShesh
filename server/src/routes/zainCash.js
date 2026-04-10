const express = require("express");
const { initiatePayment, triggerPayment } = require("../controller/zainCash.js");

const router = express.Router();

// Route 1: Initiate — sends OTP to customer's phone
router.post("/zain/initiate", async (req, res) => {
  try {
    const { amount, mobile } = req.body;

    if (!amount || !mobile) {
      return res.status(400).json({ message: "Amount and mobile number are required" });
    }

    const result = await initiatePayment({ amount, mobile });

    // Inspect Zain's error object
    if (
      result?.ErrorObj?.ResultType === "Error" ||
      (result?.ErrorObj?.ErrorCode && result.ErrorObj.ErrorCode !== "Success")
    ) {
      return res.status(400).json({
        message: "Failed to send OTP",
        detail: result?.ErrorObj?.ErrorMessage || "Unknown error",
        raw: result,
      });
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("[ZainCash] Initiate Route Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return res.status(500).json({
      message: "OTP initiation failed",
      error: error.response?.data || error.message,
    });
  }
});

// Route 2: Confirm — customer submits OTP, money moves
router.post("/zain/confirm", async (req, res) => {
  try {
    const { amount, mobile, otp, orderId } = req.body;

    if (!amount || !mobile || !otp) {
      return res.status(400).json({ message: "Amount, mobile, and OTP are required" });
    }

    const result = await triggerPayment({
      amount,
      mobile,
      otp,
      note: orderId ? `Order #${orderId}` : "ShawarmaShee sh Order",
      orderId,
    });

    if (
      result?.ErrorObj?.ResultType === "Error" ||
      (result?.ErrorObj?.ErrorCode && result.ErrorObj.ErrorCode !== "Success")
    ) {
      return res.status(400).json({
        message: "Payment failed",
        detail: result?.ErrorObj?.ErrorMessage || "Unknown error",
        raw: result,
      });
    }

    const refId = result?.RefID || null;

    return res.json({ success: true, refId, data: result });
  } catch (error) {
    console.error("[ZainCash] Confirm Route Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return res.status(500).json({
      message: "Payment confirmation failed",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
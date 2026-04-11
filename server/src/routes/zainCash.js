const express = require("express");
const router = express.Router();
const { initiatePayment, confirmPayment } = require("../controller/zainCash");

router.post("/zain/initiate", async (req, res) => {
  try {
    const { amount, mobile } = req.body;

    if (!amount || !mobile) {
      return res.status(400).json({ message: "المبلغ ورقم الهاتف مطلوبان" });
    }

    const result = await initiatePayment({ amount, mobile });

    if (result.ResultType === "Error") {
      return res.status(400).json({
        message: "فشل في إرسال الرمز",
        detail: result.Description || result.ErrorMsg,
      });
    }

    return res.json(result);
  } catch (error) {
    console.error("Initiate Route Error:", error.message);
    res.status(500).json({
      message: "OTP initiation failed",
      error: error.response?.data || error.message,
    });
  }
});

router.post("/zain/confirm", async (req, res) => {
  try {
    const { amount, mobile, otp, note } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "رمز التحقق (OTP) مطلوب" });
    }

    const result = await confirmPayment({ amount, mobile, otp, note });

    if (result.ResultType === "Error") {
      return res.status(400).json({
        message: "فشل تأكيد عملية الدفع",
        detail: result.Description || result.ErrorMsg,
      });
    }

    return res.json(result);
  } catch (error) {
    console.error("Confirm Route Error:", error.message);
    res.status(500).json({
      message: "Payment confirmation failed",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;

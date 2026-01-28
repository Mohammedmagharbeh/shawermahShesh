const express = require("express");
const {
  initiatePayment,
  confirmPayment,
} = require("../controller/zainCash.js");

const router = express.Router();

router.post("/zain/initiate", async (req, res) => {
  try {
    const { amount, mobile } = req.body;
    console.log('init zain');
    
    const result = await initiatePayment({ amount, mobile });

    return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP initiation failed" });
  }
});

router.post("/zain/confirm", async (req, res) => {
  try {
    const { amount, mobile, otp } = req.body;

    const result = await confirmPayment({
      amount,
      mobile,
      otp,
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment failed" });
  }
});

module.exports = router;
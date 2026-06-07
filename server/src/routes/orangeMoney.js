const express = require("express");
const router = express.Router();
const { getServicers, rtpOtpValidate, rtpOtpConfirm } = require("../controller/orangeMoneyService");
const Order = require("../models/orders");
const { v4: uuidv4 } = require("uuid");

// GET /orange/servicers — جيب قائمة البنوك
router.get("/servicers", async (req, res) => {
  try {
    const servicers = await getServicers();
    res.json({ success: true, servicers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /orange/initiate — ابعت OTP
router.post("/initiate", async (req, res) => {
  try {
    const { phone, amount, servicerCode } = req.body;

    if (!phone || !amount || !servicerCode) {
      return res.status(400).json({
        success: false,
        error: "phone, amount, servicerCode مطلوبين",
      });
    }

    // format الرقم: 0096207XXXXXXXX
    const alias = `00962${phone.replace(/^0/, "")}`;
    const merchantReference = uuidv4();

    const result = await rtpOtpValidate({
      alias,
      aliasType: "MOBL",
      amount,
      servicerCode,
      merchantReference,
    });

    if (!result.isSuccess) {
      return res.status(400).json({
        success: false,
        error: result.errors?.[0]?.description || "فشل إرسال OTP",
      });
    }

    // احفظ merchantReference مؤقتاً علشان نستخدمه في الـ confirm
    res.json({
      success: true,
      merchantReference,
      message: "تم إرسال OTP على رقمك",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /orange/confirm — تأكيد الدفع
router.post("/confirm", async (req, res) => {
  try {
    const {
      phone,
      amount,
      servicerCode,
      merchantReference,
      otp,
      orderData,
    } = req.body;

    if (!phone || !amount || !servicerCode || !merchantReference || !otp) {
      return res.status(400).json({
        success: false,
        error: "بيانات ناقصة",
      });
    }

    const alias = `00962${phone.replace(/^0/, "")}`;

    const result = await rtpOtpConfirm({
      alias,
      aliasType: "MOBL",
      amount,
      servicerCode,
      merchantReference,
      otp,
    });

    if (!result.isSuccess) {
      return res.status(400).json({
        success: false,
        error: result.errors?.[0]?.description || "فشل التحقق",
      });
    }

    // احفظ الطلب
    const order = await Order.create({
      ...orderData,
      payment: {
        method: "orange_money",
        transactionReference: result.TransactionReference || merchantReference,
        status: "paid",
      },
    });

    res.json({
      success: true,
      orderId: order._id,
      transactionReference: result.TransactionReference,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
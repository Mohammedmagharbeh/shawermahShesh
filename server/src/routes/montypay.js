// const express = require("express");
// const router = express.Router();
// const fs = require("fs");
// const axios = require("axios");
// require("dotenv").config();

// // ========================
// // إعدادات MontyPay من env (اختياري للتست الحقيقي)
// const MONTY_BASE =
//   process.env.MONTY_BASE_URL || "https://checkout.montypay.com/api/v1";
// const MERCHANT_KEY =
//   process.env.MONTY_MERCHANT_KEY || "0d4d0efc-cb5f-11f0-87fe-5e5806863738";
// const MERCHANT_PASSWORD =
//   process.env.MERCHANT_PASSWORD || "c1f940613823814205d1b43cd655bd43";
// // ========================

// // 1) إنشاء جلسة دفع
// router.post("/session", async (req, res) => {
//   try {
//     const { amount, currency = "JOD", customerName, customerEmail } = req.body;

//     // إذا بدك تختبر محلي بدون الاتصال بـ MontyPay
//     const paymentUrl = "https://sandbox.montypay.com/payment/12345"; // مثال وهمي

//     res.json({
//       sessionId: "session_test_123",
//       paymentUrl,
//       amount,
//       currency,
//       customerName,
//       customerEmail,
//     });

//     // إذا بدك الاتصال الحقيقي، استخدم axios مع auth
//     /*
//     const resp = await axios.post(`${MONTY_BASE}/session`, {
//       amount,
//       currency,
//       customer: { name: customerName, email: customerEmail },
//     }, {
//       auth: { username: MERCHANT_KEY, password: MERCHANT_PASSWORD },
//       headers: { "Content-Type": "application/json" }
//     });
//     res.json(resp.data);
//     */
//   } catch (err) {
//     res.status(500).json({ error: err?.response?.data || err.message });
//   }
// });

// // 2) التحقق من حالة الدفع
// router.post("/status", async (req, res) => {
//   try {
//     const { sessionId } = req.body;

//     // للتست المحلي
//     res.json({
//       sessionId,
//       status: "SUCCESS",
//       amount: 1,
//       currency: "JOD",
//     });
//     // للتست الحقيقي مع MontyPay:
//     /*
//     const resp = await axios.get(`${MONTY_BASE}/session/${sessionId}`, {
//       auth: { username: MERCHANT_KEY, password: MERCHANT_PASSWORD }
//     });
//     res.json(resp.data);
//     */
//   } catch (err) {
//     res.status(500).json({ error: err?.response?.data || err.message });
//   }
// });

// // 3) Callback endpoint من MontyPay
// router.post("/callback", express.json(), (req, res) => {
//   try {
//     const data = req.body;
//     console.log("MontyPay Callback Data:", data);

//     // حفظ بيانات الاختبار في JSON
//     fs.writeFileSync("callback_test.json", JSON.stringify(data, null, 2));

//     res.status(200).send("OK");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("error");
    
//   }
// });

// module.exports = router;



const express = require("express");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const router = express.Router();

// ========================
// إعدادات MontyPay من env
const MONTY_BASE = process.env.MONTY_BASE_URL || "https://checkout.montypay.com/api/v1";
const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_PASSWORD = process.env.MERCHANT_PASSWORD;

// ========================

// 1) إنشاء جلسة دفع
router.post("/session", async (req, res) => {
  try {
    const { amount, currency = "JOD", customerName, customerEmail } = req.body;

    const payload = {
      amount,
      currency,
      customer: { name: customerName, email: customerEmail },
      success_url: "https://shawermahshesh-1.onrender.com/success", // صفحة الدفع الناجح عندك
      cancel_url: "https://shawermahshesh-1.onrender.com/cancel",   // صفحة الدفع الملغي عندك
    };

    const response = await axios.post(`${MONTY_BASE}/session`, payload, {
      auth: { username: MERCHANT_KEY, password: MERCHANT_PASSWORD },
      headers: { "Content-Type": "application/json" },
    });

    res.json(response.data); // يحتوي على sessionId وpaymentUrl
  } catch (err) {
    console.error("Session error:", err.response?.data || err);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 2) التحقق من حالة الدفع
router.post("/status", async (req, res) => {
  try {
    const { sessionId } = req.body;

    const response = await axios.get(`${MONTY_BASE}/session/${sessionId}`, {
      auth: { username: MERCHANT_KEY, password: MERCHANT_PASSWORD },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Status error:", err.response?.data || err);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 3) Callback endpoint من MontyPay
router.post("/callback", express.json(), (req, res) => {
  try {
    const data = req.body;
    console.log("MontyPay Callback Data:", data);

    // حفظ البيانات في ملف log
    fs.appendFileSync("callback_log.json", JSON.stringify(data, null, 2) + "\n");

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

// 4) صفحات الدفع للـ React
router.get("/success", (req, res) => res.send("<h1>Payment Successful!</h1>"));
router.get("/cancel", (req, res) => res.send("<h1>Payment Canceled!</h1>"));

module.exports = router;



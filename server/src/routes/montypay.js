const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/orders");
require("dotenv").config();

const router = express.Router();

// HARDCODED KEYS
const MONTY_BASE = process.env.MONTY_BASE;
const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_PASSWORD = process.env.MERCHANT_PASSWORD;

// 1) Create Payment Session
router.post("/session", async (req, res) => {
  try {
    const {
      amount,
      currency = "JOD",
      customerName,
      customerEmail,
      orderId,
    } = req.body;

    if (!amount || !customerName || !customerEmail || !orderId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const threeDecimalCurrencies = ["JOD", "KWD", "OMR", "BHD", "TND"];
    const decimals = threeDecimalCurrencies.includes(currency.toUpperCase())
      ? 3
      : 2;
    const formattedAmount = Number(amount).toFixed(decimals);
    const description = `Order #${orderId}`;

    const payload = {
      merchant_key: MERCHANT_KEY,
      operation: "purchase",
      order: {
        number: orderId.toString(),
        amount: formattedAmount,
        currency: currency,
        description: description,
      },
      customer: {
        name: customerName,
        email: customerEmail,
      },
      // ✅ UPDATED: Pass orderId in URL so frontend can read it
      success_url: `${process.env.FRONT_BASE}/success?orderId=${orderId}`,
      cancel_url: `${process.env.FRONT_BASE}/cancel?orderId=${orderId}`,
    };

    // Hash Formula: SHA1(MD5(UPPER(OrderNumber + Amount + Currency + Description + Password)))
    let rawString = `${orderId}${formattedAmount}${currency}${description}${MERCHANT_PASSWORD}`;
    rawString = rawString.toUpperCase();

    const md5Hash = crypto.createHash("md5").update(rawString).digest("hex");
    payload.hash = crypto.createHash("sha1").update(md5Hash).digest("hex");

    const response = await axios.post(`${MONTY_BASE}/session`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Session error:", err.response?.data || err);
    res
      .status(500)
      .json({ error: "Payment Session Failed", details: err.response?.data });
  }
});

// 2) ✅ NEW: Get Transaction Status
router.post("/status", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    // Hash Formula for Status (by order_id):
    // SHA1(MD5(UPPER(order_id + merchant_pass)))
    let rawString = `${orderId}${MERCHANT_PASSWORD}`;
    rawString = rawString.toUpperCase();

    const md5Hash = crypto.createHash("md5").update(rawString).digest("hex");
    const hash = crypto.createHash("sha1").update(md5Hash).digest("hex");

    const payload = {
      merchant_key: MERCHANT_KEY,
      order_id: orderId.toString(),
      hash: hash,
    };

    const response = await axios.post(`${MONTY_BASE}/payment/status`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // MontyPay returns { status: 'settled' | 'success', ... }
    res.json(response.data);
  } catch (err) {
    console.error("Status check error:", err.response?.data || err);
    res
      .status(500)
      .json({ error: "Status Check Failed", details: err.response?.data });
  }
});

// 3) Callback Endpoint
router.post("/callback", async (req, res) => {
  try {
    const data = req.body;
    console.log("MontyPay Callback:", JSON.stringify(data, null, 2));

    if (
      ["COMPLETED", "PAID", "SUCCESS", "SETTLED"].includes(
        data.status?.toUpperCase()
      )
    ) {
      const orderId = data.order?.number || data.merchant_reference;

      if (orderId) {
        // Note: Orders are now created after payment success in PaymentSuccess.jsx
        // This callback might run before the order is created, so we check if it exists
        const updatedOrder = await Order.findByIdAndUpdate(orderId, {
          "payment.status": "paid",
          "payment.transactionId": data.payment_id || data.session_id,
          "payment.paidAt": new Date(),
          status: "Confirmed",
        });

        if (updatedOrder) {
          console.log(`Order ${orderId} UPDATED to PAID via callback.`);
        } else {
          // Order doesn't exist yet - it will be created in PaymentSuccess.jsx
          console.log(
            `Order ${orderId} not found in callback (will be created in PaymentSuccess).`
          );
        }
      }
    }
    res.status(200).send("OK");
  } catch (err) {
    console.error("Callback Error:", err);
    res.status(500).send("error");
  }
});

module.exports = router;

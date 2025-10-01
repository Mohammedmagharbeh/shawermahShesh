// routes/myfatoorah.js
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();
const MF_BASE = process.env.MF_BASE_URL || "https://apitest.myfatoorah.com/v2";
const MF_TOKEN = process.env.MF_API_TOKEN;

// 1) InitiatePayment - get available methods (optional)
router.post("/initiate", async (req, res) => {
  try {
    const { amount, currency = "JOD" } = req.body;
    const resp = await axios.post(
      `${MF_BASE}/InitiatePayment`,
      { InvoiceAmount: amount, CurrencyIso: currency },
      {
        headers: {
          Authorization: `Bearer ${MF_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(resp.data);
  } catch (err) {
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

// 2) ExecutePayment - create invoice & get PaymentURL
router.post("/execute", async (req, res) => {
  try {
    const {
      paymentMethodId,
      amount,
      currency = "JOD",
      customerName,
      customerEmail,
      customerMobile,
      callbackUrl,
      errorUrl,
    } = req.body;

    const body = {
      PaymentMethodId: paymentMethodId,
      InvoiceValue: amount,
      DisplayCurrencyIso: currency,
      CustomerName: customerName,
      CustomerEmail: customerEmail,
      CustomerMobile: customerMobile,
      CallBackUrl: callbackUrl,
      ErrorUrl: errorUrl,
      Language: "AR",
    };

    const resp = await axios.post(`${MF_BASE}/ExecutePayment`, body, {
      headers: {
        Authorization: `Bearer ${MF_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    // resp.data.Data.PaymentURL contains the URL to redirect the customer to
    res.json(resp.data);
  } catch (err) {
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

// 3) GetPaymentStatus — call when you have paymentId (from callback) to verify
router.post("/status", async (req, res) => {
  try {
    const { paymentId } = req.body;
    const resp = await axios.post(
      `${MF_BASE}/GetPaymentStatus`,
      { Key: paymentId, KeyType: "PaymentId" },
      {
        headers: {
          Authorization: `Bearer ${MF_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(resp.data);
  } catch (err) {
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

// 4) Webhook endpoint (raw body) — verify signature and update order
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["myfatoorah-signature"]; // header name per docs
      const secret = process.env.MF_WEBHOOK_SECRET;
      if (!signature || !secret)
        return res.status(400).send("missing signature/secret");

      // NOTE: MyFatoorah sends a signature header; verify with HMAC-SHA256 over raw body (see docs)
      const computed = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      // Timing-safe comparison
      const sigBuf = Buffer.from(signature, "utf8");
      const compBuf = Buffer.from(computed, "utf8");
      if (
        sigBuf.length !== compBuf.length ||
        !crypto.timingSafeEqual(sigBuf, compBuf)
      ) {
        return res.status(401).send("invalid signature");
      }

      const event = JSON.parse(req.body.toString("utf8"));
      // Example: if payment status changed:
      if (
        event &&
        event.Event &&
        event.Event.Name === "PAYMENT_STATUS_CHANGED"
      ) {
        // read event.Data.InvoiceId or Payment info then call /GetPaymentStatus to be sure
        // update your order record accordingly
      }

      res.status(200).send("OK");
    } catch (err) {
      res.status(500).send("err");
    }
  }
);

module.exports = router;

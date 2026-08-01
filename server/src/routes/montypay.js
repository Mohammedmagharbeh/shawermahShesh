const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/orders");
const User = require("../models/user");
const Product = require("../models/products");
const Location = require("../models/locations");
const Cart = require("../models/cart");
const CheckoutSession = require("../models/checkoutSession");
const { createOrderLogic } = require("../controller/orderController");
const { recordPromoUsage } = require("../controller/promoCodeController"); // ✅ جديد
require("dotenv").config();

const router = express.Router();

const MONTY_BASE = process.env.MONTY_BASE;
const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_PASSWORD = process.env.MERCHANT_PASSWORD;

const getUpperString = (value) =>
  value == null ? "" : String(value).toUpperCase().trim();

/** MontyPay checkout callback: money captured only when order is settled and txn is a charge type. */
const MONTY_CALLBACK_PAID_TYPES = new Set([
  "SALE",
  "CAPTURE",
  "DEBIT",
  "TRANSFER",
]);

/**
 * MontyPay semantics (see checkout_integration docs):
 * - Callback: `status` = transaction result (success even for redirect/3ds steps).
 *   Payment is NOT complete until `order_status` = settled AND `type` is sale/capture/debit/transfer.
 * - GET /payment/status JSON: top-level `status` is payment lifecycle; only `settled` means paid.
 */
const isSuccessfulMontyPayment = (payload = {}) => {
  const orderStatus = getUpperString(
    payload.order_status ?? payload.orderStatus,
  );
  const txnStatus = getUpperString(payload.status);
  const txnType = getUpperString(payload.type);

  const hasCallbackShape =
    orderStatus.length > 0 ||
    txnType.length > 0 ||
    (payload.order_number != null && payload.order_number !== "");

  if (hasCallbackShape) {
    if (txnStatus !== "SUCCESS") return false;
    if (orderStatus !== "SETTLED") return false;
    if (!MONTY_CALLBACK_PAID_TYPES.has(txnType)) return false;
    return true;
  }

  // /api/v1/payment/status (by order_id): JSON uses top-level `status` for payment phase
  if (
    payload.payment_id != null &&
    payload.order != null &&
    typeof payload.order === "object"
  ) {
    return getUpperString(payload.status) === "SETTLED";
  }

  return false;
};

/** When status API returns an array (size param), use the latest settled row if any. */
const normalizeMontyStatusPayload = (data) => {
  if (!Array.isArray(data) || data.length === 0) return data;
  for (let i = data.length - 1; i >= 0; i -= 1) {
    if (getUpperString(data[i]?.status) === "SETTLED") return data[i];
  }
  return data[data.length - 1];
};

const extractDbOrderId = (...possibleRefs) => {
  for (const ref of possibleRefs) {
    if (ref == null) continue;
    const text = String(ref);
    const direct = text.trim();
    if (mongoose.Types.ObjectId.isValid(direct)) return direct;

    const matches = text.match(/[a-fA-F0-9]{24}/g);
    if (!matches?.length) continue;

    for (let i = matches.length - 1; i >= 0; i -= 1) {
      if (mongoose.Types.ObjectId.isValid(matches[i])) return matches[i];
    }
  }

  return null;
};

// ─── Shared helpers removed; utilizing orderController.createOrderLogic directly ───

// ─── 0) Redirect Proxy (Deep Links) ──────────────────────────────────────────
router.get("/redirect", (req, res) => {
  const { to } = req.query;
  if (!to) return res.status(400).send("Missing redirect destination");
  res.redirect(to);
});

// ─── 1) Create Payment Session + Pre-create Order ────────────────────────────
router.post("/session", async (req, res) => {
  try {
    const {
      amount,
      currency = "JOD",
      customerName,
      customerEmail,
      customerPhone,
      description,
      orderData, // { products, userId, shippingAddress, orderType, userDetails, paymentMethod, promoCode, discountAmount }
      successUrl, // Optional overrides for mobile apps
      cancelUrl,
    } = req.body;

    if (!amount || !customerName || !customerEmail || !orderData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Step 1: Serialize orderData into CheckoutSession instead of creating a real unpaid Order prematurely
    const sessionDoc = await CheckoutSession.create({
      orderData,
      paymentGateway: "montypay",
    });
    const dbOrderId = sessionDoc._id.toString();

    // Step 2: Build MontyPay session
    const threeDecimalCurrencies = ["JOD", "KWD", "OMR", "BHD", "TND"];
    const decimals = threeDecimalCurrencies.includes(currency.toUpperCase())
      ? 3
      : 2;
    const formattedAmount = Number(amount).toFixed(decimals);

    // Use ASCII-safe description — MUST be identical in payload and hash
    const safeDescription = description
      ? description.replace(/[^\x00-\x7F]/g, "").trim() || "ORDER"
      : "ORDER";

    // Use DB order _id as MontyPay order.number so the callback can find it directly
    const orderNumber = customerPhone
      ? `${customerPhone}-${dbOrderId}`
      : dbOrderId;

    const finalSuccessUrl = successUrl
      ? `${successUrl}?dbOrderId=${dbOrderId}&orderRef=${encodeURIComponent(orderNumber)}`
      : `${process.env.FRONT_BASE}/success?dbOrderId=${dbOrderId}&orderRef=${encodeURIComponent(orderNumber)}`;

    const finalCancelUrl = cancelUrl
      ? `${cancelUrl}?dbOrderId=${dbOrderId}`
      : `${process.env.FRONT_BASE}/cancel?dbOrderId=${dbOrderId}`;

    // Use the actual request host so mobile devices don't get routed to localhost loopback
    const reqHost = req.get("host");
    const protocol = req.protocol || "http";
    const actualBackendUrl = `${protocol}://${reqHost}`;

    const proxyUrlIfNeeded = (url) => {
      if (typeof url === "string" && !url.startsWith("http")) {
        return `${actualBackendUrl}/api/montypay/redirect?to=${encodeURIComponent(url)}`;
      }
      return url;
    };

    const payload = {
      merchant_key: MERCHANT_KEY,
      operation: "purchase",
      order: {
        number: orderNumber,
        amount: formattedAmount,
        currency: currency,
        description: safeDescription,
      },
      customer: {
        name: /^[A-Za-z]+(?: [A-Za-z]+)+$/.test(customerName)
          ? customerName
          : "John Doe",
        email: customerEmail,
      },
      success_url: proxyUrlIfNeeded(finalSuccessUrl),
      cancel_url: proxyUrlIfNeeded(finalCancelUrl),
      // Tell MontyPay where to send the server-to-server payment confirmation
      callback_url: `${process.env.BACK_BASE}/api/montypay/callback`,
    };

    // Hash: SHA1(MD5(UPPER(OrderNumber + Amount + Currency + Description + Password)))
    const rawString =
      `${orderNumber}${formattedAmount}${currency}${safeDescription}${MERCHANT_PASSWORD}`.toUpperCase();
    const md5Hash = crypto.createHash("md5").update(rawString).digest("hex");
    payload.hash = crypto.createHash("sha1").update(md5Hash).digest("hex");

    const response = await axios.post(`${MONTY_BASE}/session`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Return redirect URL + the DB order ID so the frontend can pass it along if needed
    res.json({ ...response.data, dbOrderId });
  } catch (err) {
    console.error("Session error:", err.response?.data || err.message || err);
    res.status(500).json({
      error: "Payment Session Failed",
      details: err.response?.data || err.message,
    });
  }
});

// ─── 2) Callback — MontyPay confirms payment server-to-server ────────────────
router.post("/callback", async (req, res) => {
  try {
    const data = req.body;
    console.log("MontyPay Callback:", JSON.stringify(data, null, 2));

    // Apple Pay / card payments may return different status strings depending on payment method.
    // Log the full status so we can diagnose any new ones from server logs.
    const rawStatus = getUpperString(
      data.status || data.payment_status || data.result,
    );
    console.log(
      "MontyPay Callback:",
      "txn status=",
      rawStatus,
      "order_status=",
      getUpperString(data.order_status),
      "type=",
      getUpperString(data.type),
    );
    const isPaid = isSuccessfulMontyPayment(data);

    if (isPaid) {
      const orderRef =
        data.order?.number ||
        data.order_id ||
        data.merchant_reference ||
        data.reference ||
        data.merchant_order_id ||
        data.order_number ||
        "";
      const dbOrderId = extractDbOrderId(
        data.dbOrderId,
        data.order?.number,
        data.order?.id,
        data.order_id,
        data.merchant_reference,
        data.reference,
        data.merchant_order_id,
        data.order_number,
      );

      if (dbOrderId) {
        let updatedOrder = await Order.findById(dbOrderId);

        if (!updatedOrder) {
          // Attempt to extract from CheckoutSession
          const session = await CheckoutSession.findById(dbOrderId);
          if (session) {
            const io = req.app.get("io");
            try {
              updatedOrder = await createOrderLogic({
                ...session.orderData,
                paymentMethod: session.orderData.paymentMethod || "card",
                transactionId:
                  data.id ||
                  data.payment_id ||
                  data.session_id ||
                  data.trans_id ||
                  null,
                paidAt: new Date(),
                status: "Processing",
                paymentStatus: "paid",
                io,
              });
              console.log(
                `✅ Order ${updatedOrder._id} successfully created from CheckoutSession via callback.`,
              );
              // Clean up session
              await CheckoutSession.findByIdAndDelete(dbOrderId);
            } catch (createErr) {
              console.error(
                "Failed creating order from session in callback:",
                createErr,
              );
            }
          }
        } else if (updatedOrder.payment?.status !== "paid") {
          // Fallback legacy functionality if order was actively in DB
          updatedOrder = await Order.findByIdAndUpdate(
            dbOrderId,
            {
              "payment.status": "paid",
              "payment.transactionId":
                data.id ||
                data.payment_id ||
                data.session_id ||
                data.trans_id ||
                null,
              "payment.paidAt": new Date(),
              status: "Processing",
            },
            { new: true },
          )
            .populate("products.productId")
            .populate("userId")
            .populate("shippingAddress");

          if (updatedOrder) {
            console.log(`✅ Order ${dbOrderId} updated via callback.`);
            const io = req.app.get("io");
            if (io) io.emit("newOrder", updatedOrder);

            if (updatedOrder.promoCode) {
              try {
                await recordPromoUsage(
                  updatedOrder.promoCode,
                  updatedOrder.userId._id || updatedOrder.userId,
                  updatedOrder._id,
                );
              } catch (e) {
                console.error("Failed to record promo usage:", e.message);
              }
            }

            // Clear the cart on successful payment legacy
            await Cart.findOneAndUpdate(
              { userId: updatedOrder.userId._id || updatedOrder.userId },
              { products: [] },
            );
          }
        } else {
          console.log(
            `✅ Callback received but Order ${dbOrderId} is already paid.`,
          );
        }

        if (!updatedOrder) {
          console.warn(
            `⚠️ Callback: neither order nor session found for ID ${dbOrderId}`,
          );
        }
      } else
        console.warn(
          "⚠️  Callback: could not extract valid order ID from:",
          orderRef,
        );
    } else {
      console.warn(
        "⚠️  Callback: Payment not marked as paid. rawStatus:",
        rawStatus,
      );
    }

    // Must return "OK" exactly, as per MontyPay documentation
    res.status(200).send("OK");
  } catch (err) {
    console.error("Callback Error:", err);
    // Must return "ERROR" exactly, as per MontyPay documentation
    res.status(500).send("ERROR");
  }
});

// ─── 3) Check payment status (kept for admin use / debugging) ────────────────
router.post("/status", async (req, res) => {
  try {
    const { orderNumber } = req.body; // full order.number used in session

    if (!orderNumber)
      return res.status(400).json({ error: "Missing orderNumber" });

    const rawString = `${orderNumber}${MERCHANT_PASSWORD}`.toUpperCase();
    const md5Hash = crypto.createHash("md5").update(rawString).digest("hex");
    const hash = crypto.createHash("sha1").update(md5Hash).digest("hex");

    const response = await axios.post(
      `${MONTY_BASE}/payment/status`,
      { merchant_key: MERCHANT_KEY, order_id: orderNumber, hash },
      { headers: { "Content-Type": "application/json" } },
    );

    res.json(response.data);
  } catch (err) {
    console.error("Status check error:", err.response?.data || err);
    res
      .status(500)
      .json({ error: "Status Check Failed", details: err.response?.data });
  }
});

// ─── 4) Verify & Confirm — fallback called from PaymentSuccess page ──────────
// Used as a safety net if the callback was delayed or missed.
router.post("/verify", async (req, res) => {
  try {
    const { dbOrderId, orderRef } = req.body;

    if (!dbOrderId || !orderRef) {
      return res.status(400).json({ error: "Missing dbOrderId or orderRef" });
    }

    // Check if order is already confirmed (callback may have already fired)
    let existingOrder = await Order.findById(dbOrderId);
    let sessionFound = null;

    if (!existingOrder) {
      sessionFound = await CheckoutSession.findById(dbOrderId);
      if (!sessionFound) {
        return res.status(404).json({ error: "Order/Session not found" });
      }
    }

    if (existingOrder && existingOrder.payment?.status === "paid") {
      // Already confirmed — nothing to do
      return res.json({ success: true, alreadyConfirmed: true });
    }

    // Order not yet paid — ask MontyPay for status
    const rawString = `${orderRef}${MERCHANT_PASSWORD}`.toUpperCase();
    const md5Hash = crypto.createHash("md5").update(rawString).digest("hex");
    const hash = crypto.createHash("sha1").update(md5Hash).digest("hex");

    const montyRes = await axios.post(
      `${MONTY_BASE}/payment/status`,
      { merchant_key: MERCHANT_KEY, order_id: orderRef, hash },
      { headers: { "Content-Type": "application/json" } },
    );

    const montyData = normalizeMontyStatusPayload(montyRes.data);
    const rawStatus = getUpperString(
      montyData.status || montyData.payment_status || montyData.result,
    );
    console.log("MontyPay /verify payment status:", rawStatus);
    const isPaid = isSuccessfulMontyPayment(montyData);

    if (!isPaid) {
      return res.json({
        success: false,
        status: montyData.status,
        reason: montyData.reason,
      });
    }

    // MontyPay confirms payment — resolve order
    let finalOrder = null;
    const transactionId =
      montyData.id || montyData.payment_id || montyData.session_id || null;

    if (sessionFound) {
      const io = req.app.get("io");
      try {
        finalOrder = await createOrderLogic({
          ...sessionFound.orderData,
          paymentMethod: sessionFound.orderData.paymentMethod || "card",
          transactionId,
          paidAt: new Date(),
          status: "Processing",
          paymentStatus: "paid",
          io,
        });
        console.log(
          `✅ Order ${finalOrder._id} confirmed via /verify fallback.`,
        );
        await CheckoutSession.findByIdAndDelete(dbOrderId);
      } catch (err) {
        console.error("Failed creating order from session in verify:", err);
      }
    } else if (existingOrder) {
      finalOrder = await Order.findByIdAndUpdate(
        dbOrderId,
        {
          "payment.status": "paid",
          "payment.transactionId": transactionId,
          "payment.paidAt": new Date(),
          status: "Processing",
        },
        { new: true },
      )
        .populate("products.productId")
        .populate("userId")
        .populate("shippingAddress");

      if (finalOrder) {
        console.log(
          `✅ Order ${dbOrderId} confirmed via legacy /verify fallback.`,
        );
        const io = req.app.get("io");
        if (io) io.emit("newOrder", finalOrder);

        // Clear the cart on successful legacy verification
        await Cart.findOneAndUpdate(
          { userId: finalOrder.userId._id || finalOrder.userId },
          { products: [] },
        );
      }
    }

    if (finalOrder) {
      console.log(
        `✅ Webhook verified successfully for ${finalOrder._id || dbOrderId}.`,
      );
    }

    return res.json({ success: true, alreadyConfirmed: false });
  } catch (err) {
    console.error("Verify error:", err.response?.data || err.message || err);
    res.status(500).json({
      error: "Verification failed",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;

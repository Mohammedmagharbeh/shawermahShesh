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
const SavedCard = require("../models/savedCard");
const { createOrderLogic } = require("../controller/orderController");
const { recordPromoUsage } = require("../controller/promoCodeController");
const validateJWT = require("../middlewares/validateJWT");
require("dotenv").config();

const router = express.Router();

const MONTY_BASE = process.env.MONTY_BASE;
const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_PASSWORD = process.env.MERCHANT_PASSWORD;

const getUpperString = (value) =>
  value == null ? "" : String(value).toUpperCase().trim();

const md5sha1 = (raw) =>
  crypto
    .createHash("sha1")
    .update(crypto.createHash("md5").update(raw).digest("hex"))
    .digest("hex");

/**
 * فحص hash الـ callback (للتسجيل والتحذير فقط، ما بيوقف العملية).
 * الصيغة المتوقعة: SHA1(MD5(UPPER(id + order_number + order_amount + order_currency + order_description + password)))
 * تأكد من توثيق MontyPay، وإذا طلعت "OK" بكل الطلبات بتقدر تخليه إجباري.
 */
const verifyCallbackHash = (d = {}) => {
  try {
    if (!d.hash || !d.id) return false;
    const expected = md5sha1(
      `${d.id}${d.order_number}${d.order_amount}${d.order_currency}${d.order_description}${MERCHANT_PASSWORD}`.toUpperCase(),
    );
    return expected === d.hash;
  } catch {
    return false;
  }
};

/** MontyPay checkout callback: money captured only when order is settled and txn is a charge type. */
const MONTY_CALLBACK_PAID_TYPES = new Set([
  "SALE",
  "CAPTURE",
  "DEBIT",
  "TRANSFER",
]);

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

  if (
    payload.payment_id != null &&
    payload.order != null &&
    typeof payload.order === "object"
  ) {
    return getUpperString(payload.status) === "SETTLED";
  }

  return false;
};

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

// ─── 0) Redirect Proxy (Deep Links) ──────────────────────────────────────────
router.get("/redirect", (req, res) => {
  const { to } = req.query;
  if (!to) return res.status(400).send("Missing redirect destination");
  res.redirect(to);
});

// ─── 1) Create Payment Session ───────────────────────────────────────────────
router.post("/session", async (req, res) => {
  try {
    const {
      amount,
      currency = "JOD",
      customerName,
      customerEmail,
      customerPhone,
      description,
      orderData,
      successUrl,
      cancelUrl,
      saveCard, // لازم يجي boolean true من الفرونت
    } = req.body;

    if (!amount || !customerName || !customerEmail || !orderData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sessionDoc = await CheckoutSession.create({
      orderData,
      paymentGateway: "montypay",
    });
    const dbOrderId = sessionDoc._id.toString();

    const threeDecimalCurrencies = ["JOD", "KWD", "OMR", "BHD", "TND"];
    const decimals = threeDecimalCurrencies.includes(currency.toUpperCase())
      ? 3
      : 2;
    const formattedAmount = Number(amount).toFixed(decimals);

    // ASCII-safe description — MUST be identical in payload and hash
    const safeDescription = description
      ? description.replace(/[^\x00-\x7F]/g, "").trim() || "ORDER"
      : "ORDER";

    const orderNumber = customerPhone
      ? `${customerPhone}-${dbOrderId}`
      : dbOrderId;

    const finalSuccessUrl = successUrl
      ? `${successUrl}?dbOrderId=${dbOrderId}&orderRef=${encodeURIComponent(orderNumber)}`
      : `${process.env.FRONT_BASE}/success?dbOrderId=${dbOrderId}&orderRef=${encodeURIComponent(orderNumber)}`;

    const finalCancelUrl = cancelUrl
      ? `${cancelUrl}?dbOrderId=${dbOrderId}`
      : `${process.env.FRONT_BASE}/cancel?dbOrderId=${dbOrderId}`;

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
      callback_url: `${process.env.BACK_BASE || "https://shawermahshesh.onrender.com"}/api/montypay/callback`,
    };

    console.log("saveCard received:", saveCard);

    // ✅ Adjusted Tokenization Flags
    if (saveCard === true) {
      payload.recurring_init = "true";
      payload.req_token = "Y"; // Commonly required by MEA gateways
    }

    console.log("recurring_init sent:", payload.recurring_init);

    // Hash: SHA1(MD5(UPPER(OrderNumber + Amount + Currency + Description + Password)))
    payload.hash = md5sha1(
      `${orderNumber}${formattedAmount}${currency}${safeDescription}${MERCHANT_PASSWORD}`.toUpperCase(),
    );

    const response = await axios.post(`${MONTY_BASE}/session`, payload, {
      headers: { "Content-Type": "application/json" },
    });

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

    // فحص الـ hash (تحذير فقط حالياً)
    console.log(
      "Callback hash check:",
      verifyCallbackHash(data) ? "OK" : "MISMATCH/UNVERIFIED",
    );

    // لوق واضح لحقول الـ recurring كلها
    console.log("Recurring-related fields in callback:", {
      recurring_token: data.recurring_token,
      recurring_init_trans_id: data.recurring_init_trans_id,
      card_token: data.card_token,
      allKeys: Object.keys(data),
    });

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
          const session = await CheckoutSession.findById(dbOrderId);
          if (session) {
            const io = req.app.get("io");
            try {
              updatedOrder = await createOrderLogic({
                ...session.orderData,
                _id: session._id,
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
              await CheckoutSession.findByIdAndDelete(dbOrderId);
            } catch (createErr) {
              console.error(
                "Failed creating order from session in callback:",
                createErr,
              );
            }
          }
        } else if (updatedOrder.payment?.status !== "paid") {
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

        // ✅ حفظ الكرت — فقط لو MontyPay رجّعت الحقلين الحقيقيين
        const recurringToken = data.recurring_token || null;
        const recurringInitTransId = data.recurring_init_trans_id || null;
        const actualUserId = updatedOrder
          ? updatedOrder.userId?._id || updatedOrder.userId
          : null;

        if (recurringToken && recurringInitTransId && actualUserId) {
          try {
            const last4 =
              typeof data.card === "string" ? data.card.slice(-4) : undefined;
            await SavedCard.findOneAndUpdate(
              { userId: actualUserId, card_last_4: last4 },
              {
                userId: actualUserId,
                recurring_init_trans_id: recurringInitTransId,
                recurring_token: recurringToken,
                card_last_4: last4,
              },
              { upsert: true, new: true },
            );
            console.log(`✅ Saved card ****${last4} for user ${actualUserId}`);
          } catch (cardErr) {
            console.error("Failed to save card info (non-critical):", cardErr);
          }
        } else if (
          data.recurring_init_trans_id ||
          data.recurring_token ||
          data.card_token
        ) {
          // ملاحظة: card_token مش بديل عن recurring_token، لا نحفظه كـ recurring
          console.warn(
            "⚠️ Callback has partial/other token data, card NOT saved:",
            {
              hasRecurringToken: !!recurringToken,
              hasInitTransId: !!recurringInitTransId,
              hasCardToken: !!data.card_token,
              hasUser: !!actualUserId,
            },
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

    res.status(200).send("OK");
  } catch (err) {
    console.error("Callback Error:", err);
    res.status(500).send("ERROR");
  }
});

// ─── 3) Check payment status (admin/debug) ───────────────────────────────────
router.post("/status", async (req, res) => {
  try {
    const { orderNumber } = req.body;

    if (!orderNumber)
      return res.status(400).json({ error: "Missing orderNumber" });

    const hash = md5sha1(`${orderNumber}${MERCHANT_PASSWORD}`.toUpperCase());

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
router.post("/verify", async (req, res) => {
  try {
    const { dbOrderId, orderRef } = req.body;

    if (!dbOrderId || !orderRef) {
      return res.status(400).json({ error: "Missing dbOrderId or orderRef" });
    }

    let existingOrder = await Order.findById(dbOrderId);
    let sessionFound = null;

    if (!existingOrder) {
      sessionFound = await CheckoutSession.findById(dbOrderId);
      if (!sessionFound) {
        return res.status(404).json({ error: "Order/Session not found" });
      }
    }

    if (existingOrder && existingOrder.payment?.status === "paid") {
      return res.json({ success: true, alreadyConfirmed: true });
    }

    const hash = md5sha1(`${orderRef}${MERCHANT_PASSWORD}`.toUpperCase());

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
      
      // ✅ حفظ الكرت في الـ verify كـ fallback (مفيد جداً في بيئة الـ localhost)
      const recurringToken = montyData.recurring_token || null;
      const recurringInitTransId = montyData.recurring_init_trans_id || null;
      const actualUserId = finalOrder.userId?._id || finalOrder.userId;

      if (recurringToken && recurringInitTransId && actualUserId) {
        try {
          const last4 =
            typeof montyData.card === "string" ? montyData.card.slice(-4) : undefined;
          await SavedCard.findOneAndUpdate(
            { userId: actualUserId, card_last_4: last4 },
            {
              userId: actualUserId,
              recurring_init_trans_id: recurringInitTransId,
              recurring_token: recurringToken,
              card_last_4: last4,
            },
            { upsert: true, new: true },
          );
          console.log(`✅ Saved card ****${last4} for user ${actualUserId} via /verify fallback`);
        } catch (cardErr) {
          console.error("Failed to save card info in verify (non-critical):", cardErr);
        }
      }
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

// ─── 5) Get user's saved cards (بدون التوكنات) ───────────────────────────────
router.get("/saved-cards", validateJWT, async (req, res) => {
  try {
    const cards = await SavedCard.find({ userId: req.user._id }).select(
      "_id card_brand card_last_4 isDefault createdAt",
    );
    res.json({ success: true, cards });
  } catch (err) {
    console.error("Fetch cards error:", err);
    res.status(500).json({ error: "Failed to fetch saved cards" });
  }
});

// ─── 6) Pay with saved card (Recurring Sale) ─────────────────────────────────
router.post("/recurring", validateJWT, async (req, res) => {
  try {
    const { amount, currency = "JOD", orderData, savedCardId } = req.body;

    if (!amount || !orderData || !savedCardId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // الكرت لازم يكون تبع نفس المستخدم
    const savedCard = await SavedCard.findOne({
      _id: savedCardId,
      userId: req.user._id,
    });
    if (!savedCard) {
      return res.status(404).json({ error: "Saved card not found" });
    }

    // امنع تغيير الـ userId من الفرونت
    const safeOrderData = { ...orderData, userId: req.user._id };

    const sessionDoc = await CheckoutSession.create({
      orderData: safeOrderData,
      paymentGateway: "montypay",
    });
    const dbOrderId = sessionDoc._id.toString();

    const threeDecimalCurrencies = ["JOD", "KWD", "OMR", "BHD", "TND"];
    const decimals = threeDecimalCurrencies.includes(currency.toUpperCase())
      ? 3
      : 2;
    const formattedAmount = Number(amount).toFixed(decimals);
    const safeDescription = "Recurring Order";

    const payload = {
      merchant_key: MERCHANT_KEY,
      recurring_init_trans_id: savedCard.recurring_init_trans_id,
      recurring_token: savedCard.recurring_token,
      order: {
        number: dbOrderId,
        amount: formattedAmount,
        description: safeDescription,
      },
    };

    // Hash حسب توثيق Recurring Sale (بدون currency):
    // SHA1(MD5(UPPER(recurring_init_trans_id + recurring_token + order.number + order.amount + order.description + password)))
    payload.hash = md5sha1(
      `${savedCard.recurring_init_trans_id}${savedCard.recurring_token}${dbOrderId}${formattedAmount}${safeDescription}${MERCHANT_PASSWORD}`.toUpperCase(),
    );

    const response = await axios.post(
      `${MONTY_BASE}/payment/recurring`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );

    const data = response.data;
    console.log("MontyPay Recurring response:", JSON.stringify(data, null, 2));

    if (getUpperString(data.status) === "SETTLED") {
      const io = req.app.get("io");
      const transactionId = data.payment_id || data.id || null;

      const finalOrder = await createOrderLogic({
        ...safeOrderData,
        paymentMethod: safeOrderData.paymentMethod || "card",
        transactionId,
        paidAt: new Date(),
        status: "Processing",
        paymentStatus: "paid",
        io,
      });
      await CheckoutSession.findByIdAndDelete(dbOrderId);
      return res.json({ success: true, dbOrderId: finalOrder._id });
    }

    return res.status(400).json({
      success: false,
      status: data.status,
      reason: data.reason,
    });
  } catch (err) {
    console.error("Recurring error:", err.response?.data || err.message || err);
    res.status(500).json({
      error: "Recurring payment failed",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;

const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/orders");
const User = require("../models/user");
const Product = require("../models/products");
const Location = require("../models/locations");
require("dotenv").config();

const router = express.Router();

const MONTY_BASE = process.env.MONTY_BASE;
const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_PASSWORD = process.env.MERCHANT_PASSWORD;

// ─── Shared helpers (same logic as orderController) ──────────────────────────

const getAdditionFromProduct = (matchedProduct, addRef) => {
  if (!matchedProduct || !Array.isArray(matchedProduct.additions)) return null;
  if (addRef?._id) {
    const found = matchedProduct.additions.find(
      (a) => a._id.toString() === addRef._id.toString()
    );
    if (found) return { _id: found._id, name: found.name, price: Number(found.price || 0) };
  }
  if (addRef?.name?.en) {
    const found = matchedProduct.additions.find((a) => a.name?.en === addRef.name.en);
    if (found) return { _id: found._id, name: found.name, price: Number(found.price || 0) };
  }
  return null;
};

const getVariationPrice = (matchedProduct, selectedProtein, selectedType) => {
  if (!matchedProduct) return 0;
  if (selectedProtein && selectedType && matchedProduct.prices?.[selectedProtein]?.[selectedType] != null)
    return Number(matchedProduct.prices[selectedProtein][selectedType]);
  if (selectedType && matchedProduct.prices?.[selectedType] != null)
    return Number(matchedProduct.prices[selectedType]);
  if (selectedProtein && matchedProduct.prices?.[selectedProtein] != null)
    return Number(matchedProduct.prices[selectedProtein]);
  return Number(matchedProduct.basePrice || 0);
};

/**
 * Creates an order document in MongoDB.
 * Throws on validation errors so the caller can handle them.
 */
async function createPendingOrder({ userId, products, shippingAddress, orderType, userDetails, paymentMethod, io }) {
  const foundUser = await User.findById(userId);
  if (!foundUser) throw new Error("User not found");

  let location = null;
  if (orderType === "delivery") {
    location = await Location.findById(shippingAddress);
    if (!location) throw new Error("Invalid shipping address");
  }

  const productIds = products.map((p) => (p.productId?._id ? p.productId._id : p.productId));
  const uniqueProductIds = [...new Set(productIds.map((id) => id.toString()))];
  const dbProducts = await Product.find({ _id: { $in: uniqueProductIds } });

  const missing = uniqueProductIds.filter(
    (id) => !dbProducts.some((dp) => dp._id.toString() === id)
  );
  if (missing.length) throw new Error(`Products not found: ${missing.join(", ")}`);

  const enrichedProducts = products.map((p) => {
    const productId = p.productId?._id ? p.productId._id.toString() : p.productId.toString();
    const matchedProduct = dbProducts.find((dp) => dp._id.toString() === productId);
    const quantity = Number(p.quantity || 1);
    const basePriceRaw = getVariationPrice(matchedProduct, p.selectedProtein, p.selectedType);
    const discountPct = Number(matchedProduct.discount || 0);
    const priceAtPurchase = discountPct > 0 ? basePriceRaw - (basePriceRaw * discountPct) / 100 : basePriceRaw;

    const normalizedAdditions = (p.additions || []).map((add) => {
      if (add && add.price !== undefined && (add.name || add._id)) {
        return { _id: add._id || undefined, name: add.name || undefined, price: Number(add.price || 0), quantity: Number(add.quantity || 1) };
      }
      const resolved = getAdditionFromProduct(matchedProduct, add);
      if (resolved) return { _id: resolved._id, name: resolved.name, price: Number(resolved.price || 0), quantity: 1 };
      return { _id: add?._id, name: add?.name, price: 0, quantity: Number(add?.quantity || 1) };
    });

    return { productId, quantity, additions: normalizedAdditions, priceAtPurchase: Number(priceAtPurchase || 0), isSpicy: Boolean(p.isSpicy || false), notes: p.notes || "", selectedProtein: p.selectedProtein || null, selectedType: p.selectedType || null };
  });

  const productsTotal = enrichedProducts.reduce((sum, item) => {
    const addSum = (item.additions || []).reduce((a, add) => a + Number(add.price || 0) * Number(add.quantity || 1), 0);
    return sum + (Number(item.priceAtPurchase || 0) + addSum) * Number(item.quantity || 1);
  }, 0);

  const totalPrice = Number(productsTotal) + Number(location?.deliveryCost || 0);

  const newOrder = await Order.create({
    userId,
    products: enrichedProducts,
    totalPrice,
    status: "Processing",
    shippingAddress: orderType === "delivery" ? shippingAddress : null,
    payment: { status: "unpaid", method: paymentMethod || "card", transactionId: null, paidAt: null },
    orderType,
    userDetails,
  });

  const populatedOrder = await newOrder.populate([
    { path: "products.productId" },
    { path: "userId" },
    { path: "shippingAddress" },
  ]);

  // Do NOT emit "newOrder" here — the order is unpaid.
  // The MontyPay callback will emit "newOrder" once payment is confirmed.

  return populatedOrder;
}

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
      orderData, // { products, userId, shippingAddress, orderType, userDetails, paymentMethod }
    } = req.body;

    if (!amount || !customerName || !customerEmail || !orderData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Step 1: Create order in DB first (status: Processing, payment: unpaid)
    const io = req.app.get("io");
    const order = await createPendingOrder({ ...orderData, io });
    const dbOrderId = order._id.toString();

    // Step 2: Build MontyPay session
    const threeDecimalCurrencies = ["JOD", "KWD", "OMR", "BHD", "TND"];
    const decimals = threeDecimalCurrencies.includes(currency.toUpperCase()) ? 3 : 2;
    const formattedAmount = Number(amount).toFixed(decimals);

    // Use ASCII-safe description — MUST be identical in payload and hash
    const safeDescription = description
      ? description.replace(/[^\x00-\x7F]/g, "").trim() || "ORDER"
      : "ORDER";

    // Use DB order _id as MontyPay order.number so the callback can find it directly
    const orderNumber = customerPhone
      ? `${customerPhone}-${dbOrderId}`
      : dbOrderId;

    const payload = {
      merchant_key: MERCHANT_KEY,
      operation: "purchase",
      order: {
        number: orderNumber,
        amount: formattedAmount,
        currency: currency,
        description: safeDescription,
      },
      customer: { name: customerName, email: customerEmail },
      success_url: `${process.env.FRONT_BASE}/success?dbOrderId=${dbOrderId}`,
      cancel_url: `${process.env.FRONT_BASE}/cancel?dbOrderId=${dbOrderId}`,
    };

    // Hash: SHA1(MD5(UPPER(OrderNumber + Amount + Currency + Description + Password)))
    const rawString = `${orderNumber}${formattedAmount}${currency}${safeDescription}${MERCHANT_PASSWORD}`.toUpperCase();
    const md5Hash = crypto.createHash("md5").update(rawString).digest("hex");
    payload.hash = crypto.createHash("sha1").update(md5Hash).digest("hex");

    const response = await axios.post(`${MONTY_BASE}/session`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Return redirect URL + the DB order ID so the frontend can pass it along if needed
    res.json({ ...response.data, dbOrderId });
  } catch (err) {
    console.error("Session error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Payment Session Failed", details: err.response?.data || err.message });
  }
});

// ─── 2) Callback — MontyPay confirms payment server-to-server ────────────────
router.post("/callback", async (req, res) => {
  try {
    const data = req.body;
    console.log("MontyPay Callback:", JSON.stringify(data, null, 2));

    const isPaid = ["COMPLETED", "PAID", "SUCCESS", "SETTLED"].includes(
      data.status?.toUpperCase()
    );

    if (isPaid) {
      // order.number = "${phone}-${dbOrderId}" or just "${dbOrderId}"
      // Extract the MongoDB _id (last part after final dash, or the whole string)
      const orderRef = data.order?.number || data.merchant_reference || "";
      const parts = orderRef.split("-");
      const dbOrderId = parts[parts.length - 1]; // last segment is always the _id

      if (dbOrderId && mongoose.Types.ObjectId.isValid(dbOrderId)) {
        const updatedOrder = await Order.findByIdAndUpdate(
          dbOrderId,
          {
            "payment.status": "paid",
            "payment.transactionId": data.payment_id || data.session_id || null,
            "payment.paidAt": new Date(),
            status: "Confirmed",
          },
          { new: true }
        )
          .populate("products.productId")
          .populate("userId")
          .populate("shippingAddress");

        if (updatedOrder) {
          console.log(`✅ Order ${dbOrderId} confirmed via MontyPay callback.`);
          const io = req.app.get("io");
          if (io) {
            // Emit "newOrder" so the dashboard popup + sound triggers for paid orders
            io.emit("newOrder", updatedOrder);
          }
        } else {
          console.warn(`⚠️  Callback: order ${dbOrderId} not found in DB.`);
        }
      } else {
        console.warn("⚠️  Callback: could not extract valid order ID from:", orderRef);
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Callback Error:", err);
    res.status(500).send("error");
  }
});

// ─── 3) Check payment status (kept for admin use / debugging) ────────────────
router.post("/status", async (req, res) => {
  try {
    const { orderNumber } = req.body; // full order.number used in session

    if (!orderNumber) return res.status(400).json({ error: "Missing orderNumber" });

    const rawString = `${orderNumber}${MERCHANT_PASSWORD}`.toUpperCase();
    const md5Hash = crypto.createHash("md5").update(rawString).digest("hex");
    const hash = crypto.createHash("sha1").update(md5Hash).digest("hex");

    const response = await axios.post(
      `${MONTY_BASE}/payment/status`,
      { merchant_key: MERCHANT_KEY, order_id: orderNumber, hash },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Status check error:", err.response?.data || err);
    res.status(500).json({ error: "Status Check Failed", details: err.response?.data });
  }
});

module.exports = router;

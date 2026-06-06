const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { initiatePayment, confirmPayment } = require("../controller/zainCash");
const Order = require("../models/orders");
const User = require("../models/user");
const Product = require("../models/products");
const Location = require("../models/locations");
const Cart = require("../models/cart");

// ─── Shared helpers ───────────────────────────────────────────────────────────

const getAdditionFromProduct = (matchedProduct, addRef) => {
  if (!matchedProduct || !Array.isArray(matchedProduct.additions)) return null;
  if (addRef?._id) {
    const found = matchedProduct.additions.find(
      (a) => a._id.toString() === addRef._id.toString(),
    );
    if (found)
      return {
        _id: found._id,
        name: found.name,
        price: Number(found.price || 0),
      };
  }
  if (addRef?.name?.en) {
    const found = matchedProduct.additions.find(
      (a) => a.name?.en === addRef.name.en,
    );
    if (found)
      return {
        _id: found._id,
        name: found.name,
        price: Number(found.price || 0),
      };
  }
  return null;
};

const getVariationPrice = (matchedProduct, selectedProtein, selectedType) => {
  if (!matchedProduct) return 0;
  if (
    selectedProtein &&
    selectedType &&
    matchedProduct.prices?.[selectedProtein]?.[selectedType] != null
  )
    return Number(matchedProduct.prices[selectedProtein][selectedType]);
  if (selectedType && matchedProduct.prices?.[selectedType] != null)
    return Number(matchedProduct.prices[selectedType]);
  if (selectedProtein && matchedProduct.prices?.[selectedProtein] != null)
    return Number(matchedProduct.prices[selectedProtein]);
  return Number(matchedProduct.basePrice || 0);
};

// ─── createZainOrder ──────────────────────────────────────────────────────────

async function createZainOrder({
  userId,
  products,
  shippingAddress,
  orderType,
  userDetails,
  paymentMethod,
  transactionId,
  io,
}) {
  const foundUser = await User.findById(userId);
  if (!foundUser) throw new Error("User not found");

  let location = null;
  if (orderType === "delivery") {
    location = await Location.findById(shippingAddress);
    if (!location) throw new Error("Invalid shipping address");
  }

  const productIds = products.map((p) =>
    p.productId?._id ? p.productId._id : p.productId,
  );
  const uniqueProductIds = [...new Set(productIds.map((id) => id.toString()))];
  const dbProducts = await Product.find({ _id: { $in: uniqueProductIds } });

  const missing = uniqueProductIds.filter(
    (id) => !dbProducts.some((dp) => dp._id.toString() === id),
  );
  if (missing.length)
    throw new Error(`Products not found: ${missing.join(", ")}`);

  const enrichedProducts = products.map((p) => {
    const productId = p.productId?._id
      ? p.productId._id.toString()
      : p.productId.toString();
    const matchedProduct = dbProducts.find(
      (dp) => dp._id.toString() === productId,
    );
    const quantity = Number(p.quantity || 1);
    const basePriceRaw = getVariationPrice(
      matchedProduct,
      p.selectedProtein,
      p.selectedType,
    );
    const discountPct = Number(matchedProduct.discount || 0);
    const priceAtPurchase =
      discountPct > 0
        ? basePriceRaw - (basePriceRaw * discountPct) / 100
        : basePriceRaw;

    const normalizedAdditions = (p.additions || []).map((add) => {
      if (add && add.price !== undefined && (add.name || add._id)) {
        return {
          _id: add._id || undefined,
          name: add.name || undefined,
          price: Number(add.price || 0),
          quantity: Number(add.quantity || 1),
        };
      }
      const resolved = getAdditionFromProduct(matchedProduct, add);
      if (resolved)
        return {
          _id: resolved._id,
          name: resolved.name,
          price: Number(resolved.price || 0),
          quantity: 1,
        };
      return {
        _id: add?._id,
        name: add?.name,
        price: 0,
        quantity: Number(add?.quantity || 1),
      };
    });

    return {
      productId,
      quantity,
      additions: normalizedAdditions,
      priceAtPurchase: Number(priceAtPurchase || 0),
      isSpicy: Boolean(p.isSpicy || false),
      notes: p.notes || "",
      selectedProtein: p.selectedProtein || null,
      selectedType: p.selectedType || null,
    };
  });

  const productsTotal = enrichedProducts.reduce((sum, item) => {
    const addSum = (item.additions || []).reduce(
      (a, add) => a + Number(add.price || 0) * Number(add.quantity || 1),
      0,
    );
    return (
      sum +
      (Number(item.priceAtPurchase || 0) + addSum) * Number(item.quantity || 1)
    );
  }, 0);

  const totalPrice =
    Number(productsTotal) + Number(location?.deliveryCost || 0);

  const newOrder = await Order.create({
    userId,
    products: enrichedProducts,
    totalPrice,
    status: "Processing",
    shippingAddress: orderType === "delivery" ? shippingAddress : null,
    payment: {
      status: "paid",
      method: paymentMethod || "cliq",
      transactionId: transactionId || null,
      paidAt: new Date(),
    },
    orderType,
    userDetails,
  });

  const populatedOrder = await newOrder.populate([
    { path: "products.productId" },
    { path: "userId" },
    { path: "shippingAddress" },
  ]);

  if (io) {
    io.emit("newOrder", populatedOrder);
  }

  await Cart.findOneAndUpdate({ userId }, { products: [] });

  return populatedOrder;
}

// ─── Helper: هل رد ZainCash يعتبر نجاح؟ ─────────────────────────────────────

/**
 * ZainCash بترجع ErrorCode بصيغتين:
 *   - "0"       (بعض البيئات)
 *   - "Success" (البيئة الإنتاجية)
 * الدالة تتعامل مع كلا الحالتين.
 */
function isZainSuccess(result) {
  // إذا رجع ZCMerchDebitTrigerPaymentResult = false → فشل مؤكد
  if (result?.ZCMerchDebitTrigerPaymentResult === false) return false;

  const errorCode = result?.ErrorObj?.ErrorCode;

  // لا يوجد ErrorObj → نجاح
  if (!errorCode) return true;

  // "0" أو "Success" أو "success" → نجاح
  return errorCode === "0" || errorCode?.toLowerCase() === "success";
}

// ─── Route 1: Initiate — إرسال OTP للعميل ────────────────────────────────────
router.post("/zain/initiate", async (req, res) => {
  try {
    const { amount, mobile } = req.body;

    if (!amount || !mobile) {
      return res.status(400).json({ message: "المبلغ ورقم الهاتف مطلوبان" });
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 10000),
    );

    const result = await Promise.race([
      initiatePayment({ amount, mobile }),
      timeoutPromise,
    ]);

    if (result.error || result.ErrorObj.Result !== "Success") {
      return res.status(400).json({
        message: "فشل في إرسال الرمز",
        detail: result.message || result.error,
      });
    }

    return res.json(result);
  } catch (error) {
    console.error("[ZainCash] Initiate Route Error:", error.message);

    if (error.message === "TIMEOUT") {
      return res.status(504).json({
        message: "انتهت مهلة الاتصال بخدمة زين كاش. الرجاء المحاولة مرة أخرى.",
        error: "ZainCash API connection timeout",
      });
    }

    res.status(500).json({
      message: "OTP initiation failed",
      error: error.response?.data || error.message,
    });
  }
});

// ─── Route 2: Confirm — التحقق من OTP وإنشاء الطلب ──────────────────────────
router.post("/zain/confirm", async (req, res) => {
  try {
    const { amount, mobile, otp, note, orderData } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "رمز التحقق (OTP) مطلوب" });
    }

    // Step 1: تأكيد الدفع مع ZainCash
    const result = await confirmPayment({ amount, mobile, otp, note });

    console.log(
      "[ZainCash] Confirm raw result:",
      JSON.stringify(result, null, 2),
    );

    // ✅ الإصلاح: التحقق الصحيح من نجاح العملية
    if (!isZainSuccess(result)) {
      return res.status(400).json({
        message: "فشل تأكيد عملية الدفع",
        detail:
          result?.ErrorObj?.ErrorMessage ||
          result?.Description ||
          result?.ErrorMsg ||
          "Payment verification failed",
      });
    }

    // Step 2: الدفع نجح — إنشاء الطلب في قاعدة البيانات
    let order = null;
    if (orderData) {
      try {
        const io = req.app.get("io");
        const transactionId =
          result?.RefID || result?.TransactionID || result?.refId || null;

        order = await createZainOrder({
          ...orderData,
          paymentMethod: "cliq",
          transactionId,
          io,
        });

        console.log(
          `✅ ZainCash order ${order._id} created and paid. RefID: ${transactionId}`,
        );
      } catch (orderError) {
        console.error("[ZainCash] Order creation error:", orderError.message);
        // الدفع نجح لكن إنشاء الطلب فشل — أعلم العميل ليتواصل مع الدعم
        return res.status(500).json({
          message:
            "تم الدفع بنجاح لكن حدث خطأ في إنشاء الطلب. يرجى التواصل مع الدعم.",
          paymentResult: result,
          orderError: orderError.message,
        });
      }
    }

    return res.json({
      ...result,
      orderId: order?._id || null,
      orderCreated: !!order,
    });
  } catch (error) {
    console.error("[ZainCash] Confirm Route Error:", error.message);
    res.status(500).json({
      message: "Payment confirmation failed",
      error: error.response?.data || error.message,
    });
  }
});
module.exports = router;

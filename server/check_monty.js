require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const crypto = require("crypto");
const Order = require("./src/models/orders");
const User = require("./src/models/user");

async function check() {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/shawarma");
  const order = await Order.findById("6ab79fc1f79dbd2093003b2c");
  const user = await User.findById(order.userId);
  
  const MONTY_BASE = process.env.MONTY_BASE;
  const MERCHANT_KEY = process.env.MERCHANT_KEY;
  const MERCHANT_PASSWORD = process.env.MERCHANT_PASSWORD;
  
  const customerPhone = order.userDetails?.phone || user?.phone || "";
  const orderNumber = customerPhone ? `${customerPhone}-${order._id}` : `${order._id}`;
  
  const paymentId = order.payment?.transactionId;
  if (!paymentId) {
    console.error("No transactionId on this order.");
    process.exit(1);
  }
  
  const rawString = `${paymentId}${MERCHANT_PASSWORD}`.toUpperCase();
  const md5Hash = crypto.createHash("md5").update(rawString).digest("hex");
  const hash = crypto.createHash("sha1").update(md5Hash).digest("hex");

  try {
    const response = await axios.post(
      `${MONTY_BASE}/payment/status`,
      { merchant_key: MERCHANT_KEY, payment_id: paymentId, hash },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
  process.exit(0);
}
check();

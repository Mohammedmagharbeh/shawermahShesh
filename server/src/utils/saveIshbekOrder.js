// // const Order = require("../models/orders");

// // async function saveIshbekOrder(full) {
// //   const exists = await Order.findOne({ ishbekOrderId: full.id });
// //   if (exists) return null;

// //   const order = new Order({
// //     source: "ishbek",
// //     ishbekOrderId: full.id,
// //     status: "Processing",
// //     orderType: String(full.serviceType).toLowerCase() === "delivery" ? "delivery" : "pickup",
// //     totalPrice: Number(full.totalAmount) || 0,
// //     payment: { status: "unpaid", method: "cash" },
// //     userDetails: {
// //       name: full.customerName || "Ishbek",
// //       phone: full.customerPhone || "",
// //     },
// //     products: (full.items || []).map((i) => ({
// //       name: i.name,
// //       quantity: i.quantity || 1,
// //       priceAtPurchase: i.price || 0,
// //       notes: i.note || "",
// //     })),
// //   });

// //   await order.save();
// //   return order;
// // }

// // module.exports = { saveIshbekOrder };

// const Order = require("../models/orders");
// const Product = require("../models/products");

// async function saveIshbekOrder(full) {
//   const exists = await Order.findOne({ ishbekOrderId: full.id });
//   if (exists) return null;

//   const order = new Order({
//     source: "ishbek",
//     ishbekOrderId: full.id,
//     status: "Processing",
//     orderType:
//       String(full.serviceType).toLowerCase() === "delivery"
//         ? "delivery"
//         : "pickup",
//     totalPrice: Number(full.totalAmount) || 0,
// payment: { status: "paid", method: "cash", paidAt: new Date() },
//     userDetails: {
//       name: full.customerName || "Ishbek",
//       phone: full.customerPhone || "",
//     },
//     products: (full.items || []).map((i) => ({
//       name: i.name, // { ar, en } اسم الوجبة
//       quantity: i.quantity || 1,
//       priceAtPurchase: i.price || 0,
//       notes: i.note || "",
//       additions: (i.options || []).map((o) => ({
//         name: o.name, // { ar, en } مثل دجاج / اضافة جبنة
//         price: o.price || 0,
//       })),
//     })),
//   });

//   await order.save();
//   return order;
// }

// module.exports = { saveIshbekOrder };

const mongoose = require("mongoose");
const Order = require("../models/orders");
const Product = require("../models/products");

async function saveIshbekOrder(full) {
  const exists = await Order.findOne({ ishbekOrderId: full.id });
  if (exists) return null;

  const products = await Promise.all(
    (full.items || []).map(async (i) => {
      let match = null;

      // 1) جرّب الربط بـ originalId (لو هو _id المنتج عندك)
      if (mongoose.isValidObjectId(i.originalId)) {
        match = await Product.findById(i.originalId).select("_id");
      }

      // 2) إذا ما لقى، جرّب بالاسم العربي
      if (!match && i.name?.ar) {
        match = await Product.findOne({ "name.ar": i.name.ar }).select("_id");
      }

      return {
        productId: match?._id,
        name: i.name, // { ar, en } اسم الوجبة
        quantity: i.quantity || 1,
        priceAtPurchase: i.price || 0,
        notes: i.note || "",
        additions: (i.options || []).map((o) => ({
          name: o.name, // { ar, en } مثل دجاج / اضافة جبنة
          price: o.price || 0,
        })),
      };
    }),
  );

  const order = new Order({
    source: "ishbek",
    ishbekOrderId: full.id,
    status: "Processing",
    orderType:
      String(full.serviceType).toLowerCase() === "delivery"
        ? "delivery"
        : "pickup",
    totalPrice: Number(full.totalAmount) || 0,
    payment: { status: "paid", method: "cash", paidAt: new Date() },
    userDetails: {
      name: full.customerName || "Ishbek",
      phone: full.customerPhone || "",
    },
    products,
  });
  await order.save();
  await order.populate("products.productId");
  return order;
}

module.exports = { saveIshbekOrder };
// // // // const Order = require("../models/orders");

// // // // async function saveIshbekOrder(full) {
// // // //   const exists = await Order.findOne({ ishbekOrderId: full.id });
// // // //   if (exists) return null;

// // // //   const order = new Order({
// // // //     source: "ishbek",
// // // //     ishbekOrderId: full.id,
// // // //     status: "Processing",
// // // //     orderType: String(full.serviceType).toLowerCase() === "delivery" ? "delivery" : "pickup",
// // // //     totalPrice: Number(full.totalAmount) || 0,
// // // //     payment: { status: "unpaid", method: "cash" },
// // // //     userDetails: {
// // // //       name: full.customerName || "Ishbek",
// // // //       phone: full.customerPhone || "",
// // // //     },
// // // //     products: (full.items || []).map((i) => ({
// // // //       name: i.name,
// // // //       quantity: i.quantity || 1,
// // // //       priceAtPurchase: i.price || 0,
// // // //       notes: i.note || "",
// // // //     })),
// // // //   });

// // // //   await order.save();
// // // //   return order;
// // // // }

// // // // module.exports = { saveIshbekOrder };

// // // const Order = require("../models/orders");
// // // const Product = require("../models/products");

// // // async function saveIshbekOrder(full) {
// // //   const exists = await Order.findOne({ ishbekOrderId: full.id });
// // //   if (exists) return null;

// // //   const order = new Order({
// // //     source: "ishbek",
// // //     ishbekOrderId: full.id,
// // //     status: "Processing",
// // //     orderType:
// // //       String(full.serviceType).toLowerCase() === "delivery"
// // //         ? "delivery"
// // //         : "pickup",
// // //     totalPrice: Number(full.totalAmount) || 0,
// // // payment: { status: "paid", method: "cash", paidAt: new Date() },
// // //     userDetails: {
// // //       name: full.customerName || "Ishbek",
// // //       phone: full.customerPhone || "",
// // //     },
// // //     products: (full.items || []).map((i) => ({
// // //       name: i.name, // { ar, en } اسم الوجبة
// // //       quantity: i.quantity || 1,
// // //       priceAtPurchase: i.price || 0,
// // //       notes: i.note || "",
// // //       additions: (i.options || []).map((o) => ({
// // //         name: o.name, // { ar, en } مثل دجاج / اضافة جبنة
// // //         price: o.price || 0,
// // //       })),
// // //     })),
// // //   });

// // //   await order.save();
// // //   return order;
// // // }

// // // module.exports = { saveIshbekOrder };

// // const mongoose = require("mongoose");
// // const Order = require("../models/orders");
// // const Product = require("../models/products");

// // async function saveIshbekOrder(full) {
// //   const exists = await Order.findOne({ ishbekOrderId: full.id });
// //   if (exists) return null;

// //   const products = await Promise.all(
// //     (full.items || []).map(async (i) => {
// //       let match = null;

// //       // 1) جرّب الربط بـ originalId (لو هو _id المنتج عندك)
// //       if (mongoose.isValidObjectId(i.originalId)) {
// //         match = await Product.findById(i.originalId).select("_id");
// //       }

// //       // 2) إذا ما لقى، جرّب بالاسم العربي
// //       if (!match && i.name?.ar) {
// //         match = await Product.findOne({ "name.ar": i.name.ar }).select("_id");
// //       }

// //       return {
// //         productId: match?._id,
// //         name: i.name, // { ar, en } اسم الوجبة
// //         quantity: i.quantity || 1,
// //         priceAtPurchase: i.price || 0,
// //         notes: i.note || "",
// //         additions: (i.options || []).map((o) => ({
// //           name: o.name, // { ar, en } مثل دجاج / اضافة جبنة
// //           price: o.price || 0,
// //         })),
// //       };
// //     }),
// //   );

// //   const order = new Order({
// //     source: "ishbek",
// //     ishbekOrderId: full.id,
// //     status: "Processing",
// //     orderType:
// //       String(full.serviceType).toLowerCase() === "delivery"
// //         ? "delivery"
// //         : "pickup",
// //     totalPrice: Number(full.totalAmount) || 0,
// //     payment: { status: "paid", method: "cash", paidAt: new Date() },
// //     userDetails: {
// //       name: full.customerName || "Ishbek",
// //       phone: full.customerPhone || "",
// //     },
// //     products,
// //   });

// //   await order.save();
// //   return order;
// // }

// // module.exports = { saveIshbekOrder };

// const mongoose = require("mongoose");
// const Order = require("../models/orders");
// const Product = require("../models/products");

// // تنظيف النص: شيل المسافات الزيادة
// const norm = (s) => String(s || "").trim().replace(/\s+/g, " ");

// // نص -> regex بيتجاهل عدد المسافات وحالة الأحرف
// const looseRegex = (s) => {
//   const words = norm(s)
//     .split(" ")
//     .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
//   return new RegExp(`^\\s*${words.join("\\s+")}\\s*$`, "i");
// };

// async function findProduct(i) {
//   // 1) بالـ originalId (لو هو _id المنتج عندك)
//   if (mongoose.isValidObjectId(i.originalId)) {
//     const byId = await Product.findById(i.originalId).select("_id");
//     if (byId) return byId;
//   }

//   // 2) بالاسم العربي (مرن بالمسافات)
//   if (norm(i.name?.ar)) {
//     const byAr = await Product.findOne({
//       "name.ar": looseRegex(i.name.ar),
//     }).select("_id");
//     if (byAr) return byAr;
//   }

//   // 3) بالاسم الإنجليزي
//   if (norm(i.name?.en)) {
//     const byEn = await Product.findOne({
//       "name.en": looseRegex(i.name.en),
//     }).select("_id");
//     if (byEn) return byEn;
//   }

//   return null;
// }

// async function saveIshbekOrder(full) {
//   const exists = await Order.findOne({ ishbekOrderId: full.id });
//   if (exists) return null;

//   const products = await Promise.all(
//     (full.items || []).map(async (i) => {
//       const match = await findProduct(i);

//       // لوغ للتشخيص: بيبين إذا انربط المنتج ولا لا
//       console.log(
//         "[ishbek] match:",
//         i.name?.ar,
//         "|",
//         i.name?.en,
//         "| originalId:",
//         i.originalId,
//         "| found:",
//         match ? String(match._id) : "NOT FOUND",
//       );

//       return {
//         productId: match?._id,
//         name: i.name, // { ar, en } اسم الوجبة
//         quantity: i.quantity || 1,
//         priceAtPurchase: i.price || 0,
//         notes: i.note || "",
//         additions: (i.options || []).map((o) => ({
//           name: o.name, // { ar, en } مثل دجاج / اضافة جبنة
//           price: o.price || 0,
//         })),
//       };
//     }),
//   );

//   const order = new Order({
//     source: "ishbek",
//     ishbekOrderId: full.id,
//     status: "Processing",
//     orderType:
//       String(full.serviceType).toLowerCase() === "delivery"
//         ? "delivery"
//         : "pickup",
//     totalPrice: Number(full.totalAmount) || 0,
//     payment: { status: "paid", method: "cash", paidAt: new Date() },
//     userDetails: {
//       name: full.customerName || "Ishbek",
//       phone: full.customerPhone || "",
//     },
//     products,
//   });

//   await order.save();

//   // عشان الصورة والاسم يوصلوا للداشبورد لحظياً (بدون ما تحدّث الصفحة)
//   await order.populate("products.productId");

//   return order;
// }
// module.exports = { saveIshbekOrder };

const mongoose = require("mongoose");
const Order = require("../models/orders");
const Product = require("../models/products");

// تنظيف النص: شيل المسافات الزيادة
const norm = (s) => String(s || "").trim().replace(/\s+/g, " ");

// نص -> regex بيتجاهل عدد المسافات وحالة الأحرف
const looseRegex = (s) => {
  const words = norm(s)
    .split(" ")
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`^\\s*${words.join("\\s+")}\\s*$`, "i");
};

// نلاقي مستخدم التطبيق برقم الهاتف، عشان الإشعارات توصله زي طلبات الموقع
async function findUserByPhone(rawPhone) {
  try {
    const digits = String(rawPhone || "").replace(/\D/g, "");
    if (digits.length < 9) return null;
    const last9 = digits.slice(-9); // مثال: 788031015
    const variants = [`0${last9}`, `962${last9}`, `+962${last9}`, last9];
    const User = mongoose.model("users");
    return await User.findOne({ phone: { $in: variants } }).select("_id");
  } catch (e) {
    console.error("[ishbek] findUserByPhone failed:", e.message);
    return null;
  }
}

async function findProduct(i) {
  // 1) بالـ originalId (لو هو _id المنتج عندك)
  if (mongoose.isValidObjectId(i.originalId)) {
    const byId = await Product.findById(i.originalId).select("_id");
    if (byId) return byId;
  }

  // 2) بالاسم العربي (مرن بالمسافات)
  if (norm(i.name?.ar)) {
    const byAr = await Product.findOne({
      "name.ar": looseRegex(i.name.ar),
    }).select("_id");
    if (byAr) return byAr;
  }

  // 3) بالاسم الإنجليزي
  if (norm(i.name?.en)) {
    const byEn = await Product.findOne({
      "name.en": looseRegex(i.name.en),
    }).select("_id");
    if (byEn) return byEn;
  }

  return null;
}

async function saveIshbekOrder(full) {
  const exists = await Order.findOne({ ishbekOrderId: full.id });
  if (exists) return null;

  const products = await Promise.all(
    (full.items || []).map(async (i) => {
      const match = await findProduct(i);

      // لوغ للتشخيص: بيبين إذا انربط المنتج ولا لا
      console.log(
        "[ishbek] match:",
        i.name?.ar,
        "|",
        i.name?.en,
        "| originalId:",
        i.originalId,
        "| found:",
        match ? String(match._id) : "NOT FOUND",
      );

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

  const user = await findUserByPhone(full.customerPhone);
  console.log(
    "[ishbek] user match:",
    full.customerPhone,
    "->",
    user ? String(user._id) : "NO APP USER",
  );

  const order = new Order({
    source: "ishbek",
    userId: user?._id,
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

  // عشان الصورة والاسم يوصلوا للداشبورد لحظياً (بدون ما تحدّث الصفحة)
  await order.populate("products.productId");

  return order;
}

module.exports = { saveIshbekOrder };
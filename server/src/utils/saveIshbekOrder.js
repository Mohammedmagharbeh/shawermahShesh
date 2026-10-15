// const Order = require("../models/orders");

// async function saveIshbekOrder(full) {
//   const exists = await Order.findOne({ ishbekOrderId: full.id });
//   if (exists) return null;

//   const order = new Order({
//     source: "ishbek",
//     ishbekOrderId: full.id,
//     status: "Processing",
//     orderType: String(full.serviceType).toLowerCase() === "delivery" ? "delivery" : "pickup",
//     totalPrice: Number(full.totalAmount) || 0,
//     payment: { status: "unpaid", method: "cash" },
//     userDetails: {
//       name: full.customerName || "Ishbek",
//       phone: full.customerPhone || "",
//     },
//     products: (full.items || []).map((i) => ({
//       name: i.name,
//       quantity: i.quantity || 1,
//       priceAtPurchase: i.price || 0,
//       notes: i.note || "",
//     })),
//   });

//   await order.save();
//   return order;
// }

// module.exports = { saveIshbekOrder };

const Order = require("../models/orders");

async function saveIshbekOrder(full) {
  const exists = await Order.findOne({ ishbekOrderId: full.id });
  if (exists) return null;

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
    products: (full.items || []).map((i) => ({
      name: i.name, // { ar, en } اسم الوجبة
      quantity: i.quantity || 1,
      priceAtPurchase: i.price || 0,
      notes: i.note || "",
      additions: (i.options || []).map((o) => ({
        name: o.name, // { ar, en } مثل دجاج / اضافة جبنة
        price: o.price || 0,
      })),
    })),
  });

  await order.save();
  return order;
}

module.exports = { saveIshbekOrder };
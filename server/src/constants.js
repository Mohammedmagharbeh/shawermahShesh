// product Constants
const CATEGORIES = [
  { en: "Burgers", ar: "برجر" },
  { en: "Snacks", ar: " سناكات" },
  { en: "Drinks", ar: "مشروبات" },
  { en: "Shawarma", ar: "شاورما" },
  { en: "Box", ar: "بوكس" },
  { en: " Sheesh Dishes", ar: " أطباق شيش" },
  { en: "Kids", ar: "أطفال" },
  { en: "Sides", ar: "جانبية" },
];

// Order Constants
const ORDER_STATUSES = Object.freeze([
  "Processing",
  "Confirmed",
  "Shipped",
  "OutForDelivery",
  "ReadyForPickup",
  "Delivered",
  "Submitted",
  "Cancelled",
]);
const PAYMENT_METHODS = Object.freeze(["cash", "card", "cliq", "orange_money",]);
const PAYMENT_STATUSES = Object.freeze(["unpaid", "paid"]);

const USER_ROLES = Object.freeze(["user", "employee", "admin", "hr", "rider", "cashier"]);

// Driver Statuses & Branch QR
const DRIVER_STATUSES = Object.freeze([
  "available",
  "assigned",
  "on_delivery",
  "returning",
]);

const BRANCH_QR_CODE = "shawarmasheesh_branch_1_checkin";

module.exports = {
  CATEGORIES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  USER_ROLES,
  DRIVER_STATUSES,
  BRANCH_QR_CODE,
};

// product Constants
export const EN_CATEGORIES = [
  "Burgers",
  "Snacks",
  "drinks",
  "Shawarma",
  "box",
  "dishes",
  "appetizers",
  "Salads",
  "Kids",
  "Sauces",
  "Sides",
];

export const AR_CATEGORIES = [
  "برجر",
  "وجبات خفيفة",
  "مشروبات",
  "شاورما",
  "بوكس",
  "أطباق",
  "مقبلات",
  "سلطات",
  "أطفال",
  "صلصات",
  "جانبية",
];

// Order Constants
export const ORDER_STATUSES = Object.freeze([
  "Processing",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
]);
export const PAYMENT_METHODS = Object.freeze(["cash", "card"]);
export const PAYMENT_STATUSES = Object.freeze(["unpaid", "paid"]);

export const USER_ROLES = Object.freeze(["user", "employee", "admin"]);

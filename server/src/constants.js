// product Constants
export const CATEGORIES = [
  { en: "Burgers", ar: "برجر" },
  { en: "Group meals", ar: "وجبات جماعية" },
  { en: "Snacks", ar: "وجبات خفيفة" },
  { en: "Drinks", ar: "مشروبات" },
  { en: "Shawarma", ar: "شاورما" },
  { en: "Box", ar: "بوكس" },
  { en: "Dishes", ar: "أطباق" },
  { en: "Appetizers", ar: "مقبلات" },
  { en: "Salads", ar: "سلطات" },
  { en: "Kids", ar: "أطفال" },
  { en: "Sauces", ar: "صلصات" },
  { en: "Sides", ar: "جانبية" },
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

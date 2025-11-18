// product Constants
export const CATEGORIES = [
  { en: "Burgers", ar: "برجر" },
  { en: "Group meals", ar: "وجبات جماعية" },
  { en: "Snacks", ar: " سناكات" },
  { en: "Drinks", ar: "مشروبات" },
  { en: "Shawarma", ar: "شاورما" },
  { en: "Box", ar: "بوكس" },
  { en: " Sheesh Dishes", ar: " أطباق شيش" },
  { en: "Kids", ar: "أطفال" },
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

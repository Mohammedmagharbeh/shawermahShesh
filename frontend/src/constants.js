// import {
//   ChartNoAxesCombined,
//   FileUser,
//   Image,
//   LayoutDashboard,
//   Package,
//   Plus,
//   Users2,
// } from "lucide-react";

// export const CATEGORIES = [
//   { en: "Shawarma", ar: "شاورما" },
//   { en: "Burgers", ar: "برجر" },
//   { en: "Snacks", ar: "سناكات " },
//   { en: "Drinks", ar: "مشروبات" },
//   { en: "Box", ar: "بوكس" },
//   { en: " Sheesh Dishes", ar: "أطباق شيش" },
//   { en: "Kids", ar: "أطفال" },
//   { en: "Sides", ar: "جانبية" },
// ];

// export const ADMIN_LINKS = [
//   {
//     to: "/admin/dashboard",
//     label: "dashboard",
//     icon: LayoutDashboard,
//     roles: ["admin", "employee"],
//   },
//   {
//     to: "/orders",
//     label: "orders",
//     icon: Package,
//     roles: ["admin"],
//   },
//   {
//     to: "/admin/add-product",
//     label: "products",
//     icon: Plus,
//     roles: ["admin"],
//   },
//   {
//     to: "/admin/statistics",
//     label: "statistics",
//     icon: ChartNoAxesCombined,
//     roles: ["admin"],
//   },
//   {
//     to: "/admin/users-control",
//     label: "users_management",
//     icon: Users2,
//     roles: ["admin"],
//   },
//   {
//     to: "/slides",
//     label: "images_upload",
//     icon: Image,
//     roles: ["admin"],
//   },
//   {
//     to: "/adminjobs",
//     label: "jobs",
//     icon: FileUser,
//     roles: ["admin","hr"],
//   },
// ];

// export const PUBLIC_LINKS = [
//   { label: "home" },
//   { label: "our_story" },
//   { label: "jobs" },
//   { label: "contact_us" },
// ];

// export const INITIAL_FORM_DATA = {
//   arName: "",
//   enName: "",
//   basePrice: "",
//   discount: "",
//   arDescription: "",
//   enDescription: "",
//   image: "",
//   category: "",
//   isSpicy: false,
//   inStock: false,
//   hasTypeChoices: false,
//   hasProteinChoices: false,
//   additions: [],
//   additionsSelectionType: null,
//   prices: {
//     sandwich: "",
//     meal: "",
//     chicken: "",
//     meat: "",
//     chicken_sandwich: "",
//     chicken_meal: "",
//     meat_sandwich: "",
//     meat_meal: "",
//   },
// };

// export const getProductPrice = (product) => {
//   if (!product.productId) return 0;

//   let basePrice = Number(product.productId.basePrice || 0);

//   const pId = product.productId;

//   if (pId.hasProteinChoices && pId.hasTypeChoices) {
//     basePrice = Number(
//       pId.prices?.[product.selectedProtein]?.[product.selectedType] ?? basePrice
//     );
//   } else if (pId.hasProteinChoices) {
//     basePrice = Number(pId.prices?.[product.selectedProtein] ?? basePrice);
//   } else if (pId.hasTypeChoices) {
//     basePrice = Number(pId.prices?.[product.selectedType] ?? basePrice);
//   }

//   // apply discount if any
//   if (pId.discount && pId.discount > 0) {
//     basePrice = basePrice - (basePrice * pId.discount) / 100;
//   }

//   return basePrice;
// };

// export const getAdditionsPrice = (additions) => {
//   if (!additions || additions.length === 0) return 0;

//   const additionsTotal = additions.reduce((acc, item) => acc + item.price, 0);

//   return additionsTotal;
// };

import {
  Bike,
  ChartNoAxesCombined,
  FileUser,
  Image,
  LayoutDashboard,
  Package,
  Plus,
  Users2,
} from "lucide-react";

export const CATEGORIES = [
  { en: "Shawarma", ar: "شاورما" },
  { en: "Burgers", ar: "برجر" },
  { en: "Snacks", ar: "سناكات " },
  { en: "Drinks", ar: "مشروبات" },
  { en: "Box", ar: "بوكس" },
  { en: " Sheesh Dishes", ar: "أطباق شيش" },
  { en: "Kids", ar: "أطفال" },
  { en: "Sides", ar: "جانبية" },
];

// 🔥 دالة توحيد الرول (مهم جدًا)
export const normalizeRole = (role) =>
  role?.toLowerCase().trim();

export const ADMIN_LINKS = [
  {
    to: "/admin/dashboard",
    label: "dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "employee"],
  },
  {
    to: "/admin/dispatch",
    label: "dispatch_queue",
    icon: Bike,
    roles: ["admin", "employee", "cashier"],
  },
  {
    to: "/orders",
    label: "orders",
    icon: Package,
    roles: ["admin"],
  },
  {
    to: "/admin/add-product",
    label: "products",
    icon: Plus,
    roles: ["admin"],
  },
  {
    to: "/admin/statistics",
    label: "statistics",
    icon: ChartNoAxesCombined,
    roles: ["admin"],
  },
  {
    to: "/admin/users-control",
    label: "users_management",
    icon: Users2,
    roles: ["admin"],
  },
  {
    to: "/slides",
    label: "images_upload",
    icon: Image,
    roles: ["admin"],
  },

  // ✅ jobs (معدلة)
  {
    to: "/adminjobs", // 🔥 عدلناها
    label: "jobs",
    icon: FileUser,
    roles: ["admin", "hr"],
  },
];

export const PUBLIC_LINKS = [
  { label: "home" },
  { label: "our_story" },
  { label: "jobs" },
  { label: "contact_us" },
];

export const INITIAL_FORM_DATA = {
  arName: "",
  enName: "",
  basePrice: "",
  discount: "",
  arDescription: "",
  enDescription: "",
  image: "",
  category: "",
  isSpicy: false,
  inStock: false,
  hasTypeChoices: false,
  hasProteinChoices: false,
  additions: [],
  additionsSelectionType: null,
  additionCategories: [],
  prices: {
    sandwich: "",
    meal: "",
    chicken: "",
    meat: "",
    chicken_sandwich: "",
    chicken_meal: "",
    meat_sandwich: "",
    meat_meal: "",
  },
};

export const getProductPrice = (product) => {
  if (!product.productId) return 0;

  let basePrice = Number(product.productId.basePrice || 0);

  const pId = product.productId;

  if (pId.hasProteinChoices && pId.hasTypeChoices) {
    basePrice = Number(
      pId.prices?.[product.selectedProtein]?.[product.selectedType] ?? basePrice
    );
  } else if (pId.hasProteinChoices) {
    basePrice = Number(pId.prices?.[product.selectedProtein] ?? basePrice);
  } else if (pId.hasTypeChoices) {
    basePrice = Number(pId.prices?.[product.selectedType] ?? basePrice);
  }

  if (pId.discount && pId.discount > 0) {
    basePrice = basePrice - (basePrice * pId.discount) / 100;
  }

  return basePrice;
};

export const getAdditionsPrice = (additions) => {
  if (!additions || additions.length === 0) return 0;

  return additions.reduce((acc, item) => acc + item.price, 0);
};

// ==========================================
// Order Statuses & Labels by Order Type
// ==========================================

export const DELIVERY_STATUSES = [
  { value: "Processing", labelKey: "processing", defaultLabel: "قيد المعالجة" },
  { value: "Confirmed", labelKey: "confirmed", defaultLabel: "تم التأكيد" },
  { value: "ReadyForPickup", labelKey: "waiting_for_driver", defaultLabel: "بانتظار السائق" },
  { value: "Shipped", labelKey: "on_the_way", defaultLabel: "طلبك في الطريق" },
  { value: "Delivered", labelKey: "delivered", defaultLabel: "تم التسليم" },
  { value: "Cancelled", labelKey: "cancelled", defaultLabel: "ملغى" },
];

export const PICKUP_STATUSES = [
  { value: "Processing", labelKey: "processing", defaultLabel: "قيد المعالجة" },
  { value: "Confirmed", labelKey: "confirmed", defaultLabel: "تم التأكيد" },
  { value: "ReadyForPickup", labelKey: "ready_for_pickup", defaultLabel: "جاهز للاستلام" },
  { value: "Delivered", labelKey: "picked_up", defaultLabel: "تم الاستلام" },
  { value: "Cancelled", labelKey: "cancelled", defaultLabel: "ملغى" },
];

export const getOrderStatusOptions = (orderType) => {
  return orderType === "pickup" ? PICKUP_STATUSES : DELIVERY_STATUSES;
};

export const getOrderStatusLabel = (status, orderType, t) => {
  if (!status) return "N/A";
  const normalized = String(status).toLowerCase();

  if (orderType === "pickup") {
    if (normalized === "readyforpickup") {
      return t ? t("ready_for_pickup", "جاهز للاستلام") : "جاهز للاستلام";
    }
    if (normalized === "delivered" || normalized === "submitted") {
      return t ? t("picked_up", "تم الاستلام") : "تم الاستلام";
    }
  } else {
    // Delivery orders
    if (normalized === "readyforpickup") {
      return t ? t("waiting_for_driver", "بانتظار السائق") : "بانتظار السائق";
    }
    if (normalized === "shipped" || normalized === "outfordelivery") {
      return t ? t("on_the_way", "طلبك في الطريق") : "طلبك في الطريق";
    }
    if (normalized === "delivered" || normalized === "submitted") {
      return t ? t("delivered", "تم التسليم") : "تم التسليم";
    }
  }

  if (normalized === "processing") return t ? t("processing", "قيد المعالجة") : "قيد المعالجة";
  if (normalized === "confirmed") return t ? t("confirmed", "تم التأكيد") : "تم التأكيد";
  if (normalized === "cancelled") return t ? t("cancelled", "ملغى") : "ملغى";

  return t ? t(normalized, status) : status;
};

export const ORDER_STATUS_COLORS = {
  Processing: "bg-secondary text-secondary-foreground",
  Confirmed: "bg-purple-500 text-white",
  ReadyForPickup: "bg-amber-500 text-white",
  Shipped: "bg-blue-600 text-white",
  OutForDelivery: "bg-blue-600 text-white",
  Delivered: "bg-green-600 text-white",
  Submitted: "bg-green-600 text-white",
  Cancelled: "bg-destructive text-destructive-foreground",
};
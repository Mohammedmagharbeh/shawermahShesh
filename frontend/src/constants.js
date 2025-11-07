import {
  ChartNoAxesCombined,
  Image,
  LayoutDashboard,
  Package,
  Plus,
  Users2,
} from "lucide-react";

export const CATEGORIES = [
  { en: "Burgers", ar: "برجر" },
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

export const ADMIN_LINKS = [
  {
    to: "/admin/dashboard",
    label: "dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "employee"],
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
];

export const PUBLIC_LINKS = [
  { label: "home" },
  { label: "our_story" },
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
  isSpicy: false,
  hasTypeChoices: false,
  hasProteinChoices: false,
  additions: [],
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

  // apply discount if any
  if (pId.discount && pId.discount > 0) {
    basePrice = basePrice - (basePrice * pId.discount) / 100;
  }

  return basePrice;
};

export const getAdditionsPrice = (additions) => {
  if (!additions || additions.length === 0) return 0;

  const additionsTotal = additions.reduce((acc, item) => acc + item.price, 0);

  return additionsTotal;
};

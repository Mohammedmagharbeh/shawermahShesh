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
    label: "Products",
    icon: Plus,
    roles: ["admin"],
  },
  {
    to: "/admin/statistics",
    label: "Statistics",
    icon: ChartNoAxesCombined,
    roles: ["admin"],
  },
  {
    to: "/admin/users-control",
    label: "Users Control",
    icon: Users2,
    roles: ["admin"],
  },
  {
    to: "/slides",
    label: "Control Images",
    icon: Image,
    roles: ["admin"],
  },
];

export const PUBLIC_LINKS = [
  { label: "home" },
  { label: "about_us" },
  { label: "contact_us" },
];

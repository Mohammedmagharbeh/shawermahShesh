/**
 * Constants for the Checkout component and related features
 */

// Test mode configuration
export const TEST_PRODUCT_ID = "696f8dadfa26824a3b34e5af";

// API endpoints
export const API_ENDPOINTS = {
  LOCATIONS: "/locations/get",
  MONTYPAY_SESSION: "/montypay/session",
  ZAINCASH_INITIATE: "/zaincash/zain/initiate",
  ZAINCASH_CONFIRM: "/zaincash/zain/confirm",
};

// Payment methods
export const PAYMENT_METHODS = {
  CARD: "card",
  CLIQ: "cliq",
};

// Order types
export const ORDER_TYPES = {
  DELIVERY: "delivery",
  PICKUP: "pickup",
};

// CliQ payment steps
export const CLIQ_STEPS = {
  INIT: "INIT",
  OTP_SENT: "OTP_SENT",
  PAID: "PAID",
};

// Form field names
export const FORM_FIELDS = {
  ORDER_TYPE: "orderType",
  PAYMENT_METHOD: "paymentMethod",
  SELECTED_AREA: "selectedArea",
  OTP: "otp",
  CLIQ_STEP: "cliqStep",
  DETAILS: "details",
};

// Details field names
export const DETAIL_FIELDS = {
  NAME: "name",
  APARTMENT: "apartment",
  PHONE: "phone",
};

// UI constants
export const UI_CONSTANTS = {
  MAX_LIST_HEIGHT: "max-h-96",
  STEP_NUMBER_SIZE: "w-8 h-8",
  RADIO_SIZE: "w-4 h-4",
  RADIO_DOT_SIZE: "w-2 h-2",
};

// Default values
export const DEFAULT_FORM_STATE = {
  orderType: ORDER_TYPES.DELIVERY,
  paymentMethod: PAYMENT_METHODS.CARD,
  selectedArea: null,
  otp: "",
  cliqStep: CLIQ_STEPS.INIT,
  details: {
    name: "",
    apartment: "",
    phone: "",
  },
};

// Test mode defaults
export const TEST_MODE_DEFAULTS = {
  NAME: "MONTYPAY TESTER",
  ORDER_TYPE: ORDER_TYPES.PICKUP,
  TOTAL_AMOUNT: 1,
};

// Validation messages (translation keys)
export const VALIDATION_KEYS = {
  CART_EMPTY: "checkout_cart_empty",
  SELECT_AREA: "checkout_select_area",
  CHECKOUT_FAILED: "checkout_failed",
  FETCH_AREA_ERROR: "checkout_fetch_area_error",
};

// External resources
export const PAYMENT_LOGOS = {
  VISA: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
  MASTERCARD:
    "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
};

// Currency
export const CURRENCY = "JOD";

// Session storage keys
export const STORAGE_KEYS = {
  PENDING_ORDER: "pendingOrder",
  LANGUAGE: "i18nextLng",
};

// Default language
export const DEFAULT_LANGUAGE = "ar";

// Axios configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
};

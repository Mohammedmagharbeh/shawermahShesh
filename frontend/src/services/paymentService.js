import axios from "axios";
import {
  API_ENDPOINTS,
  STORAGE_KEYS,
  API_CONFIG,
  TEST_MODE_DEFAULTS,
} from "@/components/checkout/constants";
import { sanitizeObject } from "@/utils/inputSanitization";
import { validatePaymentAmount } from "@/utils/orderValidation";

const API_URL = import.meta.env.VITE_BASE_URL;

// Configure axios with timeout
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Generates a unique session ID
 * @returns {string} - Session ID
 */
const generateSessionId = () => {
  const now = new Date();
  return `${now.getDate()}${now.getMonth() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
};

/**
 * Creates order payload for API
 * @param {Object} params - Order parameters
 * @returns {Object} - Sanitized order payload
 */
const createOrderPayload = ({
  cart,
  formState,
  user,
  orderSummary,
  isTestMode,
}) => {
  const payload = {
    products: cart.products.map((p) => ({
      productId: p.productId._id,
      quantity: p.quantity,
      isSpicy: p.isSpicy || false,
      additions: p.additions || [],
      notes: p.notes || "",
      selectedProtein: p.selectedProtein,
      selectedType: p.selectedType,
    })),
    userId: user?._id,
    shippingAddress: formState.selectedArea?._id,
    orderType: formState.orderType,
    userDetails: formState.details,
    totalPrice: orderSummary.total,
    paymentMethod: formState.paymentMethod,
    isTest: isTestMode,
  };

  return sanitizeObject(payload);
};

/**
 * MontyPay payment flow — order is pre-created server-side before redirect.
 * No sessionStorage used. The server creates the order and returns redirect_url.
 * @param {Object} params - Payment parameters
 * @returns {Promise<string>} - Redirect URL
 */
export const initiateMontyPayPayment = async ({
  cart,
  formState,
  user,
  orderSummary,
  isTestMode,
}) => {
  try {
    const amountValidation = validatePaymentAmount(orderSummary.total);
    if (!amountValidation.isValid) throw new Error(amountValidation.error);

    const payload = {
      amount: orderSummary.total,
      customerName: formState.details.name,
      customerEmail: user?.email || "test@example.com",
      customerPhone: formState.details.phone || user?.phone || "",
      description: isTestMode
        ? "Test"
        : cart.products.map((p) => p.productId.name.en || p.productId.name.ar).join(" / "),
      // Full order data — server creates the DB order before redirecting
      orderData: sanitizeObject({
        products: cart.products.map((p) => ({
          productId: p.productId._id,
          quantity: p.quantity,
          isSpicy: p.isSpicy || false,
          additions: p.additions || [],
          notes: p.notes || "",
          selectedProtein: p.selectedProtein || null,
          selectedType: p.selectedType || null,
        })),
        userId: user?._id,
        shippingAddress: formState.selectedArea?._id || null,
        orderType: formState.orderType,
        userDetails: formState.details,
        paymentMethod: "card",
      }),
    };

    const { data } = await apiClient.post(API_ENDPOINTS.MONTYPAY_SESSION, payload);

    if (!data.redirect_url) throw new Error("No redirect URL received from payment gateway");

    return data.redirect_url;
  } catch (error) {
    console.error("MontyPay payment error:", error);
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Payment initiation failed");
  }
};

/**
 * ZainCash (CliQ) payment initiation
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} - API response
 */
export const initiateZainCashPayment = async ({ orderSummary, phone }) => {
  try {
    // Validate amount
    const amountValidation = validatePaymentAmount(orderSummary.total);
    if (!amountValidation.isValid) {
      throw new Error(amountValidation.error);
    }

    if (!phone) {
      throw new Error("Phone number is required for CliQ payment");
    }

    const payload = {
      amount: orderSummary.total.toFixed(3),
      mobile: phone,
    };

    const { data } = await apiClient.post(
      API_ENDPOINTS.ZAINCASH_INITIATE,
      payload,
    );

    return data;
  } catch (error) {
    console.error("ZainCash initiation error:", error);
    throw new Error(
      error.response?.data?.message || "CliQ payment initiation failed",
    );
  }
};

/**
 * ZainCash (CliQ) payment confirmation with OTP
 * @param {Object} params - Confirmation parameters
 * @returns {Promise<Object>} - API response
 */
export const confirmZainCashPayment = async ({ orderSummary, phone, otp, orderId }) => {
  try {
    if (!otp || otp.length < 4) {
      throw new Error("Valid OTP is required");
    }

    const payload = {
      amount: orderSummary.total.toFixed(3),
      mobile: phone,
      otp: otp,
      orderId: orderId || null,
    };

    const { data } = await apiClient.post(
      API_ENDPOINTS.ZAINCASH_CONFIRM,
      payload,
    );

    // Zain returns ErrorCode "0" on success; any other code is a failure
    if (data?.ErrorObj && data.ErrorObj.ErrorCode !== "0") {
      throw new Error(
        data?.ErrorObj?.ErrorMessage || "Payment verification failed",
      );
    }

    return data;
  } catch (error) {
    console.error("ZainCash confirmation error:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Payment confirmation failed",
    );
  }
};

/**
 * Fetches delivery areas from API
 * @param {string} token - User authentication token
 * @returns {Promise<Array>} - List of delivery areas
 */
export const fetchDeliveryAreas = async (token) => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const { data } = await apiClient.get(API_ENDPOINTS.LOCATIONS, {
      headers: { authorization: `Bearer ${token}` },
    });

    return data.locations || [];
  } catch (error) {
    console.error("Fetch areas error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch delivery areas",
    );
  }
};

/**
 * Payment service factory
 * Creates appropriate payment handler based on method
 */
export const PaymentService = {
  montyPay: initiateMontyPayPayment,
  zainCash: {
    initiate: initiateZainCashPayment,
    confirm: confirmZainCashPayment,
  },
  fetchAreas: fetchDeliveryAreas,
};

export default PaymentService;

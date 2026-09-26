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
  saveCard,
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
      saveCard: saveCard !== false, // Default to true unless explicitly false
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
export const confirmZainCashPayment = async ({ orderSummary, phone, otp, orderId, orderData }) => {
  try {
    if (!otp || otp.length < 4) {
      throw new Error("Valid OTP is required");
    }

    const payload = {
      amount: orderSummary.total.toFixed(3),
      mobile: phone,
      otp: otp,
      orderId: orderId || null,
      // Full order data so the server can create the order after payment confirmation
      orderData: orderData || null,
    };

    const { data } = await apiClient.post(
      API_ENDPOINTS.ZAINCASH_CONFIRM,
      payload,
    );

    // Zain returns ErrorCode "0" on success; any other code is a failure
    // if (data?.ErrorObj && data.ErrorObj.ErrorCode !== "0") {
    //   throw new Error(
    //     data?.ErrorObj?.ErrorMessage || "Payment verification failed",
    //   );
    // }
    // ✅ الصح
const errorCode = data?.ErrorObj?.ErrorCode;
const isSuccess =
  !errorCode ||
  errorCode === "0" ||
  errorCode?.toLowerCase() === "success";

if (!isSuccess) {
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
 * Fetch user's saved cards for MontyPay
 * @param {string} token - User authentication token
 * @returns {Promise<Array>} - List of saved cards
 */
export const fetchSavedCards = async (token) => {
  try {
    if (!token) throw new Error("Authentication token is required");
    const { data } = await apiClient.get('/api/montypay/saved-cards', {
      headers: { authorization: `Bearer ${token}` }
    });
    return data.cards || [];
  } catch (error) {
    console.error("Fetch saved cards error:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch saved cards");
  }
};

/**
 * Initiate recurring payment with a saved card
 * @param {Object} params - Payment parameters
 * @returns {Promise<string>} - Order ID on success
 */
export const initiateRecurringPayment = async ({
  cart,
  formState,
  user,
  orderSummary,
  savedCardId,
  token,
}) => {
  try {
    if (!token) throw new Error("Authentication token is required");
    const amountValidation = validatePaymentAmount(orderSummary.total);
    if (!amountValidation.isValid) throw new Error(amountValidation.error);

    const payload = {
      amount: orderSummary.total,
      savedCardId,
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

    const { data } = await apiClient.post('/api/montypay/recurring', payload, {
      headers: { authorization: `Bearer ${token}` }
    });

    if (!data.success) throw new Error(data.reason || "Recurring payment failed");

    return data.dbOrderId;
  } catch (error) {
    console.error("Recurring payment error:", error);
    throw new Error(error.response?.data?.error || error.response?.data?.message || error.message || "Recurring payment failed");
  }
};

/**
 * Payment service factory
 * Creates appropriate payment handler based on method
 */
export const PaymentService = {
  montyPay: initiateMontyPayPayment,
  montyPayRecurring: initiateRecurringPayment,
  fetchSavedCards,
  zainCash: {
    initiate: initiateZainCashPayment,
    confirm: confirmZainCashPayment,
  },
  fetchAreas: fetchDeliveryAreas,
};

export default PaymentService;

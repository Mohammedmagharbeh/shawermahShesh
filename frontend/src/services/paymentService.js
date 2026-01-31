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
 * Saves pending order to session storage
 * @param {Object} orderData - Order data to save
 */
const savePendingOrder = (orderData) => {
  try {
    const sanitizedData = sanitizeObject(orderData);
    sessionStorage.setItem(
      STORAGE_KEYS.PENDING_ORDER,
      JSON.stringify(sanitizedData),
    );
  } catch (error) {
    console.error("Error saving pending order:", error);
    throw new Error("Failed to save order data");
  }
};

/**
 * MontyPay payment flow
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
    // Validate amount
    const amountValidation = validatePaymentAmount(orderSummary.total);
    if (!amountValidation.isValid) {
      throw new Error(amountValidation.error);
    }

    const sessionId = generateSessionId();

    const payload = {
      amount: orderSummary.total,
      customerName: formState.details.name,
      customerEmail: user?.email || "test@example.com",
      orderId: sessionId,
      description: isTestMode
        ? "Test"
        : cart.products.map((p) => p.productId.name.ar).join(" / "),
    };

    // Save pending order
    const orderData = createOrderPayload({
      cart,
      formState,
      user,
      orderSummary,
      isTestMode,
    });
    savePendingOrder(orderData);

    // Make API request
    const { data } = await apiClient.post(
      API_ENDPOINTS.MONTYPAY_SESSION,
      payload,
    );

    if (!data.redirect_url) {
      throw new Error("No redirect URL received from payment gateway");
    }

    return data.redirect_url;
  } catch (error) {
    console.error("MontyPay payment error:", error);
    throw new Error(
      error.response?.data?.message || "Payment initiation failed",
    );
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
export const confirmZainCashPayment = async ({ orderSummary, phone, otp }) => {
  try {
    if (!otp || otp.length < 4) {
      throw new Error("Valid OTP is required");
    }

    const payload = {
      amount: orderSummary.total.toFixed(3),
      mobile: phone,
      otp: otp,
    };

    const { data } = await apiClient.post(
      API_ENDPOINTS.ZAINCASH_CONFIRM,
      payload,
    );

    // Check for error in response
    if (data?.ErrorObj?.ErrorCode !== "0") {
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

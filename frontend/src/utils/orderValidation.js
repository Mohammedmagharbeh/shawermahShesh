import { VALIDATION_KEYS } from "@/components/checkout/constants";
import { sanitizeText, sanitizePhone } from "./inputSanitization";

/**
 * Validates if the cart has items
 * @param {Object} cart - Cart object
 * @param {boolean} isTestMode - Whether in test mode
 * @returns {{ isValid: boolean, errorKey: string|null }}
 */
export const validateCart = (cart, isTestMode) => {
  if (!cart?.products?.length && !isTestMode) {
    return {
      isValid: false,
      errorKey: VALIDATION_KEYS.CART_EMPTY,
    };
  }

  return { isValid: true, errorKey: null };
};

/**
 * Validates delivery area selection
 * @param {Object} formState - Current form state
 * @param {boolean} isTestMode - Whether in test mode
 * @returns {{ isValid: boolean, errorKey: string|null }}
 */
export const validateDeliveryArea = (formState, isTestMode) => {
  const { orderType, selectedArea } = formState;

  if (orderType === "delivery" && !selectedArea?._id && !isTestMode) {
    return {
      isValid: false,
      errorKey: VALIDATION_KEYS.SELECT_AREA,
    };
  }

  return { isValid: true, errorKey: null };
};

/**
 * Validates customer details
 * @param {Object} details - Customer details object
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateCustomerDetails = (details) => {
  const errors = {};

  if (!details.name || sanitizeText(details.name).length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  if (!details.phone || sanitizePhone(details.phone).length < 10) {
    errors.phone = "Valid phone number is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates OTP code
 * @param {string} otp - OTP code
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validateOTP = (otp) => {
  if (!otp || otp.length < 4) {
    return {
      isValid: false,
      error: "OTP must be at least 4 digits",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates entire order before submission
 * @param {Object} params - Validation parameters
 * @param {Object} params.cart - Cart object
 * @param {Object} params.formState - Form state
 * @param {boolean} params.isTestMode - Test mode flag
 * @returns {{ isValid: boolean, errors: Array }}
 */
export const validateOrder = ({ cart, formState, isTestMode }) => {
  const errors = [];

  // Validate cart
  const cartValidation = validateCart(cart, isTestMode);
  if (!cartValidation.isValid) {
    errors.push(cartValidation.errorKey);
  }

  // Validate delivery area if needed
  const areaValidation = validateDeliveryArea(formState, isTestMode);
  if (!areaValidation.isValid) {
    errors.push(areaValidation.errorKey);
  }

  // Validate customer details (not in test mode)
  if (!isTestMode) {
    const detailsValidation = validateCustomerDetails(formState.details);
    if (!detailsValidation.isValid) {
      Object.values(detailsValidation.errors).forEach((err) =>
        errors.push(err),
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates payment amount
 * @param {number} amount - Payment amount
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validatePaymentAmount = (amount) => {
  if (!amount || amount <= 0) {
    return {
      isValid: false,
      error: "Invalid payment amount",
    };
  }

  if (amount > 10000) {
    return {
      isValid: false,
      error: "Payment amount exceeds maximum limit",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates session storage data structure
 * @param {Object} data - Data from session storage
 * @returns {boolean} - Whether data is valid
 */
export const validateSessionData = (data) => {
  if (!data || typeof data !== "object") return false;

  // Check required fields
  const requiredFields = ["products", "userId", "totalPrice", "orderType"];

  return requiredFields.every((field) => {
    if (field === "products") {
      return Array.isArray(data[field]) && data[field].length > 0;
    }
    return data.hasOwnProperty(field) && data[field] != null;
  });
};

/**
 * Sanitizes and validates form input
 * @param {string} field - Field name
 * @param {*} value - Field value
 * @returns {*} - Validated and sanitized value
 */
export const sanitizeAndValidateInput = (field, value) => {
  switch (field) {
    case "name":
    case "apartment":
      return sanitizeText(value);

    case "phone":
      return sanitizePhone(value);

    case "otp":
      return value.replace(/\D/g, "").slice(0, 6);

    default:
      return value;
  }
};

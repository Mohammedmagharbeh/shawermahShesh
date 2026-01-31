import DOMPurify from "dompurify";

/**
 * Sanitizes text input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeText = (input) => {
  if (!input || typeof input !== "string") return "";

  // Remove any HTML tags and scripts
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
};

/**
 * Sanitizes phone number input - allows only digits and common phone characters
 * @param {string} phone - The phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== "string") return "";

  // Allow only digits, +, -, (, ), and spaces
  return phone.replace(/[^\d+\-() ]/g, "").trim();
};

/**
 * Sanitizes numeric input
 * @param {string|number} value - The value to sanitize
 * @returns {number} - Sanitized number or 0 if invalid
 */
export const sanitizeNumber = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
};

/**
 * Sanitizes OTP code - allows only digits
 * @param {string} otp - The OTP to sanitize
 * @returns {string} - Sanitized OTP
 */
export const sanitizeOTP = (otp) => {
  if (!otp || typeof otp !== "string") return "";
  return otp.replace(/\D/g, "").slice(0, 6); // Max 6 digits for OTP
};

/**
 * Validates and sanitizes email
 * @param {string} email - The email to validate
 * @returns {string} - Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(sanitized) ? sanitized : "";
};

/**
 * Sanitizes object for session storage
 * Recursively sanitizes all string values in an object
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return {};

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === "number") {
      sanitized[key] = sanitizeNumber(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "object" ? sanitizeObject(item) : item,
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Safely retrieves and parses JSON from session storage
 * @param {string} key - Storage key
 * @returns {Object|null} - Parsed and sanitized object or null
 */
export const safeGetSessionStorage = (key) => {
  try {
    const item = sessionStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    return sanitizeObject(parsed);
  } catch (error) {
    console.error(`Error parsing session storage key "${key}":`, error);
    return null;
  }
};

/**
 * Validates URL to prevent loading malicious external resources
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is safe
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;

  try {
    const urlObj = new URL(url);
    // Only allow https and http protocols
    if (!["https:", "http:"].includes(urlObj.protocol)) return false;

    // Optional: Whitelist specific domains
    const allowedDomains = [
      "upload.wikimedia.org",
      // Add other trusted domains
    ];

    // If you want to enforce whitelist, uncomment:
    // return allowedDomains.some(domain => urlObj.hostname.includes(domain));

    return true;
  } catch {
    return false;
  }
};

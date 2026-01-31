import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import {
  TEST_PRODUCT_ID,
  DEFAULT_FORM_STATE,
  TEST_MODE_DEFAULTS,
  CLIQ_STEPS,
  PAYMENT_METHODS,
  ORDER_TYPES,
  VALIDATION_KEYS,
} from "@/components/checkout/constants";
import { validateOrder } from "@/utils/orderValidation";
import { sanitizeAndValidateInput } from "@/utils/orderValidation";
import PaymentService from "@/services/paymentService";

/**
 * Custom hook for checkout logic
 * Manages form state, validation, payment processing, and area fetching
 * @param {Function} t - Translation function
 * @returns {Object} Checkout state and handlers
 */
export const useCheckoutLogic = (t) => {
  const { cart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- State ---
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formState, setFormState] = useState(() => ({
    ...DEFAULT_FORM_STATE,
    details: {
      ...DEFAULT_FORM_STATE.details,
      name: user?.name || "",
      phone: user?.phone || "",
    },
  }));

  // --- Derived State (Test Mode) ---
  const isTestMode = useMemo(() => {
    const hasTestProduct = cart.products.some(
      (p) => (p.productId._id || p.productId) === TEST_PRODUCT_ID,
    );
    return searchParams.get("test") === "1" || hasTestProduct;
  }, [cart.products, searchParams]);

  // --- Price Calculation Engine (Memoized) ---
  const orderSummary = useMemo(() => {
    let originalSubtotal = 0;
    let finalSubtotal = 0;

    cart.products.forEach((item) => {
      const {
        productId,
        additions = [],
        quantity,
        selectedProtein,
        selectedType,
      } = item;
      let basePrice = Number(productId.basePrice || 0);

      // Handle Matrix Pricing
      if (productId.prices) {
        if (selectedProtein && selectedType) {
          basePrice =
            productId.prices[selectedProtein]?.[selectedType] ?? basePrice;
        } else if (selectedProtein) {
          basePrice = productId.prices[selectedProtein] ?? basePrice;
        } else if (selectedType) {
          basePrice = productId.prices[selectedType] ?? basePrice;
        }
      }

      const additionsCost = additions.reduce(
        (sum, add) => sum + Number(add.price || 0),
        0,
      );
      const discountAmount =
        (basePrice * Number(productId.discount || 0)) / 100;

      originalSubtotal += (basePrice + additionsCost) * quantity;
      finalSubtotal += (basePrice - discountAmount + additionsCost) * quantity;
    });

    const deliveryCost =
      formState.orderType === ORDER_TYPES.DELIVERY
        ? formState.selectedArea?.deliveryCost || 0
        : 0;

    return {
      subtotal: finalSubtotal,
      originalSubtotal,
      savings: originalSubtotal - finalSubtotal,
      deliveryCost,
      total: isTestMode
        ? TEST_MODE_DEFAULTS.TOTAL_AMOUNT
        : finalSubtotal + deliveryCost,
    };
  }, [cart.products, formState.orderType, formState.selectedArea, isTestMode]);

  // --- Effects ---

  // Handle test mode and empty cart redirect
  useEffect(() => {
    if (isTestMode) {
      setFormState((prev) => ({
        ...prev,
        orderType: TEST_MODE_DEFAULTS.ORDER_TYPE,
        details: {
          ...prev.details,
          name: TEST_MODE_DEFAULTS.NAME,
        },
      }));
    } else if (!cart.products?.length) {
      navigate("/products");
    }
  }, [isTestMode, cart.products, navigate]);

  // Fetch delivery areas
  useEffect(() => {
    const fetchAreas = async () => {
      if (!user?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const locations = await PaymentService.fetchAreas(user.token);
        setAreas(locations);
      } catch (e) {
        console.error("Location fetch error:", e);
        setError(t(VALIDATION_KEYS.FETCH_AREA_ERROR));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAreas();
  }, [user?.token, t]);

  // --- Handlers (Memoized with useCallback) ---

  /**
   * Updates a top-level form field
   */
  const updateForm = useCallback((field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Updates a nested details field with sanitization
   */
  const updateDetails = useCallback((field, value) => {
    const sanitizedValue = sanitizeAndValidateInput(field, value);
    setFormState((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: sanitizedValue },
    }));
  }, []);

  /**
   * Validates and initiates payment flow
   */
  const handlePayment = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate order
      const validation = validateOrder({ cart, formState, isTestMode });
      if (!validation.isValid) {
        validation.errors.forEach((err) => toast.error(t(err) || err));
        return;
      }

      setIsSubmitting(true);

      try {
        if (formState.paymentMethod === PAYMENT_METHODS.CLIQ) {
          await handleZainCashFlow();
        } else {
          await handleMontyPayFlow();
        }
      } catch (err) {
        console.error("Payment error:", err);
        toast.error(err.message || t(VALIDATION_KEYS.CHECKOUT_FAILED));
      } finally {
        setIsSubmitting(false);
      }
    },
    [cart, formState, isTestMode, t],
  );

  /**
   * Handles MontyPay payment flow
   */
  const handleMontyPayFlow = useCallback(async () => {
    try {
      const redirectUrl = await PaymentService.montyPay({
        cart,
        formState,
        user,
        orderSummary,
        isTestMode,
      });

      window.location.href = redirectUrl;
    } catch (error) {
      throw error;
    }
  }, [cart, formState, user, orderSummary, isTestMode]);

  /**
   * Handles ZainCash (CliQ) payment initiation
   */
  const handleZainCashFlow = useCallback(async () => {
    try {
      await PaymentService.zainCash.initiate({
        orderSummary,
        phone: formState.details.phone,
      });

      setFormState((prev) => ({ ...prev, cliqStep: CLIQ_STEPS.OTP_SENT }));
      toast.success("OTP sent to your mobile number");
    } catch (error) {
      throw error;
    }
  }, [orderSummary, formState.details.phone]);

  /**
   * Confirms ZainCash payment with OTP
   */
  const confirmCliqPayment = useCallback(async () => {
    setIsSubmitting(true);

    try {
      await PaymentService.zainCash.confirm({
        orderSummary,
        phone: formState.details.phone,
        otp: formState.otp,
      });

      toast.success("Payment successful!");
      navigate("/order-success");
    } catch (error) {
      console.error("CliQ confirmation error:", error);
      toast.error(error.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [orderSummary, formState.details.phone, formState.otp, navigate]);

  // --- Return Hook API ---
  return {
    // Data
    areas,
    orderSummary,
    formState,

    // State flags
    isLoading,
    isSubmitting,
    isTestMode,
    error,

    // Handlers
    updateForm,
    updateDetails,
    handlePayment,
    confirmCliqPayment,
  };
};

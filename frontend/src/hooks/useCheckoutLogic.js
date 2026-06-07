// import { useState, useEffect, useMemo, useCallback } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { useCart } from "@/contexts/CartContext";
// import { useUser } from "@/contexts/UserContext";
// import toast from "react-hot-toast";
// import {
//   TEST_PRODUCT_ID,
//   DEFAULT_FORM_STATE,
//   TEST_MODE_DEFAULTS,
//   CLIQ_STEPS,
//   PAYMENT_METHODS,
//   ORDER_TYPES,
//   VALIDATION_KEYS,
// } from "@/components/checkout/constants";
// import { validateOrder } from "@/utils/orderValidation";
// import { sanitizeAndValidateInput } from "@/utils/orderValidation";
// import PaymentService from "@/services/paymentService";

// /**
//  * Custom hook for checkout logic
//  * Manages form state, validation, payment processing, and area fetching
//  * @param {Function} t - Translation function
//  * @returns {Object} Checkout state and handlers
//  */
// export const useCheckoutLogic = (t) => {
//   const { cart } = useCart();
//   const { user } = useUser();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   // --- State ---
//   const [areas, setAreas] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   const [formState, setFormState] = useState(() => ({
//     ...DEFAULT_FORM_STATE,
//     details: {
//       ...DEFAULT_FORM_STATE.details,
//       name: user?.name || "",
//       phone: user?.phone || "",
//     },
//   }));

//   // --- Derived State (Test Mode) ---
//   const isTestMode = useMemo(() => {
//     const hasTestProduct = cart.products.some(
//       (p) => (p.productId._id || p.productId) === TEST_PRODUCT_ID,
//     );
//     return searchParams.get("test") === "1" || hasTestProduct;
//   }, [cart.products, searchParams]);

//   // --- Price Calculation Engine (Memoized) ---
//   const orderSummary = useMemo(() => {
//     let originalSubtotal = 0;
//     let finalSubtotal = 0;
//     let totalAdditions = 0;

//     cart.products.forEach((item) => {
//       const {
//         productId,
//         additions = [],
//         quantity,
//         selectedProtein,
//         selectedType,
//       } = item;
//       let basePrice = Number(productId.basePrice || 0);

//       // Handle Matrix Pricing
//       if (productId.prices) {
//         if (selectedProtein && selectedType) {
//           basePrice =
//             productId.prices[selectedProtein]?.[selectedType] ?? basePrice;
//         } else if (selectedProtein) {
//           basePrice = productId.prices[selectedProtein] ?? basePrice;
//         } else if (selectedType) {
//           basePrice = productId.prices[selectedType] ?? basePrice;
//         }
//       }

//       const additionsCost = additions.reduce(
//         (sum, add) => sum + Number(add.price || 0),
//         0,
//       );
//       const discountAmount =
//         (basePrice * Number(productId.discount || 0)) / 100;

//       originalSubtotal += (basePrice + additionsCost) * quantity;
//       finalSubtotal += (basePrice - discountAmount + additionsCost) * quantity;
//       totalAdditions += additionsCost * quantity;
//     });

//     const deliveryCost =
//       formState.orderType === ORDER_TYPES.DELIVERY
//         ? formState.selectedArea?.deliveryCost || 0
//         : 0;

//     return {
//       subtotal: finalSubtotal,
//       originalSubtotal,
//       savings: originalSubtotal - finalSubtotal,
//       deliveryCost,
//       totalAdditions,
//       total: isTestMode
//         ? TEST_MODE_DEFAULTS.TOTAL_AMOUNT
//         : finalSubtotal + deliveryCost,
//     };
//   }, [cart.products, formState.orderType, formState.selectedArea, isTestMode]);

//   // --- Effects ---

//   // Handle test mode and empty cart redirect
//   useEffect(() => {
//     if (isTestMode) {
//       setFormState((prev) => ({
//         ...prev,
//         orderType: TEST_MODE_DEFAULTS.ORDER_TYPE,
//         details: {
//           ...prev.details,
//           name: TEST_MODE_DEFAULTS.NAME,
//         },
//       }));
//     } else if (!cart.products?.length) {
//       navigate("/products");
//     }
//   }, [isTestMode, cart.products, navigate]);

//   // Fetch delivery areas
//   useEffect(() => {
//     const fetchAreas = async () => {
//       if (!user?.token) {
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const locations = await PaymentService.fetchAreas(user.token);
//         setAreas(locations);
//       } catch (e) {
//         console.error("Location fetch error:", e);
//         setError(t(VALIDATION_KEYS.FETCH_AREA_ERROR));
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAreas();
//   }, [user?.token, t]);

//   // --- Handlers (Memoized with useCallback) ---

//   /**
//    * Updates a top-level form field
//    */
//   const updateForm = useCallback((field, value) => {
//     setFormState((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   /**
//    * Updates a nested details field with sanitization
//    */
//   const updateDetails = useCallback((field, value) => {
//     const sanitizedValue = sanitizeAndValidateInput(field, value);
//     setFormState((prev) => ({
//       ...prev,
//       details: { ...prev.details, [field]: sanitizedValue },
//     }));
//   }, []);

//   /**
//    * Validates and initiates payment flow
//    */
//   const handlePayment = useCallback(
//     async (e) => {
//       e.preventDefault();

//       // Validate order
//       const validation = validateOrder({ cart, formState, isTestMode });
//       if (!validation.isValid) {
//         validation.errors.forEach((err) => toast.error(t(err) || err));
//         return;
//       }

//       setIsSubmitting(true);

//       try {
//         if (formState.paymentMethod === PAYMENT_METHODS.CLIQ) {
//           await handleZainCashFlow();
//         } else {
//           await handleMontyPayFlow();
//         }
//       } catch (err) {
//         console.error("Payment error:", err);
//         toast.error(err.message || t(VALIDATION_KEYS.CHECKOUT_FAILED));
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [cart, formState, isTestMode, t],
//   );

//   /**
//    * Handles MontyPay payment flow
//    */
//   const handleMontyPayFlow = useCallback(async () => {
//     try {
//       const redirectUrl = await PaymentService.montyPay({
//         cart,
//         formState,
//         user,
//         orderSummary,
//         isTestMode,
//       });

//       window.location.href = redirectUrl;
//     } catch (error) {
//       throw error;
//     }
//   }, [cart, formState, user, orderSummary, isTestMode]);

//   /**
//    * Handles ZainCash (CliQ) payment initiation
//    */
//   const handleZainCashFlow = useCallback(async () => {
//     // Transition to phone input step – OTP is not sent until user submits a phone number
//     setFormState((prev) => ({ ...prev, cliqStep: CLIQ_STEPS.PHONE_INPUT, cliqPhone: "" }));
//     // We don't setIsSubmitting(false) here because handlePayment's finally block handles it
//   }, []);

//   /**
//    * Sends OTP to the user-entered CliQ phone number
//    */
//   const sendCliqOtp = useCallback(async () => {
//     setIsSubmitting(true);
//     try {
//       await PaymentService.zainCash.initiate({
//         orderSummary,
//         phone: formState.cliqPhone,
//       });

//       setFormState((prev) => ({ ...prev, cliqStep: CLIQ_STEPS.OTP_SENT }));
//       toast.success("OTP sent to " + formState.cliqPhone);
//     } catch (error) {
//       console.error("CliQ OTP send error:", error);
//       toast.error(error.message || "Failed to send OTP");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [orderSummary, formState.cliqPhone]);

//   /**
//    * Confirms ZainCash payment with OTP
//    */
//   const confirmCliqPayment = useCallback(async () => {
//     setIsSubmitting(true);

//     try {
//       // Build order data payload (same structure as MontyPay's orderData)
//       const orderData = {
//         products: cart.products.map((p) => ({
//           productId: p.productId._id,
//           quantity: p.quantity,
//           isSpicy: p.isSpicy || false,
//           additions: p.additions || [],
//           notes: p.notes || "",
//           selectedProtein: p.selectedProtein || null,
//           selectedType: p.selectedType || null,
//         })),
//         userId: user?._id,
//         shippingAddress: formState.selectedArea?._id || null,
//         orderType: formState.orderType,
//         userDetails: formState.details,
//         paymentMethod: "cliq",
//       };

//       const result = await PaymentService.zainCash.confirm({
//         orderSummary,
//         phone: formState.cliqPhone,
//         otp: formState.otp,
//         orderId: formState.orderId || null,
//         orderData,
//       });

//       const refId = result?.refId || result?.data?.RefID;
//       if (refId) {
//         console.log("[ZainCash] Payment RefID:", refId);
//       }

//       toast.success("Payment successful!");
//       // navigate("/success");
//       navigate(`/success?dbOrderId=${result?.orderId}`);
//     } catch (error) {
//       console.error("CliQ confirmation error:", error);
//       toast.error(error.message || "Verification failed");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [cart, user, orderSummary, formState, navigate]);

//   // --- Return Hook API ---
//   return {
//     // Data
//     areas,
//     orderSummary,
//     formState,

//     // State flags
//     isLoading,
//     isSubmitting,
//     isTestMode,
//     error,

//     // Handlers
//     updateForm,
//     updateDetails,
//     handlePayment,
//     sendCliqOtp,
//     confirmCliqPayment,
//   };
// };
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
  ORANGE_STEPS,
  PAYMENT_METHODS,
  ORDER_TYPES,
  VALIDATION_KEYS,
} from "@/components/checkout/constants";
import { validateOrder } from "@/utils/orderValidation";
import { sanitizeAndValidateInput } from "@/utils/orderValidation";
import PaymentService from "@/services/paymentService";
import { getServicers, rtpOtpValidate, rtpOtpConfirm } from "@/services/orangeMoneyService";

export const useCheckoutLogic = (t) => {
  const { cart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- State ---
  const [areas, setAreas] = useState([]);
  const [orangeServicers, setOrangeServicers] = useState([]);
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

  // --- Price Calculation Engine ---
  const orderSummary = useMemo(() => {
    let originalSubtotal = 0;
    let finalSubtotal = 0;
    let totalAdditions = 0;

    cart.products.forEach((item) => {
      const { productId, additions = [], quantity, selectedProtein, selectedType } = item;
      let basePrice = Number(productId.basePrice || 0);

      if (productId.prices) {
        if (selectedProtein && selectedType) {
          basePrice = productId.prices[selectedProtein]?.[selectedType] ?? basePrice;
        } else if (selectedProtein) {
          basePrice = productId.prices[selectedProtein] ?? basePrice;
        } else if (selectedType) {
          basePrice = productId.prices[selectedType] ?? basePrice;
        }
      }

      const additionsCost = additions.reduce((sum, add) => sum + Number(add.price || 0), 0);
      const discountAmount = (basePrice * Number(productId.discount || 0)) / 100;

      originalSubtotal += (basePrice + additionsCost) * quantity;
      finalSubtotal += (basePrice - discountAmount + additionsCost) * quantity;
      totalAdditions += additionsCost * quantity;
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
      totalAdditions,
      total: isTestMode ? TEST_MODE_DEFAULTS.TOTAL_AMOUNT : finalSubtotal + deliveryCost,
    };
  }, [cart.products, formState.orderType, formState.selectedArea, isTestMode]);

  // --- Effects ---

  useEffect(() => {
    if (isTestMode) {
      setFormState((prev) => ({
        ...prev,
        orderType: TEST_MODE_DEFAULTS.ORDER_TYPE,
        details: { ...prev.details, name: TEST_MODE_DEFAULTS.NAME },
      }));
    } else if (!cart.products?.length) {
      navigate("/products");
    }
  }, [isTestMode, cart.products, navigate]);

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

  useEffect(() => {
    const fetchServicers = async () => {
      try {
        const data = await getServicers();
        setOrangeServicers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Servicers fetch error:", e);
        setOrangeServicers([]);
      }
    };
    fetchServicers();
  }, []);

  // --- Handlers ---

  const updateForm = useCallback((field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateDetails = useCallback((field, value) => {
    const sanitizedValue = sanitizeAndValidateInput(field, value);
    setFormState((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: sanitizedValue },
    }));
  }, []);

  const handleMontyPayFlow = useCallback(async () => {
    const redirectUrl = await PaymentService.montyPay({
      cart, formState, user, orderSummary, isTestMode,
    });
    window.location.href = redirectUrl;
  }, [cart, formState, user, orderSummary, isTestMode]);

  // CliQ handlers
  const handleZainCashFlow = useCallback(async () => {
    setFormState((prev) => ({ ...prev, cliqStep: CLIQ_STEPS.PHONE_INPUT, cliqPhone: "" }));
  }, []);

  const sendCliqOtp = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await PaymentService.zainCash.initiate({
        orderSummary,
        phone: formState.cliqPhone,
      });
      setFormState((prev) => ({ ...prev, cliqStep: CLIQ_STEPS.OTP_SENT }));
      toast.success("تم إرسال OTP على " + formState.cliqPhone);
    } catch (error) {
      toast.error(error.message || "فشل إرسال OTP");
    } finally {
      setIsSubmitting(false);
    }
  }, [orderSummary, formState.cliqPhone]);

  const confirmCliqPayment = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
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
        paymentMethod: "cliq",
      };

      const result = await PaymentService.zainCash.confirm({
        orderSummary,
        phone: formState.cliqPhone,
        otp: formState.otp,
        orderId: formState.orderId || null,
        orderData,
      });

      toast.success("تم الدفع بنجاح!");
      navigate(`/success?dbOrderId=${result?.orderId}`);
    } catch (error) {
      toast.error(error.message || "فشل التحقق");
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, user, orderSummary, formState, navigate]);

  // Orange Money handlers

  const handleOrangeMoneyFlow = useCallback(async () => {
    setFormState((prev) => ({
      ...prev,
      orangeStep: ORANGE_STEPS.SELECT_BANK,
      orangePhone: "",
      orangeServicerCode: "",
      orangeMerchantReference: "",
    }));
  }, []);

  // ✅ التعديل هنا فقط — sendOrangeOtp
  const sendOrangeOtp = useCallback(async () => {
    if (!formState.orangePhone || !formState.orangeServicerCode) {
      toast.error("أدخل رقم التلفون واختر البنك");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await rtpOtpValidate({
        phone: formState.orangePhone,
        amount: orderSummary.total,
        servicerCode: formState.orangeServicerCode,
      });

      // ✅ merchantReference جاي من الـ backend عبر result
      setFormState((prev) => ({
        ...prev,
        orangeStep: ORANGE_STEPS.OTP_SENT,
        orangeMerchantReference: result.merchantReference,
      }));
      toast.success("تم إرسال OTP على رقمك");
    } catch (error) {
      toast.error(error.message || "فشل إرسال OTP");
    } finally {
      setIsSubmitting(false);
    }
  }, [formState.orangePhone, formState.orangeServicerCode, orderSummary.total]);

  // ✅ التعديل هنا فقط — confirmOrangePayment
  const confirmOrangePayment = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
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
        paymentMethod: "orange_money",
      };

      const result = await rtpOtpConfirm({
        phone: formState.orangePhone,
        amount: orderSummary.total,
        servicerCode: formState.orangeServicerCode,
        merchantReference: formState.orangeMerchantReference,
        otp: formState.otp,
        orderData,
      });

      toast.success("تم الدفع بنجاح!");
      navigate(`/success?dbOrderId=${result?.orderId}`);
    } catch (error) {
      toast.error(error.message || "فشل التحقق");
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, user, orderSummary, formState, navigate]);

  // Main payment handler
  const handlePayment = useCallback(
    async (e) => {
      e.preventDefault();

      const validation = validateOrder({ cart, formState, isTestMode });
      if (!validation.isValid) {
        validation.errors.forEach((err) => toast.error(t(err) || err));
        return;
      }

      if (formState.paymentMethod === PAYMENT_METHODS.CLIQ) {
        await handleZainCashFlow();
        return;
      }

      if (formState.paymentMethod === PAYMENT_METHODS.ORANGE_MONEY) {
        await handleOrangeMoneyFlow();
        return;
      }

      setIsSubmitting(true);
      try {
        await handleMontyPayFlow();
      } catch (err) {
        toast.error(err.message || t(VALIDATION_KEYS.CHECKOUT_FAILED));
      } finally {
        setIsSubmitting(false);
      }
    },
    [cart, formState, isTestMode, t, handleZainCashFlow, handleOrangeMoneyFlow, handleMontyPayFlow],
  );

  return {
    areas,
    orangeServicers,
    orderSummary,
    formState,
    isLoading,
    isSubmitting,
    isTestMode,
    error,
    updateForm,
    updateDetails,
    handlePayment,
    // CliQ
    sendCliqOtp,
    confirmCliqPayment,
    // Orange Money
    sendOrangeOtp,
    confirmOrangePayment,
  };
};
// // import { useState, useEffect, useMemo, useCallback } from "react";
// // import { useSearchParams, useNavigate } from "react-router-dom";
// // import { useCart } from "@/contexts/CartContext";
// // import { useUser } from "@/contexts/UserContext";
// // import toast from "react-hot-toast";
// // import {
// //   TEST_PRODUCT_ID,
// //   DEFAULT_FORM_STATE,
// //   TEST_MODE_DEFAULTS,
// //   CLIQ_STEPS,
// //   ORANGE_STEPS,
// //   PAYMENT_METHODS,
// //   ORDER_TYPES,
// //   VALIDATION_KEYS,
// // } from "@/components/checkout/constants";
// // import { validateOrder } from "@/utils/orderValidation";
// // import { sanitizeAndValidateInput } from "@/utils/orderValidation";
// // import PaymentService from "@/services/paymentService";
// // import {
// //   getServicers,
// //   rtpOtpValidate,
// //   rtpOtpConfirm,
// // } from "@/services/orangeMoneyService";

// // export const useCheckoutLogic = (t) => {
// //   const { cart } = useCart();
// //   const { user } = useUser();
// //   const navigate = useNavigate();
// //   const [searchParams] = useSearchParams();

// //   // --- State ---
// //   const [areas, setAreas] = useState([]);
// //   const [orangeServicers, setOrangeServicers] = useState([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [error, setError] = useState(null);

// //   const [formState, setFormState] = useState(() => ({
// //     ...DEFAULT_FORM_STATE,
// //     details: {
// //       ...DEFAULT_FORM_STATE.details,
// //       name: user?.name || "",
// //       phone: user?.phone || "",
// //     },
// //   }));

// //   // --- Derived State (Test Mode) ---
// //   const isTestMode = useMemo(() => {
// //     const hasTestProduct = cart.products.some(
// //       (p) => (p.productId._id || p.productId) === TEST_PRODUCT_ID,
// //     );
// //     return searchParams.get("test") === "1" || hasTestProduct;
// //   }, [cart.products, searchParams]);

// //   // --- Price Calculation Engine ---
// //   const orderSummary = useMemo(() => {
// //     let originalSubtotal = 0;
// //     let finalSubtotal = 0;
// //     let totalAdditions = 0;

// //     cart.products.forEach((item) => {
// //       const {
// //         productId,
// //         additions = [],
// //         quantity,
// //         selectedProtein,
// //         selectedType,
// //       } = item;
// //       let basePrice = Number(productId.basePrice || 0);

// //       if (productId.prices) {
// //         if (selectedProtein && selectedType) {
// //           basePrice =
// //             productId.prices[selectedProtein]?.[selectedType] ?? basePrice;
// //         } else if (selectedProtein) {
// //           basePrice = productId.prices[selectedProtein] ?? basePrice;
// //         } else if (selectedType) {
// //           basePrice = productId.prices[selectedType] ?? basePrice;
// //         }
// //       }

// //       const additionsCost = additions.reduce(
// //         (sum, add) => sum + Number(add.price || 0),
// //         0,
// //       );
// //       const discountAmount =
// //         (basePrice * Number(productId.discount || 0)) / 100;

// //       originalSubtotal += (basePrice + additionsCost) * quantity;
// //       finalSubtotal += (basePrice - discountAmount + additionsCost) * quantity;
// //       totalAdditions += additionsCost * quantity;
// //     });

// //     const deliveryCost =
// //       formState.orderType === ORDER_TYPES.DELIVERY
// //         ? formState.selectedArea?.deliveryCost || 0
// //         : 0;

// //     return {
// //       subtotal: finalSubtotal,
// //       originalSubtotal,
// //       savings: originalSubtotal - finalSubtotal,
// //       deliveryCost,
// //       totalAdditions,
// //       total: isTestMode
// //         ? TEST_MODE_DEFAULTS.TOTAL_AMOUNT
// //         : finalSubtotal + deliveryCost,
// //     };
// //   }, [cart.products, formState.orderType, formState.selectedArea, isTestMode]);

// //   // --- Effects ---

// //   useEffect(() => {
// //     if (isTestMode) {
// //       setFormState((prev) => ({
// //         ...prev,
// //         orderType: TEST_MODE_DEFAULTS.ORDER_TYPE,
// //         details: { ...prev.details, name: TEST_MODE_DEFAULTS.NAME },
// //       }));
// //     } else if (!cart.products?.length) {
// //       navigate("/products");
// //     }
// //   }, [isTestMode, cart.products, navigate]);

// //   useEffect(() => {
// //     const fetchAreas = async () => {
// //       if (!user?.token) {
// //         setIsLoading(false);
// //         return;
// //       }
// //       try {
// //         const locations = await PaymentService.fetchAreas(user.token);
// //         setAreas(locations);
// //       } catch (e) {
// //         console.error("Location fetch error:", e);
// //         setError(t(VALIDATION_KEYS.FETCH_AREA_ERROR));
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };
// //     fetchAreas();
// //   }, [user?.token, t]);

// //   useEffect(() => {
// //     const fetchServicers = async () => {
// //       try {
// //         const data = await getServicers();
// //         setOrangeServicers(Array.isArray(data) ? data : []);
// //       } catch (e) {
// //         console.error("Servicers fetch error:", e);
// //         setOrangeServicers([]);
// //       }
// //     };
// //     fetchServicers();
// //   }, []);

// //   // --- Handlers ---

// //   const updateForm = useCallback((field, value) => {
// //     setFormState((prev) => ({ ...prev, [field]: value }));
// //   }, []);

// //   const updateDetails = useCallback((field, value) => {
// //     const sanitizedValue = sanitizeAndValidateInput(field, value);
// //     setFormState((prev) => ({
// //       ...prev,
// //       details: { ...prev.details, [field]: sanitizedValue },
// //     }));
// //   }, []);

// //   const handleMontyPayFlow = useCallback(async () => {
// //     const redirectUrl = await PaymentService.montyPay({
// //       cart,
// //       formState,
// //       user,
// //       orderSummary,
// //       isTestMode,
// //     });
// //     window.location.href = redirectUrl;
// //   }, [cart, formState, user, orderSummary, isTestMode]);

// //   // CliQ handlers
// //   const handleZainCashFlow = useCallback(async () => {
// //     setFormState((prev) => ({
// //       ...prev,
// //       cliqStep: CLIQ_STEPS.PHONE_INPUT,
// //       cliqPhone: "",
// //     }));
// //   }, []);

// //   const sendCliqOtp = useCallback(async () => {
// //     setIsSubmitting(true);
// //     try {
// //       await PaymentService.zainCash.initiate({
// //         orderSummary,
// //         phone: formState.cliqPhone,
// //       });
// //       setFormState((prev) => ({ ...prev, cliqStep: CLIQ_STEPS.OTP_SENT }));
// //       toast.success("تم إرسال OTP على " + formState.cliqPhone);
// //     } catch (error) {
// //       toast.error(error.message || "فشل إرسال OTP");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [orderSummary, formState.cliqPhone]);

// //   const confirmCliqPayment = useCallback(async () => {
// //     setIsSubmitting(true);
// //     try {
// //       const orderData = {
// //         products: cart.products.map((p) => ({
// //           productId: p.productId._id,
// //           quantity: p.quantity,
// //           isSpicy: p.isSpicy || false,
// //           additions: p.additions || [],
// //           notes: p.notes || "",
// //           selectedProtein: p.selectedProtein || null,
// //           selectedType: p.selectedType || null,
// //         })),
// //         userId: user?._id,
// //         shippingAddress: formState.selectedArea?._id || null,
// //         orderType: formState.orderType,
// //         userDetails: formState.details,
// //         paymentMethod: "cliq",
// //       };

// //       const result = await PaymentService.zainCash.confirm({
// //         orderSummary,
// //         phone: formState.cliqPhone,
// //         otp: formState.otp,
// //         orderId: formState.orderId || null,
// //         orderData,
// //       });

// //       toast.success("تم الدفع بنجاح!");
// //       navigate(`/success?dbOrderId=${result?.orderId}`);
// //     } catch (error) {
// //       toast.error(error.message || "فشل التحقق");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [cart, user, orderSummary, formState, navigate]);

// //   // Orange Money handlers

// //   const handleOrangeMoneyFlow = useCallback(async () => {
// //     setFormState((prev) => ({
// //       ...prev,
// //       orangeStep: ORANGE_STEPS.SELECT_BANK,
// //       orangePhone: "",
// //       orangeServicerCode: "",
// //       orangeMerchantReference: "",
// //     }));
// //   }, []);

// //   // ✅ التعديل هنا فقط — sendOrangeOtp
// //   const sendOrangeOtp = useCallback(async () => {
// //     if (!formState.orangePhone || !formState.orangeServicerCode) {
// //       toast.error("أدخل رقم التلفون واختر البنك");
// //       return;
// //     }
// //     setIsSubmitting(true);
// //     try {
// //       const result = await rtpOtpValidate({
// //         phone: formState.orangePhone,
// //         amount: orderSummary.total,
// //         servicerCode: formState.orangeServicerCode,
// //       });

// //       // ✅ merchantReference جاي من الـ backend عبر result
// //       setFormState((prev) => ({
// //         ...prev,
// //         orangeStep: ORANGE_STEPS.OTP_SENT,
// //         orangeMerchantReference: result.merchantReference,
// //       }));
// //       toast.success("تم إرسال OTP على رقمك");
// //     } catch (error) {
// //       toast.error(error.message || "فشل إرسال OTP");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [formState.orangePhone, formState.orangeServicerCode, orderSummary.total]);

// //   // ✅ التعديل هنا فقط — confirmOrangePayment
// //   // const confirmOrangePayment = useCallback(async () => {
// //   //   setIsSubmitting(true);
// //   //   try {
// //   //     const orderData = {
// //   //       products: cart.products.map((p) => ({
// //   //         productId: p.productId._id,
// //   //         quantity: p.quantity,
// //   //         isSpicy: p.isSpicy || false,
// //   //         additions: p.additions || [],
// //   //         notes: p.notes || "",
// //   //         selectedProtein: p.selectedProtein || null,
// //   //         selectedType: p.selectedType || null,
// //   //       })),
// //   //       userId: user?._id,
// //   //       shippingAddress: formState.selectedArea?._id || null,
// //   //       orderType: formState.orderType,
// //   //       userDetails: formState.details,
// //   //       paymentMethod: "orange_money",
// //   //     };

// //   //     const result = await rtpOtpConfirm({
// //   //       phone: formState.orangePhone,
// //   //       amount: orderSummary.total,
// //   //       servicerCode: formState.orangeServicerCode,
// //   //       merchantReference: formState.orangeMerchantReference,
// //   //       otp: formState.otp,
// //   //       orderData,
// //   //     });

// //   //     toast.success("تم الدفع بنجاح!");
// //   //     navigate(`/success?dbOrderId=${result?.orderId}`);
// //   //   } catch (error) {
// //   //     toast.error(error.message || "فشل التحقق");
// //   //   } finally {
// //   //     setIsSubmitting(false);
// //   //   }
// //   // }, [cart, user, orderSummary, formState, navigate]);

// //   const confirmOrangePayment = useCallback(async () => {
// //     setIsSubmitting(true);
// //     try {
// //       const orderData = {
// //         products: cart.products.map((p) => {
// //           const product = p.productId;
// //           let basePrice = Number(product.basePrice || 0);

// //           if (product.prices) {
// //             if (p.selectedProtein && p.selectedType) {
// //               basePrice =
// //                 product.prices[p.selectedProtein]?.[p.selectedType] ??
// //                 basePrice;
// //             } else if (p.selectedProtein) {
// //               basePrice = product.prices[p.selectedProtein] ?? basePrice;
// //             } else if (p.selectedType) {
// //               basePrice = product.prices[p.selectedType] ?? basePrice;
// //             }
// //           }

// //           const discount = Number(product.discount || 0);
// //           const priceAtPurchase =
// //             discount > 0 ? basePrice - (basePrice * discount) / 100 : basePrice;

// //           return {
// //             productId: product._id,
// //             quantity: p.quantity,
// //             isSpicy: p.isSpicy || false,
// //             additions: p.additions || [],
// //             notes: p.notes || "",
// //             selectedProtein: p.selectedProtein || null,
// //             selectedType: p.selectedType || null,
// //             priceAtPurchase, // ✅
// //           };
// //         }),
// //         totalPrice: orderSummary.total, // ✅
// //         userId: user?._id,
// //         shippingAddress: formState.selectedArea?._id || null,
// //         orderType: formState.orderType,
// //         userDetails: formState.details,
// //         paymentMethod: "orange_money",
// //       };

// //       const result = await rtpOtpConfirm({
// //         phone: formState.orangePhone,
// //         amount: orderSummary.total,
// //         servicerCode: formState.orangeServicerCode,
// //         merchantReference: formState.orangeMerchantReference,
// //         otp: formState.otp,
// //         orderData,
// //       });

// //       toast.success("تم الدفع بنجاح!");
// //       navigate(`/success?dbOrderId=${result?.orderId}`);
// //     } catch (error) {
// //       toast.error(error.message || "فشل التحقق");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [cart, user, orderSummary, formState, navigate]);
// //   // Main payment handler
// //   const handlePayment = useCallback(
// //     async (e) => {
// //       e.preventDefault();

// //       const validation = validateOrder({ cart, formState, isTestMode });
// //       if (!validation.isValid) {
// //         validation.errors.forEach((err) => toast.error(t(err) || err));
// //         return;
// //       }

// //       if (formState.paymentMethod === PAYMENT_METHODS.CLIQ) {
// //         await handleZainCashFlow();
// //         return;
// //       }

// //       if (formState.paymentMethod === PAYMENT_METHODS.ORANGE_MONEY) {
// //         await handleOrangeMoneyFlow();
// //         return;
// //       }

// //       setIsSubmitting(true);
// //       try {
// //         await handleMontyPayFlow();
// //       } catch (err) {
// //         toast.error(err.message || t(VALIDATION_KEYS.CHECKOUT_FAILED));
// //       } finally {
// //         setIsSubmitting(false);
// //       }
// //     },
// //     [
// //       cart,
// //       formState,
// //       isTestMode,
// //       t,
// //       handleZainCashFlow,
// //       handleOrangeMoneyFlow,
// //       handleMontyPayFlow,
// //     ],
// //   );

// //   return {
// //     areas,
// //     orangeServicers,
// //     orderSummary,
// //     formState,
// //     isLoading,
// //     isSubmitting,
// //     isTestMode,
// //     error,
// //     updateForm,
// //     updateDetails,
// //     handlePayment,
// //     // CliQ
// //     sendCliqOtp,
// //     confirmCliqPayment,
// //     // Orange Money
// //     sendOrangeOtp,
// //     confirmOrangePayment,
// //   };
// // };

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
//   ORANGE_STEPS,
//   PAYMENT_METHODS,
//   ORDER_TYPES,
//   VALIDATION_KEYS,
// } from "@/components/checkout/constants";
// import { validateOrder } from "@/utils/orderValidation";
// import { sanitizeAndValidateInput } from "@/utils/orderValidation";
// import PaymentService from "@/services/paymentService";
// import PromoService from "@/services/promoService";
// import {
//   getServicers,
//   rtpOtpValidate,
//   rtpOtpConfirm,
// } from "@/services/orangeMoneyService";

// export const useCheckoutLogic = (t) => {
//   const { cart } = useCart();
//   const { user } = useUser();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   // --- State ---
//   const [areas, setAreas] = useState([]);
//   const [orangeServicers, setOrangeServicers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   // ✅ Promo Code State
//   const [appliedPromo, setAppliedPromo] = useState(null); // { code, discountPercentage }
//   const [isPromoChecking, setIsPromoChecking] = useState(false);

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

//   // --- Price Calculation Engine ---
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

//     // ✅ Promo Code Discount (applied on product subtotal, not delivery)
//     const promoDiscountPercentage = appliedPromo?.discountPercentage || 0;
//     const promoDiscountAmount = isTestMode
//       ? 0
//       : (finalSubtotal * promoDiscountPercentage) / 100;

//     const totalBeforePromo = finalSubtotal + deliveryCost;
//     const finalTotal = isTestMode
//       ? TEST_MODE_DEFAULTS.TOTAL_AMOUNT
//       : Math.max(totalBeforePromo - promoDiscountAmount, 0);

//     return {
//       subtotal: finalSubtotal,
//       originalSubtotal,
//       savings: originalSubtotal - finalSubtotal,
//       deliveryCost,
//       totalAdditions,
//       promoCode: appliedPromo?.code || null,
//       promoDiscountPercentage,
//       promoDiscountAmount,
//       total: finalTotal,
//     };
//   }, [
//     cart.products,
//     formState.orderType,
//     formState.selectedArea,
//     isTestMode,
//     appliedPromo,
//   ]);

//   // --- Effects ---

//   useEffect(() => {
//     if (isTestMode) {
//       setFormState((prev) => ({
//         ...prev,
//         orderType: TEST_MODE_DEFAULTS.ORDER_TYPE,
//         details: { ...prev.details, name: TEST_MODE_DEFAULTS.NAME },
//       }));
//     } else if (!cart.products?.length) {
//       navigate("/products");
//     }
//   }, [isTestMode, cart.products, navigate]);

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

//   useEffect(() => {
//     const fetchServicers = async () => {
//       try {
//         const data = await getServicers();
//         setOrangeServicers(Array.isArray(data) ? data : []);
//       } catch (e) {
//         console.error("Servicers fetch error:", e);
//         setOrangeServicers([]);
//       }
//     };
//     fetchServicers();
//   }, []);

//   // --- Handlers ---

//   const updateForm = useCallback((field, value) => {
//     setFormState((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   const updateDetails = useCallback((field, value) => {
//     const sanitizedValue = sanitizeAndValidateInput(field, value);
//     setFormState((prev) => ({
//       ...prev,
//       details: { ...prev.details, [field]: sanitizedValue },
//     }));
//   }, []);

//   // ✅ Promo Code Handlers
//   const applyPromoCode = useCallback(
//     async (code) => {
//       if (isTestMode) {
//         toast.error(
//           t("promo_not_allowed_test") || "لا يمكن استخدام كود خصم بوضع التجربة",
//         );
//         return;
//       }
//       setIsPromoChecking(true);
//       try {
//         const data = await PromoService.validatePromoCode(code);
//         if (!data || !data.isActive) {
//           throw new Error(t("promo_invalid") || "الكود غير صالح");
//         }
//         setAppliedPromo({
//           code: data.code,
//           discountPercentage: data.discountPercentage,
//         });
//         toast.success(t("promo_applied") || "تم تطبيق الكود بنجاح");
//       } catch (err) {
//         const message =
//           err?.response?.data?.message ||
//           err.message ||
//           t("promo_invalid") ||
//           "الكود غير صالح";
//         toast.error(message);
//         throw new Error(message);
//       } finally {
//         setIsPromoChecking(false);
//       }
//     },
//     [isTestMode, t],
//   );

//   const removePromoCode = useCallback(() => {
//     setAppliedPromo(null);
//   }, []);

//   const handleMontyPayFlow = useCallback(async () => {
//     const redirectUrl = await PaymentService.montyPay({
//       cart,
//       formState,
//       user,
//       orderSummary,
//       isTestMode,
//       promoCode: appliedPromo?.code || null, // ✅
//     });
//     window.location.href = redirectUrl;
//   }, [cart, formState, user, orderSummary, isTestMode, appliedPromo]);

//   // CliQ handlers
//   const handleZainCashFlow = useCallback(async () => {
//     setFormState((prev) => ({
//       ...prev,
//       cliqStep: CLIQ_STEPS.PHONE_INPUT,
//       cliqPhone: "",
//     }));
//   }, []);

//   const sendCliqOtp = useCallback(async () => {
//     setIsSubmitting(true);
//     try {
//       await PaymentService.zainCash.initiate({
//         orderSummary,
//         phone: formState.cliqPhone,
//       });
//       setFormState((prev) => ({ ...prev, cliqStep: CLIQ_STEPS.OTP_SENT }));
//       toast.success("تم إرسال OTP على " + formState.cliqPhone);
//     } catch (error) {
//       toast.error(error.message || "فشل إرسال OTP");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [orderSummary, formState.cliqPhone]);

//   const confirmCliqPayment = useCallback(async () => {
//     setIsSubmitting(true);
//     try {
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
//         promoCode: appliedPromo?.code || null, // ✅
//         discountAmount: orderSummary.promoDiscountAmount || 0, // ✅
//         totalPrice: orderSummary.total, // ✅
//       };

//       const result = await PaymentService.zainCash.confirm({
//         orderSummary,
//         phone: formState.cliqPhone,
//         otp: formState.otp,
//         orderId: formState.orderId || null,
//         orderData,
//       });

//       toast.success("تم الدفع بنجاح!");
//       navigate(`/success?dbOrderId=${result?.orderId}`);
//     } catch (error) {
//       toast.error(error.message || "فشل التحقق");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [cart, user, orderSummary, formState, navigate, appliedPromo]);

//   // Orange Money handlers

//   const handleOrangeMoneyFlow = useCallback(async () => {
//     setFormState((prev) => ({
//       ...prev,
//       orangeStep: ORANGE_STEPS.SELECT_BANK,
//       orangePhone: "",
//       orangeServicerCode: "",
//       orangeMerchantReference: "",
//     }));
//   }, []);

//   const sendOrangeOtp = useCallback(async () => {
//     if (!formState.orangePhone || !formState.orangeServicerCode) {
//       toast.error("أدخل رقم التلفون واختر البنك");
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const result = await rtpOtpValidate({
//         phone: formState.orangePhone,
//         amount: orderSummary.total,
//         servicerCode: formState.orangeServicerCode,
//       });

//       setFormState((prev) => ({
//         ...prev,
//         orangeStep: ORANGE_STEPS.OTP_SENT,
//         orangeMerchantReference: result.merchantReference,
//       }));
//       toast.success("تم إرسال OTP على رقمك");
//     } catch (error) {
//       toast.error(error.message || "فشل إرسال OTP");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [formState.orangePhone, formState.orangeServicerCode, orderSummary.total]);

//   const confirmOrangePayment = useCallback(async () => {
//     setIsSubmitting(true);
//     try {
//       const orderData = {
//         products: cart.products.map((p) => {
//           const product = p.productId;
//           let basePrice = Number(product.basePrice || 0);

//           if (product.prices) {
//             if (p.selectedProtein && p.selectedType) {
//               basePrice =
//                 product.prices[p.selectedProtein]?.[p.selectedType] ??
//                 basePrice;
//             } else if (p.selectedProtein) {
//               basePrice = product.prices[p.selectedProtein] ?? basePrice;
//             } else if (p.selectedType) {
//               basePrice = product.prices[p.selectedType] ?? basePrice;
//             }
//           }

//           const discount = Number(product.discount || 0);
//           const priceAtPurchase =
//             discount > 0
//               ? basePrice - (basePrice * discount) / 100
//               : basePrice;

//           return {
//             productId: product._id,
//             quantity: p.quantity,
//             isSpicy: p.isSpicy || false,
//             additions: p.additions || [],
//             notes: p.notes || "",
//             selectedProtein: p.selectedProtein || null,
//             selectedType: p.selectedType || null,
//             priceAtPurchase,
//           };
//         }),
//         totalPrice: orderSummary.total,
//         userId: user?._id,
//         shippingAddress: formState.selectedArea?._id || null,
//         orderType: formState.orderType,
//         userDetails: formState.details,
//         paymentMethod: "orange_money",
//         promoCode: appliedPromo?.code || null, // ✅
//         discountAmount: orderSummary.promoDiscountAmount || 0, // ✅
//       };

//       const result = await rtpOtpConfirm({
//         phone: formState.orangePhone,
//         amount: orderSummary.total,
//         servicerCode: formState.orangeServicerCode,
//         merchantReference: formState.orangeMerchantReference,
//         otp: formState.otp,
//         orderData,
//       });

//       toast.success("تم الدفع بنجاح!");
//       navigate(`/success?dbOrderId=${result?.orderId}`);
//     } catch (error) {
//       toast.error(error.message || "فشل التحقق");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [cart, user, orderSummary, formState, navigate, appliedPromo]);

//   // Main payment handler
//   const handlePayment = useCallback(
//     async (e) => {
//       e.preventDefault();

//       const validation = validateOrder({ cart, formState, isTestMode });
//       if (!validation.isValid) {
//         validation.errors.forEach((err) => toast.error(t(err) || err));
//         return;
//       }

//       if (formState.paymentMethod === PAYMENT_METHODS.CLIQ) {
//         await handleZainCashFlow();
//         return;
//       }

//       if (formState.paymentMethod === PAYMENT_METHODS.ORANGE_MONEY) {
//         await handleOrangeMoneyFlow();
//         return;
//       }

//       setIsSubmitting(true);
//       try {
//         await handleMontyPayFlow();
//       } catch (err) {
//         toast.error(err.message || t(VALIDATION_KEYS.CHECKOUT_FAILED));
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [
//       cart,
//       formState,
//       isTestMode,
//       t,
//       handleZainCashFlow,
//       handleOrangeMoneyFlow,
//       handleMontyPayFlow,
//     ],
//   );

//   return {
//     areas,
//     orangeServicers,
//     orderSummary,
//     formState,
//     isLoading,
//     isSubmitting,
//     isTestMode,
//     error,
//     updateForm,
//     updateDetails,
//     handlePayment,
//     // CliQ
//     sendCliqOtp,
//     confirmCliqPayment,
//     // Orange Money
//     sendOrangeOtp,
//     confirmOrangePayment,
//     // ✅ Promo Code
//     appliedPromo,
//     isPromoChecking,
//     applyPromoCode,
//     removePromoCode,
//   };
// };


// للبرمو عدد

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
//   ORANGE_STEPS,
//   PAYMENT_METHODS,
//   ORDER_TYPES,
//   VALIDATION_KEYS,
// } from "@/components/checkout/constants";
// import { validateOrder } from "@/utils/orderValidation";
// import { sanitizeAndValidateInput } from "@/utils/orderValidation";
// import PaymentService from "@/services/paymentService";
// import PromoService from "@/services/promoService";
// import {
//   getServicers,
//   rtpOtpValidate,
//   rtpOtpConfirm,
// } from "@/services/orangeMoneyService";

// export const useCheckoutLogic = (t) => {
//   const { cart } = useCart();
//   const { user } = useUser();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   // --- State ---
//   const [areas, setAreas] = useState([]);
//   const [orangeServicers, setOrangeServicers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   // ✅ Promo Code State
//   const [appliedPromo, setAppliedPromo] = useState(null); // { code, discountPercentage }
//   const [isPromoChecking, setIsPromoChecking] = useState(false);

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

//   // --- Price Calculation Engine ---
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

//     // ✅ Promo Code Discount (applied on product subtotal, not delivery)
//     const promoDiscountPercentage = appliedPromo?.discountPercentage || 0;
//     const promoDiscountAmount = isTestMode
//       ? 0
//       : (finalSubtotal * promoDiscountPercentage) / 100;

//     const totalBeforePromo = finalSubtotal + deliveryCost;
//     const finalTotal = isTestMode
//       ? TEST_MODE_DEFAULTS.TOTAL_AMOUNT
//       : Math.max(totalBeforePromo - promoDiscountAmount, 0);

//     return {
//       subtotal: finalSubtotal,
//       originalSubtotal,
//       savings: originalSubtotal - finalSubtotal,
//       deliveryCost,
//       totalAdditions,
//       promoCode: appliedPromo?.code || null,
//       promoDiscountPercentage,
//       promoDiscountAmount,
//       total: finalTotal,
//     };
//   }, [
//     cart.products,
//     formState.orderType,
//     formState.selectedArea,
//     isTestMode,
//     appliedPromo,
//   ]);

//   // --- Effects ---

//   useEffect(() => {
//     if (isTestMode) {
//       setFormState((prev) => ({
//         ...prev,
//         orderType: TEST_MODE_DEFAULTS.ORDER_TYPE,
//         details: { ...prev.details, name: TEST_MODE_DEFAULTS.NAME },
//       }));
//     } else if (!cart.products?.length) {
//       navigate("/products");
//     }
//   }, [isTestMode, cart.products, navigate]);

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

//   useEffect(() => {
//     const fetchServicers = async () => {
//       try {
//         const data = await getServicers();
//         setOrangeServicers(Array.isArray(data) ? data : []);
//       } catch (e) {
//         console.error("Servicers fetch error:", e);
//         setOrangeServicers([]);
//       }
//     };
//     fetchServicers();
//   }, []);

//   // --- Handlers ---

//   const updateForm = useCallback((field, value) => {
//     setFormState((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   const updateDetails = useCallback((field, value) => {
//     const sanitizedValue = sanitizeAndValidateInput(field, value);
//     setFormState((prev) => ({
//       ...prev,
//       details: { ...prev.details, [field]: sanitizedValue },
//     }));
//   }, []);

//   // ✅ Promo Code Handlers — التحقق يحتاج توكن المستخدم عشان السيرفر
//   // يعرف مين هو ويحسب قديش استخدم هالكود قبل هيك (الحد الأقصى للاستخدام)
//   const applyPromoCode = useCallback(
//     async (code) => {
//       if (isTestMode) {
//         const message =
//           t("promo_not_allowed_test") ||
//           "لا يمكن استخدام كود خصم بوضع التجربة";
//         toast.error(message);
//         return;
//       }
//       if (!user?.token) {
//         const message =
//           t("login_required_for_promo") ||
//           "الرجاء تسجيل الدخول لاستخدام كود الخصم";
//         toast.error(message);
//         throw new Error(message);
//       }
//       setIsPromoChecking(true);
//       try {
//         const data = await PromoService.validatePromoCode(code, user.token);
//         if (!data || !data.isActive) {
//           throw new Error(t("promo_invalid") || "الكود غير صالح");
//         }
//         setAppliedPromo({
//           code: data.code,
//           discountPercentage: data.discountPercentage,
//         });
//         toast.success(t("promo_applied") || "تم تطبيق الكود بنجاح");
//       } catch (err) {
//         // ✅ رسالة السيرفر (متل "تجاوزت الحد المسموح") بتوصل هون مباشرة
//         const message =
//           err?.response?.data?.message ||
//           err.message ||
//           t("promo_invalid") ||
//           "الكود غير صالح";
//         toast.error(message);
//         throw new Error(message);
//       } finally {
//         setIsPromoChecking(false);
//       }
//     },
//     [isTestMode, t, user?.token],
//   );

//   const removePromoCode = useCallback(() => {
//     setAppliedPromo(null);
//   }, []);

//   const handleMontyPayFlow = useCallback(async () => {
//     const redirectUrl = await PaymentService.montyPay({
//       cart,
//       formState,
//       user,
//       orderSummary,
//       isTestMode,
//       promoCode: appliedPromo?.code || null,
//     });
//     window.location.href = redirectUrl;
//   }, [cart, formState, user, orderSummary, isTestMode, appliedPromo]);

//   // CliQ handlers
//   const handleZainCashFlow = useCallback(async () => {
//     setFormState((prev) => ({
//       ...prev,
//       cliqStep: CLIQ_STEPS.PHONE_INPUT,
//       cliqPhone: "",
//     }));
//   }, []);

//   const sendCliqOtp = useCallback(async () => {
//     setIsSubmitting(true);
//     try {
//       await PaymentService.zainCash.initiate({
//         orderSummary,
//         phone: formState.cliqPhone,
//       });
//       setFormState((prev) => ({ ...prev, cliqStep: CLIQ_STEPS.OTP_SENT }));
//       toast.success("تم إرسال OTP على " + formState.cliqPhone);
//     } catch (error) {
//       toast.error(error.message || "فشل إرسال OTP");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [orderSummary, formState.cliqPhone]);

//   const confirmCliqPayment = useCallback(async () => {
//     setIsSubmitting(true);
//     try {
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
//         promoCode: appliedPromo?.code || null,
//         discountAmount: orderSummary.promoDiscountAmount || 0,
//         totalPrice: orderSummary.total,
//       };

//       const result = await PaymentService.zainCash.confirm({
//         orderSummary,
//         phone: formState.cliqPhone,
//         otp: formState.otp,
//         orderId: formState.orderId || null,
//         orderData,
//       });

//       toast.success("تم الدفع بنجاح!");
//       navigate(`/success?dbOrderId=${result?.orderId}`);
//     } catch (error) {
//       toast.error(error.message || "فشل التحقق");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [cart, user, orderSummary, formState, navigate, appliedPromo]);

//   // Orange Money handlers

//   const handleOrangeMoneyFlow = useCallback(async () => {
//     setFormState((prev) => ({
//       ...prev,
//       orangeStep: ORANGE_STEPS.SELECT_BANK,
//       orangePhone: "",
//       orangeServicerCode: "",
//       orangeMerchantReference: "",
//     }));
//   }, []);

//   const sendOrangeOtp = useCallback(async () => {
//     if (!formState.orangePhone || !formState.orangeServicerCode) {
//       toast.error("أدخل رقم التلفون واختر البنك");
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const result = await rtpOtpValidate({
//         phone: formState.orangePhone,
//         amount: orderSummary.total,
//         servicerCode: formState.orangeServicerCode,
//       });

//       setFormState((prev) => ({
//         ...prev,
//         orangeStep: ORANGE_STEPS.OTP_SENT,
//         orangeMerchantReference: result.merchantReference,
//       }));
//       toast.success("تم إرسال OTP على رقمك");
//     } catch (error) {
//       toast.error(error.message || "فشل إرسال OTP");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [formState.orangePhone, formState.orangeServicerCode, orderSummary.total]);

//   const confirmOrangePayment = useCallback(async () => {
//     setIsSubmitting(true);
//     try {
//       const orderData = {
//         products: cart.products.map((p) => {
//           const product = p.productId;
//           let basePrice = Number(product.basePrice || 0);

//           if (product.prices) {
//             if (p.selectedProtein && p.selectedType) {
//               basePrice =
//                 product.prices[p.selectedProtein]?.[p.selectedType] ??
//                 basePrice;
//             } else if (p.selectedProtein) {
//               basePrice = product.prices[p.selectedProtein] ?? basePrice;
//             } else if (p.selectedType) {
//               basePrice = product.prices[p.selectedType] ?? basePrice;
//             }
//           }

//           const discount = Number(product.discount || 0);
//           const priceAtPurchase =
//             discount > 0
//               ? basePrice - (basePrice * discount) / 100
//               : basePrice;

//           return {
//             productId: product._id,
//             quantity: p.quantity,
//             isSpicy: p.isSpicy || false,
//             additions: p.additions || [],
//             notes: p.notes || "",
//             selectedProtein: p.selectedProtein || null,
//             selectedType: p.selectedType || null,
//             priceAtPurchase,
//           };
//         }),
//         totalPrice: orderSummary.total,
//         userId: user?._id,
//         shippingAddress: formState.selectedArea?._id || null,
//         orderType: formState.orderType,
//         userDetails: formState.details,
//         paymentMethod: "orange_money",
//         promoCode: appliedPromo?.code || null,
//         discountAmount: orderSummary.promoDiscountAmount || 0,
//       };

//       const result = await rtpOtpConfirm({
//         phone: formState.orangePhone,
//         amount: orderSummary.total,
//         servicerCode: formState.orangeServicerCode,
//         merchantReference: formState.orangeMerchantReference,
//         otp: formState.otp,
//         orderData,
//       });

//       toast.success("تم الدفع بنجاح!");
//       navigate(`/success?dbOrderId=${result?.orderId}`);
//     } catch (error) {
//       toast.error(error.message || "فشل التحقق");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [cart, user, orderSummary, formState, navigate, appliedPromo]);

//   // Main payment handler
//   const handlePayment = useCallback(
//     async (e) => {
//       e.preventDefault();

//       const validation = validateOrder({ cart, formState, isTestMode });
//       if (!validation.isValid) {
//         validation.errors.forEach((err) => toast.error(t(err) || err));
//         return;
//       }

//       if (formState.paymentMethod === PAYMENT_METHODS.CLIQ) {
//         await handleZainCashFlow();
//         return;
//       }

//       if (formState.paymentMethod === PAYMENT_METHODS.ORANGE_MONEY) {
//         await handleOrangeMoneyFlow();
//         return;
//       }

//       setIsSubmitting(true);
//       try {
//         await handleMontyPayFlow();
//       } catch (err) {
//         toast.error(err.message || t(VALIDATION_KEYS.CHECKOUT_FAILED));
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [
//       cart,
//       formState,
//       isTestMode,
//       t,
//       handleZainCashFlow,
//       handleOrangeMoneyFlow,
//       handleMontyPayFlow,
//     ],
//   );

//   return {
//     areas,
//     orangeServicers,
//     orderSummary,
//     formState,
//     isLoading,
//     isSubmitting,
//     isTestMode,
//     error,
//     updateForm,
//     updateDetails,
//     handlePayment,
//     // CliQ
//     sendCliqOtp,
//     confirmCliqPayment,
//     // Orange Money
//     sendOrangeOtp,
//     confirmOrangePayment,
//     // ✅ Promo Code
//     appliedPromo,
//     isPromoChecking,
//     applyPromoCode,
//     removePromoCode,
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
import PromoService from "@/services/promoService";
import {
  getServicers,
  rtpOtpValidate,
  rtpOtpConfirm,
} from "@/services/orangeMoneyService";

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

  // ✅ Promo Code State (تم إبقاء الهيكل وتحديثه ليشمل المعرف _id عند التحقق)
  const [appliedPromo, setAppliedPromo] = useState(null); // { _id, code, discountPercentage }
  const [isPromoChecking, setIsPromoChecking] = useState(false);

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
      const {
        productId,
        additions = [],
        quantity,
        selectedProtein,
        selectedType,
      } = item;
      let basePrice = Number(productId.basePrice || 0);

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
      totalAdditions += additionsCost * quantity;
    });

    const deliveryCost =
      formState.orderType === ORDER_TYPES.DELIVERY
        ? formState.selectedArea?.deliveryCost || 0
        : 0;

    // ✅ Promo Code Discount (applied on product subtotal, not delivery)
    const promoDiscountPercentage = appliedPromo?.discountPercentage || 0;
    const promoDiscountAmount = isTestMode
      ? 0
      : (finalSubtotal * promoDiscountPercentage) / 100;

    const totalBeforePromo = finalSubtotal + deliveryCost;
    const finalTotal = isTestMode
      ? TEST_MODE_DEFAULTS.TOTAL_AMOUNT
      : Math.max(totalBeforePromo - promoDiscountAmount, 0);

    return {
      subtotal: finalSubtotal,
      originalSubtotal,
      savings: originalSubtotal - finalSubtotal,
      deliveryCost,
      totalAdditions,
      promoCode: appliedPromo?.code || null,
      promoDiscountPercentage,
      promoDiscountAmount,
      total: finalTotal,
    };
  }, [
    cart.products,
    formState.orderType,
    formState.selectedArea,
    isTestMode,
    appliedPromo,
  ]);

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

  // ✅ تطبيق كود الخصم - تم تعديله ليحفظ الـ _id الراجع من السيرفر
  const applyPromoCode = useCallback(
    async (code) => {
      if (isTestMode) {
        const message =
          t("promo_not_allowed_test") ||
          "لا يمكن استخدام كود خصم بوضع التجربة";
        toast.error(message);
        return;
      }
      if (!user?.token) {
        const message =
          t("login_required_for_promo") ||
          "الرجاء تسجيل الدخول لاستخدام كود الخصم";
        toast.error(message);
        throw new Error(message);
      }
      setIsPromoChecking(true);
      try {
        const data = await PromoService.validatePromoCode(code, user.token);
        if (!data || !data.isActive) {
          throw new Error(t("promo_invalid") || "الكود غير صالح");
        }
        
        // تعديل لحفظ الـ ID من قاعدة البيانات لاستعماله في الطلب
        setAppliedPromo({
          _id: data._id || null, 
          code: data.code,
          discountPercentage: data.discountPercentage,
        });
        toast.success(t("promo_applied") || "تم تطبيق الكود بنجاح");
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          t("promo_invalid") ||
          "الكود غير صالح";
        toast.error(message);
        throw new Error(message);
      } finally {
        setIsPromoChecking(false);
      }
    },
    [isTestMode, t, user?.token],
  );

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  // ✅ تعديل تدفق الدفع لـ MontyPay لإرسال الـ promoCode والـ ID والخصم
  const handleMontyPayFlow = useCallback(async () => {
    const redirectUrl = await PaymentService.montyPay({
      cart,
      formState,
      user,
      orderSummary,
      isTestMode,
      promoCode: appliedPromo?.code || null,
      promoCodeId: appliedPromo?._id || null, // تمرير الـ _id للسيرفر
      discountAmount: orderSummary.promoDiscountAmount || 0,
    });
    window.location.href = redirectUrl;
  }, [cart, formState, user, orderSummary, isTestMode, appliedPromo]);

  // CliQ handlers
  const handleZainCashFlow = useCallback(async () => {
    setFormState((prev) => ({
      ...prev,
      cliqStep: CLIQ_STEPS.PHONE_INPUT,
      cliqPhone: "",
    }));
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

  // ✅ تعديل كود الدفع لـ CliQ ليمرر الـ ID الخاص بالبروموكود
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
        // يرسل الـ _id أولاً، وإذا لم يتوفر يرسل الـ code النصي
        promoCode: appliedPromo?._id || appliedPromo?.code || null, 
        discountAmount: orderSummary.promoDiscountAmount || 0,
        totalPrice: orderSummary.total,
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
  }, [cart, user, orderSummary, formState, navigate, appliedPromo]);

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

  // ✅ تعديل كود الدفع لـ Orange Money ليمرر الـ ID الخاص بالبروموكود
  const confirmOrangePayment = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
        products: cart.products.map((p) => {
          const product = p.productId;
          let basePrice = Number(product.basePrice || 0);

          if (product.prices) {
            if (p.selectedProtein && p.selectedType) {
              basePrice =
                product.prices[p.selectedProtein]?.[p.selectedType] ??
                basePrice;
            } else if (p.selectedProtein) {
              basePrice = product.prices[p.selectedProtein] ?? basePrice;
            } else if (p.selectedType) {
              basePrice = product.prices[p.selectedType] ?? basePrice;
            }
          }

          const discount = Number(product.discount || 0);
          const priceAtPurchase =
            discount > 0
              ? basePrice - (basePrice * discount) / 100
              : basePrice;

          return {
            productId: product._id,
            quantity: p.quantity,
            isSpicy: p.isSpicy || false,
            additions: p.additions || [],
            notes: p.notes || "",
            selectedProtein: p.selectedProtein || null,
            selectedType: p.selectedType || null,
            priceAtPurchase,
          };
        }),
        totalPrice: orderSummary.total,
        userId: user?._id,
        shippingAddress: formState.selectedArea?._id || null,
        orderType: formState.orderType,
        userDetails: formState.details,
        paymentMethod: "orange_money",
        // يرسل الـ _id أولاً، وإذا لم يتوفر يرسل الـ code النصي
        promoCode: appliedPromo?._id || appliedPromo?.code || null,
        discountAmount: orderSummary.promoDiscountAmount || 0,
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
  }, [cart, user, orderSummary, formState, navigate, appliedPromo]);

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
    [
      cart,
      formState,
      isTestMode,
      t,
      handleZainCashFlow,
      handleOrangeMoneyFlow,
      handleMontyPayFlow,
    ],
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
    // ✅ Promo Code
    appliedPromo,
    isPromoChecking,
    applyPromoCode,
    removePromoCode,
  };
};
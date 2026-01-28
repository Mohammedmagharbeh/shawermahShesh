import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import axios from "axios";

const TEST_PRODUCT_ID = "696f8dadfa26824a3b34e5af";
const API_URL = import.meta.env.VITE_BASE_URL; // Centralized Env Var

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
  
  const [formState, setFormState] = useState({
    orderType: "delivery",
    paymentMethod: "card",
    selectedArea: null,
    otp: "",
    cliqStep: "INIT", // INIT | OTP_SENT | PAID
    details: {
      name: user?.name || "",
      apartment: "",
      phone: user?.phone || "",
    }
  });

  // --- Derived State (Test Mode) ---
  const isTestMode = useMemo(() => {
    const hasTestProduct = cart.products.some((p) => (p.productId._id || p.productId) === TEST_PRODUCT_ID);
    return searchParams.get("test") === "1" || hasTestProduct;
  }, [cart.products, searchParams]);

  // --- Price Calculation Engine ---
  const orderSummary = useMemo(() => {
    let originalSubtotal = 0;
    let finalSubtotal = 0;

    cart.products.forEach((item) => {
      const { productId, additions, quantity, selectedProtein, selectedType } = item;
      let basePrice = Number(productId.basePrice || 0);

      // Handle Matrix Pricing
      if (productId.prices) {
        if (selectedProtein && selectedType) basePrice = productId.prices[selectedProtein]?.[selectedType] ?? basePrice;
        else if (selectedProtein) basePrice = productId.prices[selectedProtein] ?? basePrice;
        else if (selectedType) basePrice = productId.prices[selectedType] ?? basePrice;
      }

      const additionsCost = additions.reduce((sum, add) => sum + Number(add.price || 0), 0);
      const discountAmount = (basePrice * (Number(productId.discount || 0))) / 100;

      originalSubtotal += (basePrice + additionsCost) * quantity;
      finalSubtotal += ((basePrice - discountAmount) + additionsCost) * quantity;
    });

    const deliveryCost = formState.orderType === "delivery" ? (formState.selectedArea?.deliveryCost || 0) : 0;

    return {
      subtotal: finalSubtotal,
      originalSubtotal,
      savings: originalSubtotal - finalSubtotal,
      deliveryCost,
      total: isTestMode ? 1 : finalSubtotal + deliveryCost
    };
  }, [cart.products, formState.orderType, formState.selectedArea, isTestMode]);

  // --- Effects ---
  useEffect(() => {
    if (isTestMode) {
      setFormState(prev => ({ ...prev, orderType: "pickup", details: { ...prev.details, name: "MONTYPAY TESTER" } }));
    } else if (!cart.products?.length) {
      navigate("/products");
    }
  }, [isTestMode, cart, navigate]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/locations/get`, {
          headers: { authorization: `Bearer ${user.token}` }
        });
        setAreas(data.locations);
      } catch (e) {
        console.error("Loc Error", e);
        setError(t("checkout_fetch_area_error"));
      } finally {
        setIsLoading(false);
      }
    };
    if (user.token) fetchAreas();
  }, [user.token, t]);

  // --- Handlers ---
  const updateForm = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const updateDetails = (field, value) => {
    setFormState(prev => ({ ...prev, details: { ...prev.details, [field]: value } }));
  };

  // --- Payment Logic ---
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validateOrder()) return;

    setIsSubmitting(true);
    
    try {
      if (formState.paymentMethod === "cliq") {
        await handleZainCashFlow();
      } else {
        await handleMontyPayFlow();
      }
    } catch (err) {
      console.error(err);
      toast.error(t("checkout_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateOrder = () => {
    if (cart.products.length === 0 && !isTestMode) return toast.error(t("checkout_cart_empty"));
    if (!formState.selectedArea?._id && formState.orderType === "delivery" && !isTestMode) return toast.error(t("checkout_select_area"));
    return true;
  };

  const handleMontyPayFlow = async () => {
    const now = new Date();
    const sessionId = `${now.getDate()}${now.getMonth() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const payload = {
      amount: orderSummary.total,
      customerName: formState.details.name,
      customerEmail: user?.email || "test@example.com",
      orderId: sessionId,
      description: isTestMode ? "Test" : cart.products.map(p => p.productId.name.ar).join(" / "),
    };

    // Save pending order
    sessionStorage.setItem("pendingOrder", JSON.stringify({
      products: cart.products.map(p => ({
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
      isTest: isTestMode
    }));

    const { data } = await axios.post(`${API_URL}/montypay/session`, payload);
    
    if (data.redirect_url) window.location.href = data.redirect_url;
    else throw new Error("No redirect URL");
  };

  const handleZainCashFlow = async () => {
    // Note: Assuming logic from original code regarding "initiate" vs "confirm"
    await axios.post(`http://localhost:5000/api/zaincash/zain/initiate`, {
      amount: orderSummary.total.toFixed(3),
      mobile: `962799635582`, // Kept hardcoded as per original, strictly should be dynamic
    });
    setFormState(prev => ({ ...prev, cliqStep: "OTP_SENT" }));
    toast.success("OTP sent");
  };

  const confirmCliqPayment = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`http://localhost:5000/api/zaincash/zain/confirm`, {
        amount: orderSummary.total.toFixed(3),
        mobile: formState.details.phone,
        otp: formState.otp,
      });

      if (data?.ErrorObj?.ErrorCode === "0") {
        navigate("/order-success");
      } else {
        toast.error(data?.ErrorObj?.ErrorMessage || "Payment failed");
      }
    } catch (e) {
      toast.error("Verification Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    areas, isLoading, error, isSubmitting, isTestMode,
    formState, updateForm, updateDetails, confirmCliqPayment,
    orderSummary, handlePayment
  };
};
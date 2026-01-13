import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useOrder } from "@/contexts/OrderContext";
import { useCart } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";

// Helper to format cart items for order creation
const formatOrderProducts = (products) => {
  if (!products) return [];
  return products.map((p) => ({
    productId: p.productId?._id || p.productId,
    quantity: p.quantity,
    isSpicy: p.isSpicy || false,
    notes: p.notes || "",
    additions: p.additions || [],
    selectedProtein: p.selectedProtein || null,
    selectedType: p.selectedType || null,
  }));
};

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { createOrder } = useOrder();
  const { clearCart } = useCart();
  const { t } = useTranslation();
  const { user } = useUser();
  const selectedLanguage = localStorage.getItem("i18nextLng");

  const [state, setState] = useState({
    loading: true,
    error: "",
    status: "",
    paymentRef: "",
  });

  const isVerifying = useRef(false);

  useEffect(() => {
    // 1. Get Order ID from URL Query Params (set in montyPay.js success_url)
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");

    if (!orderId) {
      const errorMsg = t("missing_payment_reference");
      setState((prev) => ({ ...prev, loading: false, error: errorMsg }));
      toast.error(errorMsg);
      return;
    }

    if (isVerifying.current) return;
    isVerifying.current = true;

    const verifyPayment = async () => {
      try {
        // 2. Call MontyPay Status Endpoint
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/montypay/status`,
          { orderId },
          { headers: { "Content-Type": "application/json" } }
        );

        const data = res.data;
        // Valid success statuses from MontyPay docs: 'settled', 'success', 'completed'
        const validStatuses = ["settled", "success", "completed", "paid"];
        const isPaid = validStatuses.includes(data.status?.toLowerCase());

        setState((prev) => ({
          ...prev,
          paymentRef: data.payment_id || "",
          status: data.status,
        }));

        if (!isPaid) {
          throw new Error(data.reason || t("payment_verification_failed"));
        }

        // 3. Create/Update Order in Database
        await handleOrderCompletion(data.payment_id, orderId);

        setState((prev) => ({ ...prev, loading: false }));
      } catch (err) {
        console.error("Verification Error:", err);
        const errorMessage =
          err.response?.data?.details?.error_message ||
          err.message ||
          t("payment_failed");
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      }
    };

    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleOrderCompletion = async (paymentId, orderIdFromUrl) => {
    try {
      // Check if we have a pending order in sessionStorage
      const pendingOrderData = sessionStorage.getItem("pendingOrder");

      if (!pendingOrderData) {
        throw new Error("No pending order data found");
      }

      const orderData = JSON.parse(pendingOrderData);

      if (!orderData.userId || !user?._id) {
        throw new Error("User ID is missing");
      }

      // Create order after payment success
      await createOrder({
        products: formatOrderProducts(orderData.products),
        userId: orderData.userId,
        shippingAddress: orderData.shippingAddress,
        paymentStatus: "paid",
        paymentMethod: orderData.paymentMethod || "card",
        transactionId: paymentId,
        paidAt: new Date(),
        orderType: orderData.orderType,
        userDetails: orderData.userDetails,
        status: "Processing", // Set status to Processing since payment is successful
      });

      clearCart();
      sessionStorage.removeItem("pendingOrder");
      toast.success(t("order_placed_successfully"));
    } catch (error) {
      console.error("Order Creation Error:", error);
      throw new Error(t("order_creation_failed_try_again"));
    }
  };

  // --- UI RENDER ---

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-800">
            {t("verifying_payment")}...
          </h2>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center border border-red-100">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-500 text-3xl">
            ✕
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("payment_failed")}
          </h2>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            {t("try_again")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DA1030] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center ">
        <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-[#DA0103] text-[#FFC400] text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("payment_successful")}
        </h2>
        <p className="text-gray-600 mb-4">{t("thank_you_payment_confirmed")}</p>

        <div
          className={`bg-gray-50 rounded-lg p-4 mb-6 text-sm ${selectedLanguage === "ar" ? "rtl" : "ltr"}`}
        >
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">{t("status")}</span>
            <span className="font-medium text-green-600 uppercase">
              {state.status}
            </span>
          </div>
          {state.paymentRef && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t("invoice_id")}:</span>
              <span className="font-medium text-gray-900">
                {state.paymentRef}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/orders/${user?._id}`)}
            className="w-full py-3 rounded-lg bg-[#FFC400] text-balck hover:bg-[#DA0103] hover:text-white font-semibold transition"
          >
            {t("view_orders")}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
          >
            {t("continue_shopping")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;

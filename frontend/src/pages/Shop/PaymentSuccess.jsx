import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";

/**
 * PaymentSuccess — reads dbOrderId + orderRef from URL, then:
 * 1. Calls /montypay/verify to confirm the order (fallback if callback was delayed)
 * 2. Clears the cart
 * 3. Shows success UI
 *
 * The MontyPay server-to-server callback is the PRIMARY confirmation.
 * This verify call is a SAFETY NET in case it fires before the callback.
 */
function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { t } = useTranslation();
  const { user } = useUser();
  const selectedLanguage = localStorage.getItem("i18nextLng");

  const [dbOrderId, setDbOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const hasVerified = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("dbOrderId");
    const orderRef = params.get("orderRef");

    if (id) setDbOrderId(id);

    // Clear the cart — order is already in DB regardless of payment status
    clearCart();

    // Call /verify as fallback in case the MontyPay callback was delayed
    if (!hasVerified.current && id && orderRef) {
      hasVerified.current = true;

      axios
        .post(`${import.meta.env.VITE_BASE_URL}/montypay/verify`, {
          dbOrderId: id,
          orderRef: decodeURIComponent(orderRef),
        })
        .then((res) => {
          if (res.data?.success) {
            console.log(
              res.data.alreadyConfirmed
                ? "[PaymentSuccess] Order already confirmed by callback."
                : "[PaymentSuccess] Order confirmed via verify fallback."
            );
          }
        })
        .catch((err) => {
          console.error("[PaymentSuccess] Verify call failed:", err.message);
          // Non-fatal — the callback may still confirm it
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [location.search, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800">
            {t("verifying_payment")}...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DA1030] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-[#DA0103] text-[#FFC400] text-3xl">
          ✓
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("payment_successful")}
        </h2>
        <p className="text-gray-600 mb-4">{t("thank_you_payment_confirmed")}</p>

        {dbOrderId && (
          <div
            className={`bg-gray-50 rounded-lg p-4 mb-6 text-sm ${
              selectedLanguage === "ar" ? "rtl" : "ltr"
            }`}
          >
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-500">{t("invoice_id")}:</span>
              <span className="font-bold text-gray-900 text-xs break-all">
                {dbOrderId}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/orders/${user?._id}`)}
            className="w-full py-3 rounded-lg bg-[#FFC400] text-black hover:bg-[#DA0103] hover:text-white font-semibold transition"
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

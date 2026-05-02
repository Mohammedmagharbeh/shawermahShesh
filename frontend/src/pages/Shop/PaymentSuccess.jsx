import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";

/**
 * PaymentSuccess — display-only page.
 * The order was already created server-side before the user was redirected here.
 * The MontyPay server-to-server callback confirms the order (sets it to Confirmed + paid).
 * This page just clears the cart and shows a success UI.
 */
function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { t } = useTranslation();
  const { user } = useUser();
  const selectedLanguage = localStorage.getItem("i18nextLng");

  const [dbOrderId, setDbOrderId] = useState("");
  const cartCleared = useRef(false);

  useEffect(() => {
    // Extract the DB order ID embedded in the URL by the server
    const params = new URLSearchParams(location.search);
    const id = params.get("dbOrderId");
    if (id) setDbOrderId(id);

    // Clear the cart once (the order is already safely in the DB)
    if (!cartCleared.current) {
      cartCleared.current = true;
      clearCart();
    }
  }, [location.search, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DA1030] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Success icon */}
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

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { useOrder } from "@/contexts/OrderContext";
import { useCart } from "@/contexts/CartContext";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const { createOrder } = useOrder();

  const { clearCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentId = params.get("paymentId");

    if (!paymentId) {
      setError("Missing payment reference.");
      toast.error("Missing payment reference.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/myfatoorah/status`,
          { paymentId },
          { headers: { "Content-Type": "application/json" } }
        );

        const isSuccess = res.data?.IsSuccess;
        const data = res.data?.Data || {};
        const invoiceStatus = data?.InvoiceStatus || data?.TransactionStatus;
        setInvoiceId(data?.InvoiceId || "");
        setStatus(invoiceStatus || (isSuccess ? "Paid" : "Failed"));

        if (!isSuccess) {
          setError("Payment verification failed.");
          toast.error("Payment verification failed.");
        }

        try {
          const storedCart = JSON.parse(localStorage.getItem("pendingOrder"));

          if (!storedCart) {
            throw new Error("No pending order found in local storage.");
          }
          const user = JSON.parse(localStorage.getItem("user"));
          if (!user || !user._id) {
            throw new Error("User not found or not logged in.");
          }

          await createOrder({
            products: storedCart
              ? storedCart.products?.map((p) => ({
                  productId: p.productId._id,
                  quantity: p.quantity,
                }))
              : [],
            userId: user._id,
            shippingAddress: "68d860d988e6a681633f5147", // To-Do: replace with selected address ID
            paymentMethod: "card",
            paymentStatus: isSuccess ? "paid" : "unpaid",
            transactionId: paymentId,
            paidAt: isSuccess ? new Date() : null,
          });

          toast.success("Order placed successfully!");
          navigate("/");
          clearCart();
          localStorage.removeItem("pendingOrder");
        } catch (error) {
          console.error("Order creation failed:", error);
          toast.error("Failed to place order. Try again later.");
        }
      } catch (e) {
        setError("Unable to verify payment. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-16">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 border border-emerald-100 text-center">
        {loading ? (
          <div>
            <div className="mx-auto mb-6 w-14 h-14 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying payment…
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your transaction.
            </p>
          </div>
        ) : error ? (
          <div>
            <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center rounded-full bg-red-50 text-red-600 text-3xl">
              ✕
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                className="px-5 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
                onClick={() => navigate("/checkout")}
              >
                Try Again
              </button>
              <button
                className="px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-3xl">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful
            </h1>
            <p className="text-gray-600">
              Thank you! Your payment has been confirmed.
            </p>
            {invoiceId ? (
              <p className="mt-2 text-sm text-gray-500">
                Invoice ID: {invoiceId}
              </p>
            ) : null}
            {status ? (
              <p className="mt-1 text-sm text-gray-500">Status: {status}</p>
            ) : null}

            <div className="mt-8 flex gap-3 justify-center">
              <button
                className="px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => navigate("/orders")}
              >
                View Orders
              </button>
              <button
                className="px-5 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;

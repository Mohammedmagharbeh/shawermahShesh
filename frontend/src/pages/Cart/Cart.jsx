import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import Loading from "@/componenet/common/Loading";
import CartCard from "./CartCard";
import { useTranslation } from "react-i18next";

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const { user } = useUser();
  const { t } = useTranslation();

  // --- 💰 Order Summary Calculations ---
  const orderSummary = useMemo(() => {
    if (!cart?.products) return { originalTotal: 0, finalTotal: 0, totalSavings: 0 };

    return cart.products.reduce((acc, item) => {
      const { productId, additions, quantity, selectedProtein, selectedType } = item;

      // 1. Determine Base Price
      let basePrice = Number(productId.basePrice || 0);

      // Override if choices exist
      if (productId.hasProteinChoices && productId.hasTypeChoices) {
        if (selectedProtein && selectedType) {
          basePrice = Number(productId.prices?.[selectedProtein]?.[selectedType] ?? basePrice);
        }
      } else if (productId.hasProteinChoices) {
        if (selectedProtein) {
          basePrice = Number(productId.prices?.[selectedProtein] ?? basePrice);
        }
      } else if (productId.hasTypeChoices) {
        if (selectedType) {
          basePrice = Number(productId.prices?.[selectedType] ?? basePrice);
        }
      }

      // 2. Additions Cost
      const additionsCost = additions.reduce((sum, add) => sum + Number(add.price || 0), 0);

      // 3. Discount Logic
      const discountPercent = Number(productId.discount || 0);
      const discountAmount = (basePrice * discountPercent) / 100;

      // 4. Line Item Totals
      const itemOriginalPrice = (basePrice + additionsCost) * quantity;
      const itemFinalPrice = ((basePrice - discountAmount) + additionsCost) * quantity;

      return {
        originalTotal: acc.originalTotal + itemOriginalPrice,
        finalTotal: acc.finalTotal + itemFinalPrice,
        totalSavings: acc.totalSavings + (discountAmount * quantity)
      };
    }, { originalTotal: 0, finalTotal: 0, totalSavings: 0 });
  }, [cart]);


  if (!user || !user._id) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  if (loading) return <Loading />;

  if (!cart._id || !cart.products || cart?.products?.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t("cart_empty_title")}
          </h2>
          <p className="text-gray-600 mb-6">{t("cart_empty_desc")}</p>
          <Link
            to="/products"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {t("cart_start_shopping")}
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t("cart_your_order")}
          </h1>
          <p className="text-lg text-gray-600">{t("cart_review_order")}</p>
          <div className="w-24 h-1 bg-red-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="xl:col-span-2">
            <div className="hidden lg:grid lg:grid-cols-4 gap-4 bg-red-600 text-white p-6 rounded-lg font-semibold text-lg mb-6">
              <span>{t("cart_item_details")}</span>
              <span className="text-center">{t("price")}</span>
              <span className="text-center">{t("qty")}</span>
              <span className="text-center">{t("subtotal")}</span>
            </div>

            <div className="space-y-4">
              {cart?.products?.map((product) => (
                <CartCard
                  product={product}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  key={
                    (product?.productId?._id ?? "id not found") +
                    product.notes +
                    product.isSpicy +
                    product.additions.map((a) => a._id).join(",") +
                    product.selectedType +
                    product.selectedProtein
                  }
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {t("cart_order_summary")}
              </h2>

              <div className="space-y-4 mb-6">

                {/* Original Price */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">{t("subtotal")}:</span>
                  <span className={`text-lg font-semibold ${orderSummary.totalSavings > 0 ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {orderSummary.originalTotal.toFixed(2)} JOD
                  </span>
                </div>

                {/* Savings Display (Only if discount exists) */}
                {orderSummary.totalSavings > 0 && (
                  <div className="flex justify-between items-center py-2 text-green-600 bg-green-50 px-2 rounded-md">
                    <span>{t("you_save")}:</span>
                    <span className="font-bold">
                      - {orderSummary.totalSavings.toFixed(2)} JOD
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{t("delivery")}:</span>
                    <span className="text-gray-600 font-semibold">
                      {t("delivery_info")}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xl font-bold text-gray-800">
                      {t("total")}:
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-red-600">
                        {orderSummary.finalTotal.toFixed(2)} JOD
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className={`w-full bg-red-600 hover:bg-red-700 px-8 py-4 text-white rounded-lg font-bold text-lg text-center block transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${cart?.products?.length === 0 &&
                  "pointer-events-none opacity-50"
                  }`}
              >
                {t("cart_checkout")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import Loading from "@/components/common/Loading";
import CartCard from "./CartCard";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  // --- 💰 Order Summary Calculations ---
  const orderSummary = useMemo(() => {
    if (!cart?.products)
      return { originalTotal: 0, finalTotal: 0, totalSavings: 0 };

    return cart.products.reduce(
      (acc, item) => {
        const {
          productId,
          additions,
          quantity,
          selectedProtein,
          selectedType,
        } = item;

        // Safety check if product was deleted
        if (!productId) return acc;

        // 1. Determine Base Price
        let basePrice = Number(productId.basePrice || 0);

        // Override if choices exist
        if (productId.hasProteinChoices && productId.hasTypeChoices) {
          if (selectedProtein && selectedType) {
            basePrice = Number(
              productId.prices?.[selectedProtein]?.[selectedType] ?? basePrice,
            );
          }
        } else if (productId.hasProteinChoices) {
          if (selectedProtein) {
            basePrice = Number(
              productId.prices?.[selectedProtein] ?? basePrice,
            );
          }
        } else if (productId.hasTypeChoices) {
          if (selectedType) {
            basePrice = Number(productId.prices?.[selectedType] ?? basePrice);
          }
        }

        // 2. Additions Cost
        const additionsCost = additions.reduce(
          (sum, add) => sum + Number(add.price || 0),
          0,
        );

        // 3. Discount Logic
        const discountPercent = Number(productId.discount || 0);
        const discountAmount = (basePrice * discountPercent) / 100;

        // 4. Line Item Totals
        const itemOriginalPrice = (basePrice + additionsCost) * quantity;
        const itemFinalPrice =
          (basePrice - discountAmount + additionsCost) * quantity;

        return {
          originalTotal: acc.originalTotal + itemOriginalPrice,
          finalTotal: acc.finalTotal + itemFinalPrice,
          totalSavings: acc.totalSavings + discountAmount * quantity,
        };
      },
      { originalTotal: 0, finalTotal: 0, totalSavings: 0 },
    );
  }, [cart]);

  if (!user || (!user._id && typeof window !== "undefined")) {
    window.location.href = "/login";
    return null;
  }

  if (loading && !cart?.products) return <Loading />;

  // Empty State
  if (!cart?._id || !cart?.products || cart?.products?.length === 0)
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50/50 p-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("cart_empty_title")}
        </h2>
        <p className="text-gray-500 mb-8 max-w-xs text-center">
          {t("cart_empty_desc")}
        </p>
        <Link to="/products">
          <Button
            size="lg"
            className="rounded-full px-8 shadow-lg bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {t("cart_start_shopping")}
          </Button>
        </Link>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50/30 pb-32 sm:pb-20 pt-6"
      dir={i18n.dir()}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/products"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
          >
            {isRTL ? (
              <ArrowRight className="w-6 h-6" />
            ) : (
              <ArrowLeft className="w-6 h-6" />
            )}
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("cart_your_order")}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {cart.products.length}{" "}
              {cart.products.length === 1 ? t("item") : t("items")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.products.map((product, idx) => (
              <CartCard
                key={product._id || `${product.productId?._id}-${idx}`}
                product={product}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>

          {/* Desktop Summary Sidebar (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {t("cart_order_summary")}
              </h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t("subtotal")}</span>
                  <span>{orderSummary.originalTotal.toFixed(2)} JOD</span>
                </div>

                {orderSummary.totalSavings > 0 && (
                  <div className="flex justify-between text-green-600 font-medium bg-green-50 p-2 rounded-lg">
                    <span>{t("you_save")}</span>
                    <span>-{orderSummary.totalSavings.toFixed(2)} JOD</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>{t("delivery")}</span>
                  <span className="text-green-600 font-semibold">
                    {t("calculated_at_checkout")}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    {t("total")}
                  </span>
                  <span className="text-2xl font-extrabold text-red-600">
                    {orderSummary.finalTotal.toFixed(2)} JOD
                  </span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full h-12 text-base font-bold bg-gray-900 hover:bg-black text-white shadow-lg rounded-xl">
                  {t("cart_checkout")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 safe-pb">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-0.5">
              {t("total")}
            </span>
            <span className="text-xl font-extrabold text-gray-900 leading-none block">
              {orderSummary.finalTotal.toFixed(2)}{" "}
              <span className="text-xs text-gray-500 font-bold">JOD</span>
            </span>
            {orderSummary.totalSavings > 0 && (
              <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded inline-block mt-1">
                {t("saved")} {orderSummary.totalSavings.toFixed(2)}
              </span>
            )}
          </div>
          <Link to="/checkout" className="flex-1">
            <Button className="w-full h-12 text-base font-bold bg-gray-900 hover:bg-black text-white shadow-lg rounded-xl">
              {t("cart_checkout")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import productPlaceholderImg from "@/assets/product_placeholder.jpeg";
import { useTranslation } from "react-i18next";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

function CartCard({ product, updateQuantity, removeFromCart }) {
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { t } = useTranslation();

  // Extract relevant data for cleaner code
  const { productId, additions, selectedProtein, selectedType, quantity } =
    product;

  // --- 💰 PRICE CALCULATION ENGINE ---
  const priceDetails = useMemo(() => {
    // 1. Determine Raw Base Price (Standard or Matrix)
    let rawBase = Number(productId.basePrice || 0);

    if (productId.hasProteinChoices && productId.hasTypeChoices) {
      if (selectedProtein && selectedType) {
        rawBase = Number(
          productId.prices?.[selectedProtein]?.[selectedType] ?? rawBase,
        );
      }
    } else if (productId.hasProteinChoices) {
      if (selectedProtein) {
        rawBase = Number(productId.prices?.[selectedProtein] ?? rawBase);
      }
    } else if (productId.hasTypeChoices) {
      if (selectedType) {
        rawBase = Number(productId.prices?.[selectedType] ?? rawBase);
      }
    }

    // 2. Calculate Discount (Applied to Base Price Only)
    const discountPercent = Number(productId.discount || 0);
    const hasDiscount = discountPercent > 0;
    const discountAmount = (rawBase * discountPercent) / 100;
    const discountedBase = rawBase - discountAmount;

    // 3. Calculate Additions Total
    const additionsCost = additions.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );

    // 4. Final Unit Price (Discounted Base + Additions)
    const finalUnitPrice = discountedBase + additionsCost;

    // 5. Grand Total for this line item
    const finalLineTotal = finalUnitPrice * quantity;

    // 6. Original Price (for display comparison)
    const originalUnitPrice = rawBase + additionsCost;

    return {
      rawBase,
      discountedBase,
      additionsCost,
      finalUnitPrice,
      finalLineTotal,
      originalUnitPrice,
      hasDiscount,
      discountPercent,
    };
  }, [product, productId, selectedProtein, selectedType, additions, quantity]);

  const handleRemove = () => {
    removeFromCart(
      productId._id,
      additions.map((a) => a._id),
      product.isSpicy,
      product.notes,
      selectedProtein,
      selectedType,
    );
  };

  const handleDecrease = () => {
    const newQuantity = Math.max(1, quantity - 1);
    updateQuantity(productId._id, { ...product, quantity: newQuantity });
  };

  const handleIncrease = () => {
    updateQuantity(productId._id, { ...product, quantity: quantity + 1 });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
      <div className="flex gap-3 sm:gap-5">
        {/* Image Section */}
        <div className="shrink-0 relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src={productId?.image || productPlaceholderImg}
              alt={productId?.name?.[selectedLanguage]}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {priceDetails.hasDiscount && (
            <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md shadow-sm">
              -{priceDetails.discountPercent}%
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Top Row: Title & Remove Button */}
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight line-clamp-1">
                {productId?.name?.[selectedLanguage] ?? t("deleted_product")}
              </h3>

              {/* Options Badges */}
              <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
                {/* Basic Options */}
                {(product.isSpicy || selectedType || selectedProtein) && (
                  <div className="flex gap-1 flex-wrap text-gray-600 font-medium">
                    {product.isSpicy && (
                      <span className="text-red-500 bg-red-50 px-1.5 rounded border border-red-100">
                        {t("spicy")}
                      </span>
                    )}
                    {productId.hasTypeChoices && (
                      <span className="bg-gray-100 px-1.5 rounded">
                        {t(selectedType)}
                      </span>
                    )}
                    {productId.hasProteinChoices && (
                      <span className="bg-gray-100 px-1.5 rounded">
                        {t(selectedProtein)}
                      </span>
                    )}
                  </div>
                )}

                {/* Additions */}
                {additions?.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-gray-500">
                    {additions.map((add) => (
                      <span
                        key={add._id}
                        className="bg-blue-50 text-blue-700 px-1.5 rounded border border-blue-100 flex items-center"
                      >
                        {add.name[selectedLanguage]}
                        {Number(add.price) > 0 && (
                          <span className="ml-1 text-[9px] opacity-70">
                            +{Number(add.price).toFixed(2)}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              {product.notes && (
                <p className="text-xs text-gray-400 italic bg-gray-50 p-1.5 rounded mt-1 line-clamp-2">
                  <span className="font-semibold text-gray-500">
                    {t("notes")}:
                  </span>{" "}
                  {product.notes}
                </p>
              )}
            </div>

            {/* Desktop Remove Button (Top Right) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 -mr-2 hidden sm:flex shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Bottom Row: Controls & Price */}
          <div className="flex justify-between items-end mt-3 sm:mt-0">
            {/* Quantity Controls */}
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-9">
              <button
                onClick={handleDecrease}
                disabled={quantity <= 1}
                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="w-8 text-center font-bold text-gray-900 text-sm tabular-nums border-x border-gray-200 bg-white h-full flex items-center justify-center">
                {quantity}
              </div>
              <button
                onClick={handleIncrease}
                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Price & Mobile Remove */}
            <div className="flex flex-col items-end gap-1">
              {/* Total Price */}
              <div className="text-right">
                {priceDetails.hasDiscount && (
                  <span className="text-xs text-gray-400 line-through block leading-none mb-0.5">
                    {(priceDetails.originalUnitPrice * quantity).toFixed(2)}
                  </span>
                )}
                <span className="text-lg font-extrabold text-gray-900 leading-none">
                  {priceDetails.finalLineTotal.toFixed(2)}{" "}
                  <span className="text-xs font-semibold text-gray-500">
                    {t("jod")}
                  </span>
                </span>
              </div>

              {/* Mobile Remove Link */}
              <button
                onClick={handleRemove}
                className="sm:hidden text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> {t("remove")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartCard;

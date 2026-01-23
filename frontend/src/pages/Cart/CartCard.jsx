import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import productPlaceholderImg from "../../assets/product_placeholder.jpeg";
import { useTranslation } from "react-i18next";

function CartCard({ product, updateQuantity, removeFromCart }) {
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { t } = useTranslation();

  // Extract relevant data for cleaner code
  const { productId, additions, selectedProtein, selectedType, quantity } = product;

  // --- 💰 PRICE CALCULATION ENGINE ---
  const priceDetails = useMemo(() => {
    // 1. Determine Raw Base Price (Standard or Matrix)
    let rawBase = Number(productId.basePrice || 0);

    if (productId.hasProteinChoices && productId.hasTypeChoices) {
      if (selectedProtein && selectedType) {
        rawBase = Number(productId.prices?.[selectedProtein]?.[selectedType] ?? rawBase);
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
    const additionsCost = additions.reduce((sum, item) => sum + Number(item.price || 0), 0);

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
      discountPercent
    };
  }, [product, productId, selectedProtein, selectedType, additions, quantity]);


  return (
    <div className="bg-white rounded-lg shadow-lg border border-red-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">

        {/* --- 1. Product Info --- */}
        <div className="flex items-center space-x-4">
          <button
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
            onClick={() =>
              removeFromCart(
                productId._id,
                additions.map((a) => a._id),
                product.isSpicy,
                product.notes,
                selectedProtein,
                selectedType
              )
            }
            aria-label="Remove item"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="size-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            <img
              src={productId?.image || productPlaceholderImg}
              alt={productId?.name?.[selectedLanguage]}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <h3 className="font-semibold text-gray-800 text-lg">
              {productId?.name[selectedLanguage] ?? "Deleted Product"}
            </h3>

            <div className="flex flex-wrap gap-1 text-white">
              {productId.isSpicy && (
                <Badge variant="secondary">
                  {product.isSpicy ? t("spicy") : t("normal")}
                </Badge>
              )}
              {productId.hasTypeChoices && (
                <Badge variant="secondary">{t(selectedType)}</Badge>
              )}
              {productId.hasProteinChoices && (
                <Badge variant="secondary">{t(selectedProtein)}</Badge>
              )}
            </div>

            {additions && additions.length > 0 && (
              <div className="flex gap-1 flex-wrap items-center">
                <span className="text-sm text-gray-600">{t("additions")}:</span>
                {additions.map((addition) => (
                  <Badge
                    key={addition._id}
                    className="px-2 py-0.5 text-xs flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  >
                    {addition.name[selectedLanguage]}
                    {Number(addition.price) > 0 && (
                      <span className="text-gray-500 font-normal">
                        + {Number(addition.price).toFixed(2)}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            )}

            {product.notes && (
              <p className="text-sm text-gray-500 italic">
                <span className="font-medium">{t("notes")}:</span> {product.notes}
              </p>
            )}
          </div>
        </div>

        {/* --- 2. Unit Price --- */}
        <div className="flex justify-between lg:justify-center items-center">
          <span className="lg:hidden font-medium text-gray-600">
            {t("price")}:
          </span>
          <div className="flex flex-col items-end lg:items-center">
            {priceDetails.hasDiscount ? (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {priceDetails.originalUnitPrice.toFixed(2)} JOD
                </span>
                <span className="text-lg font-bold text-red-600 flex items-center gap-1">
                  {priceDetails.finalUnitPrice.toFixed(2)} JOD
                  <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-none px-1 py-0 h-5 text-[10px]">
                    -{priceDetails.discountPercent}%
                  </Badge>
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-700">
                {priceDetails.finalUnitPrice.toFixed(2)} JOD
              </span>
            )}
          </div>
        </div>

        {/* --- 3. Quantity Controls --- */}
        <div className="flex justify-between lg:justify-center items-center">
          <span className="lg:hidden font-medium text-gray-600">
            {t("quantity")}:
          </span>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Decrease */}
            <button
              onClick={() => {
                const newQuantity = Math.max(1, quantity - 1);
                updateQuantity(productId._id, { ...product, quantity: newQuantity });
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg p-2 transition-colors duration-200 disabled:opacity-50"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            {/* Display */}
            <span className="w-10 text-center font-semibold text-gray-900">
              {quantity}
            </span>

            {/* Increase */}
            <button
              onClick={() => {
                updateQuantity(productId._id, { ...product, quantity: quantity + 1 });
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-2 transition-colors duration-200 shadow-md"
              aria-label="Increase quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* --- 4. Total Price --- */}
        <div className="flex flex-col lg:items-center justify-between lg:justify-center gap-1 bg-gray-50 p-3 rounded-lg shadow-sm lg:shadow-none lg:bg-transparent lg:p-0">
          <span className="lg:hidden font-medium text-gray-600 w-full text-start">
            {t("total")}:
          </span>
          <span className="text-xl lg:text-2xl font-extrabold text-red-600 block">
            {priceDetails.finalLineTotal.toFixed(2)} <span className="text-sm font-medium text-gray-500">JOD</span>
          </span>
        </div>

      </div>
    </div>
  );
}

export default CartCard;
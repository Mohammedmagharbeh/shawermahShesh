import { Badge } from "@/components/ui/badge";
import productPlaceholderImg from "../../assets/product_placeholder.jpeg";
import { useTranslation } from "react-i18next";
import { calculateSubtotal } from "@/lib/utils";
import { getProductPrice } from "@/constants";

function CartCard({ product, updateQuantity, removeFromCart }) {
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-red-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
        {/* Product Info */}
        <div className="flex items-center space-x-4">
          <button
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
            onClick={() =>
              removeFromCart(
                product.productId._id,
                product.additions.map((a) => a._id),
                product.selectedProtein,
                product.selectedType
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
          <div className="size-16 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product?.productId?.image || productPlaceholderImg}
              alt={product?.productId?.name?.[selectedLanguage]}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <h3 className="font-semibold text-gray-800 text-lg">
              {product?.productId?.name[selectedLanguage] ?? "Deleted Product"}
            </h3>

            <div className="grid w-full gap-1 text-white">
              {product.productId.isSpicy && (
                <Badge variant="secondary">
                  {product.isSpicy ? "حار" : "عادي"}
                </Badge>
              )}

              {product.productId.hasTypeChoices && (
                <Badge variant="secondary">{t(product.selectedType)}</Badge>
              )}
              {product.productId.hasProteinChoices && (
                <Badge variant="secondary">{t(product.selectedProtein)}</Badge>
              )}
            </div>

            {product.additions && product.additions.length > 0 && (
              <div className="flex gap-1 flex-wrap items-center">
                <span className="text-sm text-gray-600">{t("additions")}:</span>
                {product.additions.map((addition) => (
                  <Badge
                    key={addition._id}
                    className="px-2 py-1 flex items-center gap-1"
                  >
                    {addition.name[selectedLanguage]}
                    <span className="opacity-70">·</span>
                    {addition.price?.toFixed(2)} JOD
                  </Badge>
                ))}
              </div>
            )}
            {product.notes && (
              <p className="text-sm text-gray-600 italic">
                {t("notes")}: {product.notes}
              </p>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between lg:justify-center items-center">
          <span className="lg:hidden font-medium text-gray-600">
            {t("price")}:
          </span>
          <div className="flex flex-col items-end lg:items-center">
            {product?.productId?.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {basePrice?.toFixed(2)} JOD
              </span>
            )}
            <span className="text-xl font-bold text-red-600">
              {getProductPrice(product)?.toFixed(2)} JOD
            </span>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex justify-between lg:justify-center items-center">
          <span className="lg:hidden font-medium text-gray-600">
            {t("quantity")}:
          </span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={product.quantity}
              onChange={(e) =>
                updateQuantity(product.productId._id, {
                  quantity: Number.parseInt(e.target.value, 10),
                  additions: product.additions.map((a) => a._id),
                  isSpicy: product.isSpicy,
                  notes: product.notes,
                  selectedProtein: product.selectedProtein,
                  selectedType: product.selectedType,
                })
              }
              className="w-20 px-3 py-2 border-2 border-red-200 rounded-lg text-center font-semibold focus:border-red-500 focus:outline-none transition-colors"
              min="1"
            />
          </div>
        </div>

        {/* Total */}
        <div className="flex flex-col lg:justify-center items-center gap-1 bg-gray-50 p-3 rounded-lg shadow-sm w-full max-w-xs">
          <span className="lg:hidden font-medium text-gray-600">
            {t("total")}:
          </span>

          <span className="text-2xl font-extrabold text-red-600">
            {(calculateSubtotal(product) * product.quantity)?.toFixed(2)} JOD
          </span>
        </div>
      </div>
    </div>
  );
}

export default CartCard;

import { useCart } from "@/contexts/CartContext";
import product_placeholder from "../../assets/product_placeholder.jpeg";
import { useTranslation } from "react-i18next";

function CartCard({ product }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  console.log(product);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-red-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
        {/* Product Info */}
        <div className="flex items-center space-x-4">
          <button
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
            onClick={() => removeFromCart(product.productId._id)}
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
              src={product?.images?.[0] || product_placeholder}
              alt={product.productId.name[selectedLanguage]}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              {product?.productId?.name[selectedLanguage] ?? "Product Name"}
            </h3>
            <p className="text-sm text-gray-500">Restaurant Special</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between lg:justify-center items-center">
          <span className="lg:hidden font-medium text-gray-600">
            {t("price")}:
          </span>
          <span className="text-xl font-bold text-red-600">
            {product?.productId?.price ?? "Price Unavailable"} JOD
          </span>
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
                updateQuantity(
                  product.productId._id,
                  Number.parseInt(e.target.value, 10)
                )
              }
              className="w-20 px-3 py-2 border-2 border-red-200 rounded-lg text-center font-semibold focus:border-red-500 focus:outline-none transition-colors"
              min="1"
            />
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between lg:justify-center items-center">
          <span className="lg:hidden font-medium text-gray-600">
            {t("total")}:
          </span>
          <span className="text-xl font-bold text-red-700">
            {(product?.productId?.price ?? 0 * product?.quantity ?? 0).toFixed(
              2
            )}
            JOD
          </span>
        </div>
      </div>
    </div>
  );
}

export default CartCard;

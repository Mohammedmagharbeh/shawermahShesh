import React from "react";
import PropTypes from "prop-types";
import { Badge } from "@/components/ui/badge";
import productPlaceholder from "@/assets/product_placeholder.jpeg";

/**
 * Order items list component displaying cart products
 * Refactored for better mobile visuals with thumbnails
 * @component
 */
const OrderItemsList = React.memo(({ cart, t, lang }) => {
  if (!cart?.products?.length) {
    return (
      <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        {t("cart_empty")}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
      {cart.products.map((item) => {
        const itemKey = `${item.productId._id}-${item.selectedType || ""}-${item.selectedProtein || ""}`;

        return (
          <div
            key={itemKey}
            className="flex gap-4 py-3 border-b border-gray-100 last:border-b-0 animate-in fade-in duration-300"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
              <img
                src={item.productId.image || productPlaceholder}
                alt={item.productId.name[lang]}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate-2-lines">
                  {item.productId.name[lang]}
                </h4>
                <div className="shrink-0 text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  x{item.quantity}
                </div>
              </div>

              {/* Product Options */}
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {item.productId.isSpicy && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-5 bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                  >
                    {item.isSpicy ? t("spicy") : t("normal")}
                  </Badge>
                )}
                {item.selectedType && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-5 bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    {t(item.selectedType)}
                  </Badge>
                )}
                {item.selectedProtein && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-5 bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    {t(item.selectedProtein)}
                  </Badge>
                )}
                {item.additions?.map((add, idx) => (
                  <Badge
                    key={add._id || idx}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5 border-blue-100 bg-blue-50 text-blue-700"
                  >
                    {add.name[lang]}
                  </Badge>
                ))}
              </div>

              {/* Notes */}
              {item.notes && (
                <p className="text-xs text-gray-400 mt-2 italic bg-gray-50 p-1.5 rounded inline-block">
                  <span className="font-semibold">{t("notes")}:</span>{" "}
                  {item.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

OrderItemsList.displayName = "OrderItemsList";

OrderItemsList.propTypes = {
  cart: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
};

export default OrderItemsList;

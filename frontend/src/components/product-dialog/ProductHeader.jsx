import React, { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * Product Header Component
 * Displays the product name, category, description, and price calculation
 */
const ProductHeader = React.memo(
  ({
    name,
    category,
    description,
    isSelectionComplete,
    pricePerUnit,
    basePrice,
    additionsPrice,
    discount,
    t,
  }) => {
    // Memoize formatted prices to avoid repeated calculations
    const formattedPrice = useMemo(() => {
      return `${pricePerUnit.toFixed(2)} ${t("jod")}`;
    }, [pricePerUnit, t]);

    const formattedOriginalPrice = useMemo(() => {
      return (basePrice + additionsPrice).toFixed(2);
    }, [basePrice, additionsPrice]);

    return (
      <div>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
              {name}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{category}</p>
          </div>
        </div>

        {/* Price Display */}
        <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100 mb-4 transition-colors hover:bg-gray-50">
          {!isSelectionComplete ? (
            <p className="text-lg font-medium text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {t("according_to_your_choices")}
            </p>
          ) : (
            <>
              <span className="text-3xl font-bold text-red-600 animate-in fade-in slide-in-from-left-2 duration-300">
                {formattedPrice}
              </span>
              {discount > 0 && (
                <span className="text-lg text-gray-400 line-through decoration-red-300">
                  {formattedOriginalPrice}
                </span>
              )}
            </>
          )}
        </div>

        <p className="mt-3 text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
          {description}
        </p>
      </div>
    );
  },
);

ProductHeader.displayName = "ProductHeader";

ProductHeader.propTypes = {
  name: PropTypes.string,
  category: PropTypes.string,
  description: PropTypes.string,
  isSelectionComplete: PropTypes.bool.isRequired,
  pricePerUnit: PropTypes.number.isRequired,
  basePrice: PropTypes.number.isRequired,
  additionsPrice: PropTypes.number.isRequired,
  discount: PropTypes.number,
  t: PropTypes.func.isRequired,
};

export default ProductHeader;

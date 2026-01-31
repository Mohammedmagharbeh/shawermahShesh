import React from "react";
import PropTypes from "prop-types";
import { Badge } from "@/components/ui/badge";
import product_placeholder from "@/assets/product_placeholder.jpeg";

/**
 * Product Image Component
 * Displays the product image with discount badge if applicable
 */
const ProductImage = React.memo(
  ({ image, name, discount, t, selectedLanguage }) => {
    return (
      <div className="relative w-full h-fit shrink-0">
        <div className="aspect-video sm:aspect-square bg-gray-50 rounded-none sm:rounded-2xl overflow-hidden border-b sm:border border-gray-100 shadow-sm">
          <img
            src={image || product_placeholder}
            alt={name || "Product"}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
        {discount > 0 && (
          <Badge className="absolute top-4 right-4 bg-red-600 text-white text-sm px-3 py-1 shadow-md animate-in fade-in zoom-in duration-300">
            {t("save")} {discount}%
          </Badge>
        )}
      </div>
    );
  },
);

ProductImage.displayName = "ProductImage";

ProductImage.propTypes = {
  image: PropTypes.string,
  name: PropTypes.string,
  discount: PropTypes.number,
  t: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string,
};

export default ProductImage;

import React from "react";
import PropTypes from "prop-types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ProductDialog } from "@/components/common/ProductDialog";
import { Plus, Flame } from "lucide-react";
import { motion } from "framer-motion";
import product_placeholder from "@/assets/product_placeholder.jpeg";

/**
 * Mobile-first Product Card Component
 */
const ProductCard = React.memo(
  ({ product, user, handleInStock, selectedLanguage, t }) => {
    const isOutOfStock = !product.inStock;
    const hasDiscount = product.discount > 0;
    const discountPercent = product.discount;

    const originalPrice = Number(product.basePrice);
    const discountedPrice =
      originalPrice - (originalPrice * discountPercent) / 100;

    // Animation variants
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        layout
        className="h-full"
      >
        <Card
          className={`
        relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white group rounded-2xl
        ${isOutOfStock ? "opacity-75 grayscale-[0.8]" : ""}
      `}
        >
          <div className="flex p-3 sm:p-4 gap-4 h-full">
            {/* Image Container - Mobile optimized size */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
              <img
                src={product.image || product_placeholder}
                alt={product.name[selectedLanguage]}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                  <Badge
                    variant="destructive"
                    className="text-[10px] sm:text-xs font-bold px-2 py-0.5 shadow-lg"
                  >
                    {t("out_of_stock")}
                  </Badge>
                </div>
              )}

              {/* Discount Badge */}
              {!isOutOfStock && hasDiscount && (
                <div className="absolute top-0 left-0">
                  <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-md flex items-center gap-1 animate-in slide-in-from-left-2 fade-in duration-500">
                    <Flame className="w-3 h-3 fill-white animate-pulse" />
                    {discountPercent}%
                  </div>
                </div>
              )}
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              {/* Top Section: Title & Desc */}
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                    {product.name[selectedLanguage]}
                  </h3>

                  {/* Admin Stock Toggle (Mobile friendly placement) */}
                  {(user.role === "admin" || user.role === "employee") && (
                    <div
                      className="flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch
                        checked={!isOutOfStock}
                        onCheckedChange={(v) => handleInStock(v, product)}
                        className="scale-75 data-[state=checked]:bg-green-600 shadow-sm"
                        dir="ltr"
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {product.description?.[selectedLanguage]}
                </p>
              </div>

              {/* Bottom Section: Price & Action */}
              <div className="flex items-end justify-between mt-3 pt-2">
                {/* Price Display */}
                <div className="flex flex-col justify-end">
                  {product.hasProteinChoices || product.hasTypeChoices ? (
                    <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                      {t("starts_from")}:
                      <span className="text-gray-900 font-bold">
                        {originalPrice.toFixed(2)}
                      </span>
                    </span>
                  ) : hasDiscount ? (
                    <div className="flex flex-col items-start leading-none gap-0.5">
                      <span className="text-xs text-gray-400 line-through decoration-red-300/50">
                        {originalPrice.toFixed(2)}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-red-600">
                          {discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-red-600">
                          {t("jod")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-gray-900">
                        {originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {t("jod")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Add Button */}
                <ProductDialog
                  id={product._id}
                  disabled={isOutOfStock}
                  triggerLabel={<Plus className="w-5 h-5" />}
                  className={`
                  h-10 w-10 min-w-10 rounded-full shadow-md flex items-center justify-center p-0 transition-transform active:scale-90
                  ${
                    isOutOfStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-gray-900 text-white hover:bg-black hover:scale-105"
                  }
                  ${hasDiscount && !isOutOfStock ? "bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-100" : ""}
                `}
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  },
);

ProductCard.displayName = "ProductCard";

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  handleInStock: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default ProductCard;

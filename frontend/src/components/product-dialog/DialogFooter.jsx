import React from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { UI_CONFIG } from "@/components/product-dialog/constants";

/**
 * Dialog Footer Component
 * Contains quantity controls and submit button
 */
const DialogFooter = React.memo(
  ({
    t,
    quantity,
    onQuantityChange,
    grandTotal,
    isSelectionComplete,
    onSubmit,
  }) => {
    return (
      <div className="border-t p-4 sm:p-6 bg-white/90 backdrop-blur-md sticky bottom-0 z-50 shadow-inner">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Quantity Controls - Clean, accessible design */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2 sm:w-40 shadow-sm transition-all duration-200 hover:border-gray-300 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onQuantityChange(-1)}
              aria-label={t("decrease_quantity")}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </Button>

            <span className="text-xl font-bold text-gray-900 mx-4 select-none tabular-nums">
              {quantity}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onQuantityChange(1)}
              aria-label={t("increase_quantity")}
              className="text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Submit Button - Prominent CTA */}
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!isSelectionComplete()}
            className="flex-1 w-full h-12 text-base font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:grayscale hover:brightness-110 active:scale-[0.98] group relative overflow-hidden"
            style={{ backgroundColor: UI_CONFIG.BUTTON_COLOR_VAR }}
          >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>

            <div className="flex items-center justify-center gap-2 relative z-10">
              <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="uppercase tracking-wide">
                {t("add_to_cart")}
              </span>
              <span className="w-px h-5 bg-white/20 mx-2"></span>
              <span className="tabular-nums font-mono">
                {grandTotal.toFixed(2)} {t("jod")}
              </span>
            </div>
          </Button>
        </div>
      </div>
    );
  },
);

DialogFooter.displayName = "DialogFooter";

DialogFooter.propTypes = {
  t: PropTypes.func.isRequired,
  quantity: PropTypes.number.isRequired,
  onQuantityChange: PropTypes.func.isRequired,
  grandTotal: PropTypes.number.isRequired,
  isSelectionComplete: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DialogFooter;

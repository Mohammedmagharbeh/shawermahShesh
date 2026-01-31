import React, { useCallback } from "react";
import PropTypes from "prop-types";
import cliq from "@/assets/cliq.png";
import { PAYMENT_METHODS, PAYMENT_LOGOS } from "./constants";
import { isValidImageUrl } from "@/utils/inputSanitization";

/**
 * Payment method selector component
 * @component
 */
const PaymentMethodSelector = React.memo(({ method, setMethod, t }) => {
  // Memoize click handlers
  const handleCardClick = useCallback(() => {
    setMethod(PAYMENT_METHODS.CARD);
  }, [setMethod]);

  const handleCliqClick = useCallback(() => {
    setMethod(PAYMENT_METHODS.CLIQ);
  }, [setMethod]);

  return (
    <div className="pt-6 border-t border-gray-200 mt-4">
      <h3 className="font-semibold text-gray-900 mb-4 text-xs md:text-sm">
        {t("checkout_payment_method")}
      </h3>

      <div className="space-y-2">
        {/* Card Payment Option */}
        <div
          onClick={handleCardClick}
          className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
            method === PAYMENT_METHODS.CARD
              ? "border-red-500 bg-red-50/30 shadow-sm"
              : "border-gray-200 hover:border-red-300"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
        >
          {/* Radio Button */}
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              method === PAYMENT_METHODS.CARD
                ? "border-red-500"
                : "border-gray-400"
            }`}
          >
            {method === PAYMENT_METHODS.CARD && (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>

          {/* Label */}
          <span className="flex-1 font-medium text-sm">
            {t("checkout_card_payment")}
          </span>

          {/* Payment Logos */}
          <div className="flex gap-1">
            {isValidImageUrl(PAYMENT_LOGOS.VISA) && (
              <img
                src={PAYMENT_LOGOS.VISA}
                className="h-3"
                alt="Visa"
                loading="lazy"
              />
            )}
            {isValidImageUrl(PAYMENT_LOGOS.MASTERCARD) && (
              <img
                src={PAYMENT_LOGOS.MASTERCARD}
                className="h-4"
                alt="Mastercard"
                loading="lazy"
              />
            )}
          </div>
        </div>

        {/* CliQ Payment Option */}
        <div
          onClick={handleCliqClick}
          className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
            method === PAYMENT_METHODS.CLIQ
              ? "border-red-500 bg-red-50/30 shadow-sm"
              : "border-gray-200 hover:border-red-300"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleCliqClick()}
        >
          {/* Radio Button */}
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              method === PAYMENT_METHODS.CLIQ
                ? "border-red-500"
                : "border-gray-400"
            }`}
          >
            {method === PAYMENT_METHODS.CLIQ && (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>

          {/* Label */}
          <span className="flex-1 font-medium text-sm">
            {t("checkout_click_payment")}
          </span>

          {/* CliQ Logo */}
          <img src={cliq} className="w-8" alt="CliQ" loading="lazy" />
        </div>
      </div>
    </div>
  );
});

PaymentMethodSelector.displayName = "PaymentMethodSelector";

PaymentMethodSelector.propTypes = {
  /** Currently selected payment method */
  method: PropTypes.oneOf([PAYMENT_METHODS.CARD, PAYMENT_METHODS.CLIQ])
    .isRequired,
  /** Payment method change handler */
  setMethod: PropTypes.func.isRequired,
  /** Translation function */
  t: PropTypes.func.isRequired,
};

export default PaymentMethodSelector;

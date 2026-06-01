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
          <div className="flex items-center gap-1.5">
            {isValidImageUrl(PAYMENT_LOGOS.VISA) && (
              <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7 w-12">
                <img
                  src={PAYMENT_LOGOS.VISA}
                  className="h-3.5 w-auto object-contain"
                  alt="Visa"
                  loading="lazy"
                />
              </span>
            )}
            {isValidImageUrl(PAYMENT_LOGOS.MASTERCARD) && (
              <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
                <img
                  src={PAYMENT_LOGOS.MASTERCARD}
                  className="h-5 w-auto object-contain"
                  alt="Mastercard"
                  loading="lazy"
                />
              </span>
            )}
            {isValidImageUrl(PAYMENT_LOGOS.ApplePay) && (
              <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
                <img
                  src={PAYMENT_LOGOS.ApplePay}
                  className="h-5 w-auto object-contain"
                  alt="Apple Pay"
                  loading="lazy"
                />
              </span>
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
          <img
            src={cliq}
            className={`w-8 object-contain ${method === PAYMENT_METHODS.CLIQ ? "" : "grayscale opacity-80"}`}
            alt="CliQ"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
});

PaymentMethodSelector.displayName = "PaymentMethodSelector";

PaymentMethodSelector.propTypes = {
  method: PropTypes.oneOf([PAYMENT_METHODS.CARD, PAYMENT_METHODS.CLIQ])
    .isRequired,
  setMethod: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default PaymentMethodSelector;

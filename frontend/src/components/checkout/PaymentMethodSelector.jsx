import React, { useCallback } from "react";
import PropTypes from "prop-types";
import download from "@/assets/download.jpg";
import { PAYMENT_METHODS, PAYMENT_LOGOS } from "./constants";
import { isValidImageUrl } from "@/utils/inputSanitization";

const ORANGE_MIN_AMOUNT = 15; // الحد الأدنى للدفع عبر Orange Money

const PaymentMethodSelector = React.memo(
  ({
    method,
    setMethod,
    t,
    totalAmount,
    savedCards = [],
    selectedSavedCardId,
    onSelectSavedCard,
  }) => {
    const handleCardClick = useCallback(() => {
      setMethod(PAYMENT_METHODS.CARD);
      if (onSelectSavedCard) onSelectSavedCard(null); // Clear selected saved card when selecting new card
    }, [setMethod, onSelectSavedCard]);
    const handleCliqClick = useCallback(
      () => setMethod(PAYMENT_METHODS.CLIQ),
      [setMethod],
    );

    // ✅ الأورنج يتفعل فقط لما المبلغ 15 دينار فأكثر
    const isOrangeAvailable = totalAmount >= ORANGE_MIN_AMOUNT;

    const handleOrangeClick = useCallback(() => {
      if (!isOrangeAvailable) return;
      setMethod(PAYMENT_METHODS.ORANGE_MONEY);
    }, [setMethod, isOrangeAvailable]);

    const optionClass = (active, disabled = false) =>
      `flex items-center gap-2 p-3 border rounded-xl transition-all ${
        disabled
          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
          : active
            ? "border-red-500 bg-red-50/30 shadow-sm cursor-pointer"
            : "border-gray-200 hover:border-red-300 cursor-pointer"
      }`;

    const radioClass = (active) =>
      `w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
        active ? "border-red-500" : "border-gray-400"
      }`;

    return (
      <div className="pt-6 border-t border-gray-200 mt-4">
        <h3 className="font-semibold text-gray-900 mb-4 text-xs md:text-sm">
          {t("checkout_payment_method")}
        </h3>

        <div className="space-y-2">
          {/* Saved Cards Section */}
          {savedCards.length > 0 && (
            <div className="mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block px-1">
                {t("checkout_saved_cards", "البطاقات المحفوظة")}
              </span>
              <div className="space-y-2">
                {savedCards.map((card) => {
                  const isSelected =
                    method === PAYMENT_METHODS.CARD &&
                    selectedSavedCardId === card._id;
                  return (
                    <div
                      key={card._id}
                      onClick={() => {
                        setMethod(PAYMENT_METHODS.CARD);
                        onSelectSavedCard(card._id);
                      }}
                      className={optionClass(isSelected)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (() => {
                          setMethod(PAYMENT_METHODS.CARD);
                          onSelectSavedCard(card._id);
                        })()
                      }
                    >
                      <div className={radioClass(isSelected)}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                      <span className="flex-1 font-medium text-sm">
                        •••• {card.card_last_4}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7 text-xs font-bold text-gray-600">
                          {card.card_brand.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 mb-2 border-t border-gray-100"></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block px-1">
                {t("checkout_other_methods", "طرق دفع أخرى")}
              </span>
            </div>
          )}

          {/* New Card Payment */}
          <div
            onClick={handleCardClick}
            className={optionClass(
              method === PAYMENT_METHODS.CARD && !selectedSavedCardId,
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
          >
            <div
              className={radioClass(
                method === PAYMENT_METHODS.CARD && !selectedSavedCardId,
              )}
            >
              {method === PAYMENT_METHODS.CARD && !selectedSavedCardId && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <span className="flex-1 font-medium text-sm">
              {savedCards.length > 0
                ? t("checkout_new_card_payment", "Pay with new card")
                : t("checkout_card_payment")}
            </span>
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

          {/* CliQ */}
          <div
            onClick={handleCliqClick}
            className={optionClass(method === PAYMENT_METHODS.CLIQ)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleCliqClick()}
          >
            <div className={radioClass(method === PAYMENT_METHODS.CLIQ)}>
              {method === PAYMENT_METHODS.CLIQ && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <span className="flex-1 font-medium text-sm">
              {t("checkout_click_payment")}
            </span>
            <img src={download} className="w-8" alt="CliQ" loading="lazy" />
          </div>

          {/* ✅ Orange Money — متاح فقط لما المبلغ 15 دينار فأكثر */}
          <div
            onClick={handleOrangeClick}
            className={optionClass(
              method === PAYMENT_METHODS.ORANGE_MONEY,
              !isOrangeAvailable,
            )}
            role="button"
            tabIndex={isOrangeAvailable ? 0 : -1}
            aria-disabled={!isOrangeAvailable}
            onKeyDown={(e) => e.key === "Enter" && handleOrangeClick()}
          >
            <div
              className={radioClass(method === PAYMENT_METHODS.ORANGE_MONEY)}
            >
              {method === PAYMENT_METHODS.ORANGE_MONEY && isOrangeAvailable && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <span className="font-medium text-sm">
                {t("payment_methods.orange_money", "Orange Money")}
              </span>
              {/* رسالة توضيحية لما المبلغ أقل من الحد الأدنى */}
              {!isOrangeAvailable && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {t("payment_methods.orange_min_error", {
                    amount: ORANGE_MIN_AMOUNT,
                  })}
                </p>
              )}
            </div>
            <div className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7">
              <span className="text-orange-500 font-bold text-xs">
                🟠 Orange
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

PaymentMethodSelector.displayName = "PaymentMethodSelector";

PaymentMethodSelector.propTypes = {
  method: PropTypes.oneOf([
    PAYMENT_METHODS.CARD,
    PAYMENT_METHODS.CLIQ,
    PAYMENT_METHODS.ORANGE_MONEY,
  ]).isRequired,
  setMethod: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  totalAmount: PropTypes.number.isRequired,
  savedCards: PropTypes.array,
  selectedSavedCardId: PropTypes.string,
  onSelectSavedCard: PropTypes.func,
};

export default PaymentMethodSelector;

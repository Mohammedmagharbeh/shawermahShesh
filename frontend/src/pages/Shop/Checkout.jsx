import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutLogic } from "@/hooks/useCheckoutLogic";
import {
  CliqOtpModal,
  DeliverySection,
  OrderItemsList,
  OrderTotals,
  PaymentMethodSelector,
  CLIQ_STEPS,
  PAYMENT_METHODS,
  STORAGE_KEYS,
  DEFAULT_LANGUAGE,
  CURRENCY,
} from "@/components/checkout";

/**
 * Checkout Page Component
 * Handles the complete checkout flow including delivery details, order summary, and payment
 * Refactored for mobile-first responsiveness
 * @component
 */
function Checkout() {
  const { t } = useTranslation();
  const { cart } = useCart();

  const selectedLanguage = useMemo(
    () => localStorage.getItem(STORAGE_KEYS.LANGUAGE) || DEFAULT_LANGUAGE,
    [],
  );

  const {
    areas,
    isLoading,
    error,
    isSubmitting,
    isTestMode,
    formState,
    updateForm,
    updateDetails,
    confirmCliqPayment,
    orderSummary,
    handlePayment,
  } = useCheckoutLogic(t);

  // --- Memoized Handlers ---

  const handleOtpChange = useCallback(
    (value) => {
      updateForm("otp", value);
    },
    [updateForm],
  );

  const handleOtpCancel = useCallback(() => {
    updateForm("cliqStep", CLIQ_STEPS.INIT);
    updateForm("otp", "");
  }, [updateForm]);

  const handlePaymentMethodChange = useCallback(
    (method) => {
      updateForm("paymentMethod", method);
    },
    [updateForm],
  );

  // --- Memoized Values ---

  const submitButtonText = useMemo(() => {
    if (isSubmitting) return t("processing");
    return `${t("checkout_place_order")} • ${orderSummary.total.toFixed(2)} ${CURRENCY}`;
  }, [isSubmitting, orderSummary.total, t]);

  const submitButtonClass = useMemo(() => {
    return `w-full bg-gradient-to-r ${
      isSubmitting ? "from-gray-500 to-gray-600" : "from-gray-900 to-black"
    } text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed`;
  }, [isSubmitting]);

  // --- Render Loading State ---
  if (isLoading) {
    return <Loading />;
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 px-4 bg-gray-50">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-red-100">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <form
      className="min-h-screen bg-gray-50 pb-32 lg:pb-12"
      onSubmit={handlePayment}
    >
      {/* CliQ OTP Modal */}
      <CliqOtpModal
        isOpen={
          formState.paymentMethod === PAYMENT_METHODS.CLIQ &&
          formState.cliqStep === CLIQ_STEPS.OTP_SENT
        }
        otp={formState.otp}
        onOtpChange={handleOtpChange}
        onCancel={handleOtpCancel}
        onConfirm={confirmCliqPayment}
        isSubmitting={isSubmitting}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Page Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {t("complete_order")}
          </h1>
          {isTestMode && (
            <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold tracking-wide uppercase">
              Test Mode Active
            </span>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* LEFT COLUMN: Delivery Details */}
          <DeliverySection
            t={t}
            areas={areas}
            formState={formState}
            updateForm={updateForm}
            updateDetails={updateDetails}
            isTestMode={isTestMode}
          />

          {/* RIGHT COLUMN: Order Summary & Payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-sm">
                2
              </span>
              {t("checkout_order_summary")}
            </h2>

            {/* Order Items */}
            <OrderItemsList cart={cart} t={t} lang={selectedLanguage} />

            {/* Order Totals */}
            <div className="my-6 pt-6 border-t border-gray-100">
              <OrderTotals summary={orderSummary} t={t} />
            </div>

            {/* Payment Method Selector */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-800 mb-3 block">
                {t("payment_method")}
              </h3>
              <PaymentMethodSelector
                method={formState.paymentMethod}
                setMethod={handlePaymentMethodChange}
                t={t}
              />
            </div>

            {/* Desktop Submit Button (Hidden on Mobile) */}
            <div className="hidden lg:block">
              <button
                className={submitButtonClass}
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {submitButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Submit Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 safe-pb">
        <button
          className={submitButtonClass}
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}

export default Checkout;

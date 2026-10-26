import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { ORANGE_STEPS } from "./constants";

/**
 * Modal component for Orange Money / CliQ payment verification.
 * Fully translated and adapted to Zain's UI/UX style and colors.
 * @component
 */
const OrangeMoneyModal = React.memo(
  ({
    isOpen,
    step,
    phone,
    onPhoneChange,
    servicerCode,
    onServicerCodeChange,
    servicers,
    otp,
    onOtpChange,
    onSendOtp,
    onConfirm,
    onCancel,
    isSubmitting,
  }) => {
    const { t } = useTranslation();

    // --- Phone input handlers ---
    const handlePhoneChange = useCallback(
      (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
        onPhoneChange(value);
      },
      [onPhoneChange],
    );

    const isPhoneValid = phone && /^07[789]\d{7}$/.test(phone);

    const handlePhoneKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" && isPhoneValid && servicerCode) {
          e.preventDefault();
          onSendOtp();
        } else if (e.key === "Escape") {
          onCancel();
        }
      },
      [isPhoneValid, servicerCode, onSendOtp, onCancel],
    );

    // --- OTP input handlers ---
    const handleOtpChange = useCallback(
      (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        onOtpChange(value);
      },
      [onOtpChange],
    );

    const handleOtpKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" && otp.length >= 4) {
          onConfirm();
        } else if (e.key === "Escape") {
          onCancel();
        }
      },
      [otp, onConfirm, onCancel],
    );

    if (!isOpen) return null;

    const isBankStep = step === ORANGE_STEPS.SELECT_BANK;

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <div
          className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in border-t-4 border-red-600"
          onClick={(e) => e.stopPropagation()}
        >
          {isBankStep ? (
            /* ===== STEP 1: Phone & Bank/Wallet Selection ===== */
            <>
              <h3 className="font-bold text-lg mb-1 text-gray-900">
                {t("orange_modal.title_select_bank")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("orange_modal.desc_select_bank")}
              </p>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex-1 h-1.5 rounded-full bg-red-600" />
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 transition-colors duration-300" />
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("orange_modal.label_phone")}
              </label>
              <div className="relative mb-4">
                {/* <span className="absolute right-4 top-1/2 -translate-y-1-2 text-gray-400 text-sm font-mono select-none">
                  +962
                </span> */}
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="07XXXXXXXX"
                  className="w-full pl-4 pr-16 py-4 border-2 border-gray-200 rounded-xl text-lg font-mono tracking-wider focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all outline-none shadow-sm"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={handlePhoneKeyDown}
                  maxLength={10}
                  autoFocus
                  disabled={isSubmitting}
                  dir="ltr"
                />
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("orange_modal.label_bank")}
              </label>
              {servicers.length === 0 ? (
                <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
                  {t("orange_modal.loading_banks")}
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5 border-2 border-gray-100 rounded-xl p-2 mb-5">
                  {servicers.map((s, index) => {
                    const currentCode = s.servicerCode || s.ServicerCode;
                    const isSelected = servicerCode === currentCode;
                    return (
                      <div
                        key={currentCode || index}
                        onClick={() =>
                          !isSubmitting && onServicerCodeChange(currentCode)
                        }
                        className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-red-50 border-2 border-red-500"
                            : "hover:bg-gray-50 border-2 border-transparent"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "border-red-600" : "border-gray-400"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-red-600 rounded-full" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {s.descriptionAr ||
                            s.descriptionEn ||
                            s.DescriptionAr ||
                            s.DescriptionEn}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-4 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {t("orange_modal.btn_cancel")}
                </button>
                <button
                  type="button"
                  onClick={onSendOtp}
                  disabled={isSubmitting || !isPhoneValid || !servicerCode}
                  className={`flex-1 bg-gradient-to-r ${
                    isSubmitting
                      ? "from-red-400 to-red-500"
                      : "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  } text-white py-4 rounded-xl font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isSubmitting
                    ? t("orange_modal.btn_sending")
                    : t("orange_modal.btn_send_otp")}
                </button>
              </div>
            </>
          ) : (
            /* ===== STEP 2: OTP Verification ===== */
            <>
              <h3 className="font-bold text-lg mb-1 text-gray-900">
                {t("orange_modal.title_otp_input")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("orange_modal.desc_otp_input", { phone })}
              </p>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex-1 h-1.5 rounded-full bg-red-600" />
                <div className="flex-1 h-1.5 rounded-full bg-red-600 transition-colors duration-300" />
              </div>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="• • • • • •"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl mb-2 text-center text-3xl tracking-[0.5em] font-mono focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all outline-none shadow-sm"
                value={otp}
                onChange={handleOtpChange}
                onKeyDown={handleOtpKeyDown}
                maxLength={6}
                autoFocus
                disabled={isSubmitting}
              />

              <button
                type="button"
                onClick={onSendOtp}
                disabled={isSubmitting}
                className="text-xs text-red-600 hover:underline mb-5 block disabled:opacity-50 font-medium"
              >
                {t("orange_modal.btn_resend_otp")}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-4 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {t("orange_modal.btn_cancel")}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isSubmitting || otp.length < 4}
                  className={`flex-1 bg-gradient-to-r ${
                    isSubmitting
                      ? "from-red-400 to-red-500"
                      : "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  } text-white py-4 rounded-xl font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isSubmitting
                    ? t("orange_modal.btn_verifying")
                    : t("orange_modal.btn_confirm")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
);

OrangeMoneyModal.displayName = "OrangeMoneyModal";

OrangeMoneyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  step: PropTypes.string.isRequired,
  phone: PropTypes.string.isRequired,
  onPhoneChange: PropTypes.func.isRequired,
  servicerCode: PropTypes.string.isRequired,
  onServicerCodeChange: PropTypes.func.isRequired,
  servicers: PropTypes.array.isRequired,
  otp: PropTypes.string.isRequired,
  onOtpChange: PropTypes.func.isRequired,
  onSendOtp: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default OrangeMoneyModal;

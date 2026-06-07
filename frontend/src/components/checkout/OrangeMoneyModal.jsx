import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ORANGE_STEPS } from "./constants";

const OrangeMoneyModal = React.memo(({
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
  const handlePhoneChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    onPhoneChange(value);
  }, [onPhoneChange]);

  const handleOtpChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    onOtpChange(value);
  }, [onOtpChange]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (!isOpen) return null;

  const stepNumber = step === ORANGE_STEPS.SELECT_BANK ? 1 : step === ORANGE_STEPS.OTP_SENT ? 2 : 1;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleCancel}
    >
      <div
        className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-lg">🟠</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Orange Money / CliQ</h3>
            <p className="text-xs text-gray-500">
              {step === ORANGE_STEPS.SELECT_BANK
                ? "أدخل رقم المحفظة واختر البنك"
                : "أدخل رمز التحقق"}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1.5 rounded-full bg-orange-500" />
          <div className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
            step === ORANGE_STEPS.OTP_SENT ? "bg-orange-500" : "bg-gray-200"
          }`} />
        </div>

        {/* Step 1: Phone + Bank */}
        {step === ORANGE_STEPS.SELECT_BANK && (
          <div>
            {/* رقم التلفون */}
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رقم المحفظة
            </label>
            <div className="relative mb-4">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono select-none">
                +962
              </span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="07XXXXXXXX"
                className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-lg text-lg font-mono tracking-wider focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={10}
                autoFocus
                disabled={isSubmitting}
                dir="ltr"
              />
            </div>

            {/* اختيار البنك */}
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              البنك / المحفظة
            </label>
            {servicers.length === 0 ? (
              <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
                جاري تحميل البنوك...
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 rounded-lg p-2">
                {servicers.map((s) => (
                  <div
                    key={s.servicerCode}
                    onClick={() => !isSubmitting && onServicerCodeChange(s.servicerCode)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
                      servicerCode === s.servicerCode
                        ? "bg-orange-50 border border-orange-400"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      servicerCode === s.servicerCode ? "border-orange-500" : "border-gray-400"
                    }`}>
                      {servicerCode === s.servicerCode && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {s.descriptionAr || s.descriptionEn}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={onSendOtp}
                disabled={isSubmitting || phone.length < 9 || !servicerCode}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "جاري الإرسال..." : "أرسل الكود"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === ORANGE_STEPS.OTP_SENT && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رمز التحقق OTP
            </label>
            <p className="text-xs text-gray-400 mb-3">
              تم إرسال الكود على الرقم{" "}
              <span className="font-mono font-semibold text-gray-600" dir="ltr">
                {phone}
              </span>
            </p>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="• • • • • •"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 text-center text-3xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              autoFocus
              disabled={isSubmitting}
            />

            <button
              type="button"
              onClick={onSendOtp}
              disabled={isSubmitting}
              className="text-xs text-orange-500 hover:underline mb-4 block disabled:opacity-50"
            >
              لم يصلك الكود؟ أعد الإرسال
            </button>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting || otp.length < 4}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "جاري التحقق..." : "تأكيد الدفع"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

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
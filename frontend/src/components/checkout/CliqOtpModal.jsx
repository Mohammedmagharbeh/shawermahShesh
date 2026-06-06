import React, { useCallback } from "react";
import PropTypes from "prop-types";

/**
 * Modal component for CliQ payment verification.
 * Step 1: User enters a phone number (e.g. 0799635582)
 * Step 2: OTP is sent to that phone number and user enters it here
 * @component
 */
const CliqOtpModal = React.memo(
  ({
    isOpen,
    step,
    cliqPhone,
    onCliqPhoneChange,
    onSendOtp,
    otp,
    onOtpChange,
    onCancel,
    onConfirm,
    isSubmitting,
  }) => {
    // --- Phone input handlers ---
    const handlePhoneChange = useCallback(
      (e) => {
        // Allow only digits, max 10 characters (Jordanian mobile format)
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
        onCliqPhoneChange(value);
      },
      [onCliqPhoneChange],
    );

    const isPhoneValid = cliqPhone && /^07[789]\d{7}$/.test(cliqPhone);

    const handlePhoneKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" && isPhoneValid) {
          e.preventDefault();
          onSendOtp();
        } else if (e.key === "Escape") {
          onCancel();
        }
      },
      [isPhoneValid, onSendOtp, onCancel],
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

    const isPhoneStep = step === "PHONE_INPUT";

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <div
          className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in border-t-4 border-red-600"
          onClick={(e) => e.stopPropagation()}
        >
          {isPhoneStep ? (
            /* ===== STEP 1: Phone Number Input ===== */
            <>
              <h3 className="font-bold text-lg mb-4 text-gray-900">
                Enter Mobile Number
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Please enter the mobile number to receive the OTP verification
                code
              </p>

              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="07xxxxxxxxx"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl mb-2 text-lg tracking-wide font-mono focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all outline-none shadow-sm"
                value={cliqPhone}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                maxLength={10}
                autoFocus
                disabled={isSubmitting}
              />

              {cliqPhone.length > 0 && !isPhoneValid && (
                <p className="text-xs text-red-500 mb-3">
                  Enter a valid Jordanian mobile number (07xxxxxxxx)
                </p>
              )}
              {(cliqPhone.length === 0 || isPhoneValid) && (
                <div className="mb-3" />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-4 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSendOtp}
                  disabled={isSubmitting || !isPhoneValid}
                  className={`flex-1 bg-gradient-to-r ${isSubmitting ? "from-red-400 to-red-500" : "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"} text-white py-4 rounded-xl font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </>
          ) : (
            /* ===== STEP 2: OTP Verification ===== */
            <>
              <h3 className="font-bold text-lg mb-4 text-gray-900">
                Enter Verification Code
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Please enter the OTP code sent to{" "}
                <span className="font-semibold text-gray-800">{cliqPhone}</span>
              </p>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 4-digit OTP"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl mb-4 text-center text-3xl tracking-[0.5em] font-mono focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all outline-none shadow-sm"
                value={otp}
                onChange={handleOtpChange}
                onKeyDown={handleOtpKeyDown}
                maxLength={4}
                autoFocus
                disabled={isSubmitting}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-4 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isSubmitting || otp.length < 4}
                  className={`flex-1 bg-gradient-to-r ${isSubmitting ? "from-red-400 to-red-500" : "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"} text-white py-4 rounded-xl font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? "Verifying..." : "Confirm"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
);

CliqOtpModal.displayName = "CliqOtpModal";

CliqOtpModal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Current CliQ step: "PHONE_INPUT" or "OTP_SENT" */
  step: PropTypes.string.isRequired,
  /** Phone number entered for CliQ */
  cliqPhone: PropTypes.string.isRequired,
  /** Handler when CliQ phone changes */
  onCliqPhoneChange: PropTypes.func.isRequired,
  /** Handler to send OTP to the entered phone */
  onSendOtp: PropTypes.func.isRequired,
  /** Current OTP value */
  otp: PropTypes.string.isRequired,
  /** OTP change handler */
  onOtpChange: PropTypes.func.isRequired,
  /** Cancel handler */
  onCancel: PropTypes.func.isRequired,
  /** Confirm handler */
  onConfirm: PropTypes.func.isRequired,
  /** Whether submission is in progress */
  isSubmitting: PropTypes.bool.isRequired,
};

export default CliqOtpModal;

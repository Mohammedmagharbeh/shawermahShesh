import React, { useCallback } from "react";
import PropTypes from "prop-types";

/**
 * Modal component for CliQ OTP verification
 * @component
 */
const CliqOtpModal = React.memo(
  ({ isOpen, otp, onOtpChange, onCancel, onConfirm, isSubmitting }) => {
    // Memoize handlers to prevent recreation
    const handleOtpChange = useCallback(
      (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        onOtpChange(value);
      },
      [onOtpChange],
    );

    const handleKeyDown = useCallback(
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

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <div
          className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-bold text-lg mb-4 text-gray-900">
            Enter Verification Code
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Please enter the OTP code sent to your mobile number
          </p>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={otp}
            onChange={handleOtpChange}
            onKeyDown={handleKeyDown}
            maxLength={6}
            autoFocus
            disabled={isSubmitting}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting || otp.length < 4}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

CliqOtpModal.displayName = "CliqOtpModal";

CliqOtpModal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
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

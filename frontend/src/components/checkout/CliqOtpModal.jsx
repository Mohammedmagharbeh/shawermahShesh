// // import React, { useCallback } from "react";
// // import PropTypes from "prop-types";

// // /**
// //  * Modal component for CliQ OTP verification
// //  * @component
// //  */
// // const CliqOtpModal = React.memo(
// //   ({ isOpen, otp, onOtpChange, onCancel, onConfirm, isSubmitting }) => {
// //     // Memoize handlers to prevent recreation
// //     const handleOtpChange = useCallback(
// //       (e) => {
// //         const value = e.target.value.replace(/\D/g, "").slice(0, 6);
// //         onOtpChange(value);
// //       },
// //       [onOtpChange],
// //     );

// //     const handleKeyDown = useCallback(
// //       (e) => {
// //         if (e.key === "Enter" && otp.length >= 4) {
// //           onConfirm();
// //         } else if (e.key === "Escape") {
// //           onCancel();
// //         }
// //       },
// //       [otp, onConfirm, onCancel],
// //     );

// //     if (!isOpen) return null;

// //     return (
// //       <div
// //         className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
// //         onClick={onCancel}
// //       >
// //         <div
// //           className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in"
// //           onClick={(e) => e.stopPropagation()}
// //         >
// //           <h3 className="font-bold text-lg mb-4 text-gray-900">
// //             Enter Verification Code
// //           </h3>

// //           <p className="text-sm text-gray-600 mb-4">
// //             Please enter the OTP code sent to your mobile number
// //           </p>

// //           <input
// //             type="text"
// //             inputMode="numeric"
// //             pattern="[0-9]*"
// //             placeholder="Enter 6-digit OTP"
// //             className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500"
// //             value={otp}
// //             onChange={handleOtpChange}
// //             onKeyDown={handleKeyDown}
// //             maxLength={6}
// //             autoFocus
// //             disabled={isSubmitting}
// //           />

// //           <div className="flex gap-2">
// //             <button
// //               type="button"
// //               onClick={onCancel}
// //               disabled={isSubmitting}
// //               className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// //             >
// //               Cancel
// //             </button>
// //             <button
// //               type="button"
// //               onClick={onConfirm}
// //               disabled={isSubmitting || otp.length < 4}
// //               className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// //             >
// //               {isSubmitting ? "Verifying..." : "Confirm"}
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   },
// // );

// // CliqOtpModal.displayName = "CliqOtpModal";

// // CliqOtpModal.propTypes = {
// //   /** Whether the modal is open */
// //   isOpen: PropTypes.bool.isRequired,
// //   /** Current OTP value */
// //   otp: PropTypes.string.isRequired,
// //   /** OTP change handler */
// //   onOtpChange: PropTypes.func.isRequired,
// //   /** Cancel handler */
// //   onCancel: PropTypes.func.isRequired,
// //   /** Confirm handler */
// //   onConfirm: PropTypes.func.isRequired,
// //   /** Whether submission is in progress */
// //   isSubmitting: PropTypes.bool.isRequired,
// // };

// // export default CliqOtpModal;

// import React, { useCallback, useState } from "react";
// import PropTypes from "prop-types";

// const CliqOtpModal = React.memo(
//   ({ isOpen, otp, onOtpChange, onCancel, onConfirm, isSubmitting, onSendOtp }) => {
//     const [phone, setPhone] = useState("");
//     const [step, setStep] = useState("phone"); // "phone" | "otp"

//     const handlePhoneChange = useCallback((e) => {
//       const value = e.target.value.replace(/\D/g, "").slice(0, 10);
//       setPhone(value);
//     }, []);

//     const handleSendOtp = useCallback(() => {
//       if (phone.length >= 9) {
//         onSendOtp(phone); // أرسل الرقم للـ hook
//         setStep("otp");
//       }
//     }, [phone, onSendOtp]);

//     const handleOtpChange = useCallback(
//       (e) => {
//         const value = e.target.value.replace(/\D/g, "").slice(0, 6);
//         onOtpChange(value);
//       },
//       [onOtpChange],
//     );

//     const handleCancel = useCallback(() => {
//       setPhone("");
//       setStep("phone");
//       onCancel();
//     }, [onCancel]);

//     const handleKeyDown = useCallback(
//       (e) => {
//         if (step === "phone" && e.key === "Enter" && phone.length >= 9) {
//           handleSendOtp();
//         } else if (step === "otp" && e.key === "Enter" && otp.length >= 4) {
//           onConfirm();
//         } else if (e.key === "Escape") {
//           handleCancel();
//         }
//       },
//       [step, phone, otp, handleSendOtp, onConfirm, handleCancel],
//     );

//     if (!isOpen) return null;

//     return (
//       <div
//         className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
//         onClick={handleCancel}
//       >
//         <div
//           className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {step === "phone" ? (
//             <>
//               <h3 className="font-bold text-lg mb-2 text-gray-900">
//                 رقم محفظة CliQ
//               </h3>
//               <p className="text-sm text-gray-600 mb-4">
//                 أدخل رقم الهاتف المرتبط بمحفظة CliQ الخاصة بك
//               </p>
//               <input
//                 type="text"
//                 inputMode="numeric"
//                 placeholder="07XXXXXXXX"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center text-xl tracking-widest font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500"
//                 value={phone}
//                 onChange={handlePhoneChange}
//                 onKeyDown={handleKeyDown}
//                 maxLength={10}
//                 autoFocus
//                 disabled={isSubmitting}
//                 dir="ltr"
//               />
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold transition-colors"
//                 >
//                   إلغاء
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleSendOtp}
//                   disabled={phone.length < 9 || isSubmitting}
//                   className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   إرسال الكود
//                 </button>
//               </div>
//             </>
//           ) : (
//             <>
//               <h3 className="font-bold text-lg mb-2 text-gray-900">
//                 رمز التحقق
//               </h3>
//               <p className="text-sm text-gray-600 mb-1">
//                 تم إرسال رمز OTP إلى
//               </p>
//               <p className="text-sm font-bold text-red-600 mb-4 dir-ltr text-center">
//                 {phone}
//               </p>
//               <input
//                 type="text"
//                 inputMode="numeric"
//                 pattern="[0-9]*"
//                 placeholder="XXXXXX"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500"
//                 value={otp}
//                 onChange={handleOtpChange}
//                 onKeyDown={handleKeyDown}
//                 maxLength={6}
//                 autoFocus
//                 disabled={isSubmitting}
//               />
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => setStep("phone")}
//                   disabled={isSubmitting}
//                   className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
//                 >
//                   رجوع
//                 </button>
//                 <button
//                   type="button"
//                   onClick={onConfirm}
//                   disabled={isSubmitting || otp.length < 4}
//                   className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isSubmitting ? "جاري التحقق..." : "تأكيد"}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     );
//   },
// );

import React, { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";

const CliqOtpModal = React.memo(
  ({ isOpen, otp, onOtpChange, onCancel, onConfirm, isSubmitting, onSendOtp }) => {
    const [phone, setPhone] = useState("");
    const [step, setStep] = useState("phone"); // "phone" | "otp"

    // تأثير جانبي لتصفير الـ state فور إغلاق المودال
    useEffect(() => {
      if (!isOpen) {
        setPhone("");
        setStep("phone");
      }
    }, [isOpen]);

    const handlePhoneChange = useCallback((e) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
      setPhone(value);
    }, []);

    const handleSendOtp = useCallback(() => {
      if (phone.length >= 9) {
        onSendOtp(phone); // أرسل الرقم للـ hook
        setStep("otp");
      }
    }, [phone, onSendOtp]);

    const handleOtpChange = useCallback(
      (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        onOtpChange(value);
      },
      [onOtpChange],
    );

    const handleCancel = useCallback(() => {
      setPhone("");
      setStep("phone");
      onCancel();
    }, [onCancel]);

    const handleKeyDown = useCallback(
      (e) => {
        if (step === "phone" && e.key === "Enter" && phone.length >= 9) {
          handleSendOtp();
        } else if (step === "otp" && e.key === "Enter" && otp.length >= 4) {
          onConfirm();
        } else if (e.key === "Escape") {
          handleCancel();
        }
      },
      [step, phone, otp, handleSendOtp, onConfirm, handleCancel],
    );

    // ملاحظة: يجب وضع هذا الشرط دائماً بعد الـ Hooks وليس قبلها
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleCancel}
      >
        <div
          className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {step === "phone" ? (
            <>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                رقم محفظة CliQ
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                أدخل رقم الهاتف المرتبط بمحفظة CliQ الخاصة بك
              </p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="07XXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center text-xl tracking-widest font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={handleKeyDown}
                maxLength={10}
                autoFocus
                disabled={isSubmitting}
                dir="ltr"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={phone.length < 9 || isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إرسال الكود
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                رمز التحقق
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                تم إرسال رمز OTP إلى
              </p>
              <p className="text-sm font-bold text-red-600 mb-4 dir-ltr text-center">
                {phone}
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="XXXXXX"
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
                  onClick={() => setStep("phone")}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  رجوع
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isSubmitting || otp.length < 4}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "جاري التحقق..." : "تأكيد"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
);

CliqOtpModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  otp: PropTypes.string.isRequired,
  onOtpChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onSendOtp: PropTypes.func.isRequired,
};

export default CliqOtpModal;
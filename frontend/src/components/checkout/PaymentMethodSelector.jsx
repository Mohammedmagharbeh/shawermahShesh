// // // import React, { useCallback } from "react";
// // // import PropTypes from "prop-types";
// // // import cliq from "@/assets/cliq.png";
// // // import { PAYMENT_METHODS, PAYMENT_LOGOS } from "./constants";
// // // import { isValidImageUrl } from "@/utils/inputSanitization";

// // // /**
// // //  * Payment method selector component
// // //  * @component
// // //  */
// // // const PaymentMethodSelector = React.memo(({ method, setMethod, t }) => {
// // //   // Memoize click handlers
// // //   const handleCardClick = useCallback(() => {
// // //     setMethod(PAYMENT_METHODS.CARD);
// // //   }, [setMethod]);

// // //   const handleCliqClick = useCallback(() => {
// // //     setMethod(PAYMENT_METHODS.CLIQ);
// // //   }, [setMethod]);

// // //   return (
// // //     <div className="pt-6 border-t border-gray-200 mt-4">
// // //       <h3 className="font-semibold text-gray-900 mb-4 text-xs md:text-sm">
// // //         {t("checkout_payment_method")}
// // //       </h3>

// // //       <div className="space-y-2">
// // //         {/* Card Payment Option */}
// // //         <div
// // //           onClick={handleCardClick}
// // //           className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
// // //             method === PAYMENT_METHODS.CARD
// // //               ? "border-red-500 bg-red-50/30 shadow-sm"
// // //               : "border-gray-200 hover:border-red-300"
// // //           }`}
// // //           role="button"
// // //           tabIndex={0}
// // //           onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
// // //         >
// // //           {/* Radio Button */}
// // //           <div
// // //             className={`w-4 h-4 rounded-full border flex items-center justify-center ${
// // //               method === PAYMENT_METHODS.CARD
// // //                 ? "border-red-500"
// // //                 : "border-gray-400"
// // //             }`}
// // //           >
// // //             {method === PAYMENT_METHODS.CARD && (
// // //               <div className="w-2 h-2 bg-red-500 rounded-full" />
// // //             )}
// // //           </div>

// // //           {/* Label */}
// // //           <span className="flex-1 font-medium text-sm">
// // //             {t("checkout_card_payment")}
// // //           </span>

// // //           {/* Payment Logos */}
// // //           <div className="flex items-center gap-1.5">
// // //             {isValidImageUrl(PAYMENT_LOGOS.VISA) && (
// // //               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7 w-12">
// // //                 <img
// // //                   src={PAYMENT_LOGOS.VISA}
// // //                   className="h-3.5 w-auto object-contain"
// // //                   alt="Visa"
// // //                   loading="lazy"
// // //                 />
// // //               </span>
// // //             )}
// // //             {isValidImageUrl(PAYMENT_LOGOS.MASTERCARD) && (
// // //               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
// // //                 <img
// // //                   src={PAYMENT_LOGOS.MASTERCARD}
// // //                   className="h-5 w-auto object-contain"
// // //                   alt="Mastercard"
// // //                   loading="lazy"
// // //                 />
// // //               </span>
// // //             )}
// // //             {isValidImageUrl(PAYMENT_LOGOS.ApplePay) && (
// // //               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
// // //                 <img
// // //                   src={PAYMENT_LOGOS.ApplePay}
// // //                   className="h-5 w-auto object-contain"
// // //                   alt="Mastercard"
// // //                   loading="lazy"
// // //                 />
// // //               </span>
// // //             )}
// // //           </div>
// // //         </div>

// // //         {/* CliQ Payment Option — Disabled (Coming Soon) */}
// // //         <div
// // //           className="relative flex items-center gap-2 p-3 border rounded-xl border-gray-200 opacity-50 cursor-not-allowed select-none"
// // //           role="button"
// // //           aria-disabled="true"
// // //           tabIndex={-1}
// // //         {/* CliQ Payment Option — Coming Soon */}
// // //         <div
// // //           className="relative flex items-center gap-2 p-3 border rounded-xl cursor-not-allowed transition-all border-gray-200 bg-gray-50 opacity-60 select-none"
// // //           role="button"
// // //           aria-disabled="true"
// // //         >
// // //           {/* Coming Soon Badge */}
// // //           <span
// // //             className="absolute -top-2 right-3 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full text-white shadow-md"
// // //             style={{
// // //               background: "linear-gradient(135deg, #6b7280, #374151)",
// // //               letterSpacing: "0.12em",
// // //             }}
// // //           >
// // //             Coming Soon
// // //           </span>

// // //           {/* Radio Button (always unselected) */}
// // //           <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center" />

// // //           {/* Label */}
// // //           <span className="flex-1 font-medium text-sm text-gray-400">
// // //           {/* Radio Button */}
// // //           <div className="w-4 h-4 rounded-full border flex items-center justify-center border-gray-300 bg-gray-100"></div>

// // //           {/* Label */}
// // //           <span className="flex-1 font-medium text-sm text-gray-500">
// // //             {t("checkout_click_payment")}
// // //           </span>

// // //           {/* CliQ Logo */}
// // //           <img src={cliq} className="w-8 grayscale" alt="CliQ" loading="lazy" />
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // });

// // // PaymentMethodSelector.displayName = "PaymentMethodSelector";

// // // PaymentMethodSelector.propTypes = {
// // //   /** Currently selected payment method */
// // //   method: PropTypes.oneOf([PAYMENT_METHODS.CARD, PAYMENT_METHODS.CLIQ])
// // //     .isRequired,
// // //   /** Payment method change handler */
// // //   setMethod: PropTypes.func.isRequired,
// // //   /** Translation function */
// // //   t: PropTypes.func.isRequired,
// // // };


// // import React, { useCallback } from "react";
// // import PropTypes from "prop-types";
// // import cliq from "@/assets/cliq.png";
// // import download from "@/assets/download.jpg";
// // import { PAYMENT_METHODS, PAYMENT_LOGOS } from "./constants";
// // import { isValidImageUrl } from "@/utils/inputSanitization";

// // /**
// //  * Payment method selector component
// //  * @component
// //  */
// // const PaymentMethodSelector = React.memo(({ method, setMethod, t }) => {
// //   // Memoize click handlers
// //   const handleCardClick = useCallback(() => {
// //     setMethod(PAYMENT_METHODS.CARD);
// //   }, [setMethod]);

// //   const handleCliqClick = useCallback(() => {
// //     setMethod(PAYMENT_METHODS.CLIQ);
// //   }, [setMethod]);

// //   return (
// //     <div className="pt-6 border-t border-gray-200 mt-4">
// //       <h3 className="font-semibold text-gray-900 mb-4 text-xs md:text-sm">
// //         {t("checkout_payment_method")}
// //       </h3>

// //       <div className="space-y-2">
// //         {/* Card Payment Option */}
// //         <div
// //           onClick={handleCardClick}
// //           className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
// //             method === PAYMENT_METHODS.CARD
// //               ? "border-red-500 bg-red-50/30 shadow-sm"
// //               : "border-gray-200 hover:border-red-300"
// //           }`}
// //           role="button"
// //           tabIndex={0}
// //           onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
// //         >
// //           {/* Radio Button */}
// //           <div
// //             className={`w-4 h-4 rounded-full border flex items-center justify-center ${
// //               method === PAYMENT_METHODS.CARD
// //                 ? "border-red-500"
// //                 : "border-gray-400"
// //             }`}
// //           >
// //             {method === PAYMENT_METHODS.CARD && (
// //               <div className="w-2 h-2 bg-red-500 rounded-full" />
// //             )}
// //           </div>

// //           {/* Label */}
// //           <span className="flex-1 font-medium text-sm">
// //             {t("checkout_card_payment")}
// //           </span>

// //           {/* Payment Logos */}
// //           <div className="flex items-center gap-1.5">
// //             {isValidImageUrl(PAYMENT_LOGOS.VISA) && (
// //               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7 w-12">
// //                 <img
// //                   src={PAYMENT_LOGOS.VISA}
// //                   className="h-3.5 w-auto object-contain"
// //                   alt="Visa"
// //                   loading="lazy"
// //                 />
// //               </span>
// //             )}
// //             {isValidImageUrl(PAYMENT_LOGOS.MASTERCARD) && (
// //               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
// //                 <img
// //                   src={PAYMENT_LOGOS.MASTERCARD}
// //                   className="h-5 w-auto object-contain"
// //                   alt="Mastercard"
// //                   loading="lazy"
// //                 />
// //               </span>
// //             )}
// //             {isValidImageUrl(PAYMENT_LOGOS.ApplePay) && (
// //               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
// //                 <img
// //                   src={PAYMENT_LOGOS.ApplePay}
// //                   className="h-5 w-auto object-contain"
// //                   alt="Apple Pay"
// //                   loading="lazy"
// //                 />
// //               </span>
// //             )}
// //           </div>
// //         </div>

// //         {/* CliQ Payment Option — تم التفعيل بنجاح */}
// //         <div
// //           onClick={handleCliqClick}
// //           className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
// //             method === PAYMENT_METHODS.CLIQ
// //               ? "border-red-500 bg-red-50/30 shadow-sm"
// //               : "border-gray-200 hover:border-red-300"
// //           }`}
// //           role="button"
// //           tabIndex={0}
// //           onKeyDown={(e) => e.key === "Enter" && handleCliqClick()}
// //         >
// //           {/* Radio Button */}
// //           <div
// //             className={`w-4 h-4 rounded-full border flex items-center justify-center ${
// //               method === PAYMENT_METHODS.CLIQ
// //                 ? "border-red-500"
// //                 : "border-gray-400"
// //             }`}
// //           >
// //             {method === PAYMENT_METHODS.CLIQ && (
// //               <div className="w-2 h-2 bg-red-500 rounded-full" />
// //             )}
// //           </div>

// //           {/* Label */}
// //           <span className="flex-1 font-medium text-sm">
// //             {t("checkout_click_payment")}
// //           </span>

// //           {/* CliQ Logo — تمت إزالة الـ grayscale */}
// //           <img src={download} className="w-8" alt="CliQ" loading="lazy" />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // });

// // PaymentMethodSelector.displayName = "PaymentMethodSelector";

// // PaymentMethodSelector.propTypes = {
// //   /** Currently selected payment method */
// //   method: PropTypes.oneOf([PAYMENT_METHODS.CARD, PAYMENT_METHODS.CLIQ])
// //     .isRequired,
// //   /** Payment method change handler */
// //   setMethod: PropTypes.func.isRequired,
// //   /** Translation function */
// //   t: PropTypes.func.isRequired,
// // };

// // export default PaymentMethodSelector;


// // // import React, { useCallback } from "react";
// // // import PropTypes from "prop-types";
// // // import cliq from "@/assets/cliq.png";
// // // import { PAYMENT_METHODS, PAYMENT_LOGOS } from "./constants";
// // // import { isValidImageUrl } from "@/utils/inputSanitization";

// // // /**
// // //  * Payment method selector component
// // //  * @component
// // //  */
// // // const PaymentMethodSelector = React.memo(({ method, setMethod, t }) => {
// // //   // Memoize click handlers
// // //   const handleCardClick = useCallback(() => {
// // //     setMethod(PAYMENT_METHODS.CARD);
// // //   }, [setMethod]);

// // //   return (
// // //     <div className="pt-6 border-t border-gray-200 mt-4">
// // //       <h3 className="font-semibold text-gray-900 mb-4 text-xs md:text-sm">
// // //         {t("checkout_payment_method")}
// // //       </h3>

// // //       <div className="space-y-2">
// // //         {/* Card Payment Option */}
// // //         <div
// // //           onClick={handleCardClick}
// // //           className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
// // //             method === PAYMENT_METHODS.CARD
// // //               ? "border-red-500 bg-red-50/30 shadow-sm"
// // //               : "border-gray-200 hover:border-red-300"
// // //           }`}
// // //           role="button"
// // //           tabIndex={0}
// // //           onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
// // //         >
// // //           {/* Radio Button */}
// // //           <div
// // //             className={`w-4 h-4 rounded-full border flex items-center justify-center ${
// // //               method === PAYMENT_METHODS.CARD
// // //                 ? "border-red-500"
// // //                 : "border-gray-400"
// // //             }`}
// // //           >
// // //             {method === PAYMENT_METHODS.CARD && (
// // //               <div className="w-2 h-2 bg-red-500 rounded-full" />
// // //             )}
// // //           </div>

// // //           {/* Label */}
// // //           <span className="flex-1 font-medium text-sm">
// // //             {t("checkout_card_payment")}
// // //           </span>

// // //           {/* Payment Logos */}
// // //           <div className="flex items-center gap-1.5">
// // //             {isValidImageUrl(PAYMENT_LOGOS.VISA) && (
// // //               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7 w-12">
// // //                 <img
// // //                   src={PAYMENT_LOGOS.VISA}
// // //                   className="h-3.5 w-auto object-contain"
// // //                   alt="Visa"
// // //                   loading="lazy"
// // //                 />
// // //               </span>
// // //             )}
// // //             {isValidImageUrl(PAYMENT_LOGOS.MASTERCARD) && (
// // //               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
// // //                 <img
// // //                   src={PAYMENT_LOGOS.MASTERCARD}
// // //                   className="h-5 w-auto object-contain"
// // //                   alt="Mastercard"
// // //                   loading="lazy"
// // //                 />
// // //               </span>
// // //             )}
// // //             {isValidImageUrl(PAYMENT_LOGOS.ApplePay) && (
// // //               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
// // //                 <img
// // //                   src={PAYMENT_LOGOS.ApplePay}
// // //                   className="h-5 w-auto object-contain"
// // //                   alt="Apple Pay"
// // //                   loading="lazy"
// // //                 />
// // //               </span>
// // //             )}
// // //           </div>
// // //         </div>

// // //         {/* CliQ Payment Option — Coming Soon */}
// // //         <div
// // //           className="relative flex items-center gap-2 p-3 border rounded-xl cursor-not-allowed transition-all border-gray-200 bg-gray-50 opacity-60 select-none"
// // //           role="button"
// // //           aria-disabled="true"
// // //         >
// // //           {/* Coming Soon Badge */}
// // //           <span
// // //             className="absolute -top-2 right-3 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full text-white shadow-md"
// // //             style={{
// // //               background: "linear-gradient(135deg, #6b7280, #374151)",
// // //               letterSpacing: "0.12em",
// // //             }}
// // //           >
// // //             Coming Soon
// // //           </span>

// // //           {/* Radio Button (always unselected) */}
// // //           <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center" />

// // //           {/* Label */}
// // //           <span className="flex-1 font-medium text-sm text-gray-500">
// // //             {t("checkout_click_payment")}
// // //           </span>

// // //           {/* CliQ Logo */}
// // //           <img 
// // //             src={cliq} 
// // //             className="w-8 grayscale object-contain" 
// // //             alt="CliQ" 
// // //             loading="lazy" 
// // //           />
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // });

// // // PaymentMethodSelector.displayName = "PaymentMethodSelector";

// // // PaymentMethodSelector.propTypes = {
// // //   method: PropTypes.oneOf([PAYMENT_METHODS.CARD, PAYMENT_METHODS.CLIQ]).isRequired,
// // //   setMethod: PropTypes.func.isRequired,
// // //   t: PropTypes.func.isRequired,
// // // };

// // // export default PaymentMethodSelector;



// import React, { useCallback } from "react";
// import PropTypes from "prop-types";
// import cliq from "@/assets/cliq.png";
// import download from "@/assets/download.jpg";
// import { PAYMENT_METHODS, PAYMENT_LOGOS } from "./constants";
// import { isValidImageUrl } from "@/utils/inputSanitization";

// const PaymentMethodSelector = React.memo(({ method, setMethod, t }) => {
//   const handleCardClick = useCallback(() => setMethod(PAYMENT_METHODS.CARD), [setMethod]);
//   const handleCliqClick = useCallback(() => setMethod(PAYMENT_METHODS.CLIQ), [setMethod]);
//   const handleOrangeClick = useCallback(() => setMethod(PAYMENT_METHODS.ORANGE_MONEY), [setMethod]);

//   const optionClass = (active) =>
//     `flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
//       active
//         ? "border-red-500 bg-red-50/30 shadow-sm"
//         : "border-gray-200 hover:border-red-300"
//     }`;

//   const radioClass = (active) =>
//     `w-4 h-4 rounded-full border flex items-center justify-center ${
//       active ? "border-red-500" : "border-gray-400"
//     }`;

//   return (
//     <div className="pt-6 border-t border-gray-200 mt-4">
//       <h3 className="font-semibold text-gray-900 mb-4 text-xs md:text-sm">
//         {t("checkout_payment_method")}
//       </h3>

//       <div className="space-y-2">
//         {/* Card Payment */}
//         <div
//           onClick={handleCardClick}
//           className={optionClass(method === PAYMENT_METHODS.CARD)}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
//         >
//           <div className={radioClass(method === PAYMENT_METHODS.CARD)}>
//             {method === PAYMENT_METHODS.CARD && (
//               <div className="w-2 h-2 bg-red-500 rounded-full" />
//             )}
//           </div>
//           <span className="flex-1 font-medium text-sm">
//             {t("checkout_card_payment")}
//           </span>
//           <div className="flex items-center gap-1.5">
//             {isValidImageUrl(PAYMENT_LOGOS.VISA) && (
//               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7 w-12">
//                 <img src={PAYMENT_LOGOS.VISA} className="h-3.5 w-auto object-contain" alt="Visa" loading="lazy" />
//               </span>
//             )}
//             {isValidImageUrl(PAYMENT_LOGOS.MASTERCARD) && (
//               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
//                 <img src={PAYMENT_LOGOS.MASTERCARD} className="h-5 w-auto object-contain" alt="Mastercard" loading="lazy" />
//               </span>
//             )}
//             {isValidImageUrl(PAYMENT_LOGOS.ApplePay) && (
//               <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
//                 <img src={PAYMENT_LOGOS.ApplePay} className="h-5 w-auto object-contain" alt="Apple Pay" loading="lazy" />
//               </span>
//             )}
//           </div>
//         </div>

//         {/* CliQ / ZainCash */}
//         <div
//           onClick={handleCliqClick}
//           className={optionClass(method === PAYMENT_METHODS.CLIQ)}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === "Enter" && handleCliqClick()}
//         >
//           <div className={radioClass(method === PAYMENT_METHODS.CLIQ)}>
//             {method === PAYMENT_METHODS.CLIQ && (
//               <div className="w-2 h-2 bg-red-500 rounded-full" />
//             )}
//           </div>
//           <span className="flex-1 font-medium text-sm">
//             {t("checkout_click_payment")}
//           </span>
//           <img src={download} className="w-8" alt="CliQ" loading="lazy" />
//         </div>

//         {/* Orange Money */}
//         <div
//           onClick={handleOrangeClick}
//           className={optionClass(method === PAYMENT_METHODS.ORANGE_MONEY)}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === "Enter" && handleOrangeClick()}
//         >
//           <div className={radioClass(method === PAYMENT_METHODS.ORANGE_MONEY)}>
//             {method === PAYMENT_METHODS.ORANGE_MONEY && (
//               <div className="w-2 h-2 bg-red-500 rounded-full" />
//             )}
//           </div>
//           <span className="flex-1 font-medium text-sm">
//             Orange Money
//           </span>
//           <div className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7">
//             <span className="text-orange-500 font-bold text-xs">🟠 Orange</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });

// PaymentMethodSelector.displayName = "PaymentMethodSelector";

// PaymentMethodSelector.propTypes = {
//   method: PropTypes.oneOf([
//     PAYMENT_METHODS.CARD,
//     PAYMENT_METHODS.CLIQ,
//     PAYMENT_METHODS.ORANGE_MONEY,
//   ]).isRequired,
//   setMethod: PropTypes.func.isRequired,
//   t: PropTypes.func.isRequired,
// };

// export default PaymentMethodSelector;

import React, { useCallback } from "react";
import PropTypes from "prop-types";
import download from "@/assets/download.jpg";
import { PAYMENT_METHODS, PAYMENT_LOGOS } from "./constants";
import { isValidImageUrl } from "@/utils/inputSanitization";

const ORANGE_MIN_AMOUNT = 15; // الحد الأدنى للدفع عبر Orange Money

const PaymentMethodSelector = React.memo(({ method, setMethod, t, totalAmount }) => {
  const handleCardClick = useCallback(() => setMethod(PAYMENT_METHODS.CARD), [setMethod]);
  const handleCliqClick = useCallback(() => setMethod(PAYMENT_METHODS.CLIQ), [setMethod]);

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
    `w-4 h-4 rounded-full border flex items-center justify-center ${
      active ? "border-red-500" : "border-gray-400"
    }`;

  return (
    <div className="pt-6 border-t border-gray-200 mt-4">
      <h3 className="font-semibold text-gray-900 mb-4 text-xs md:text-sm">
        {t("checkout_payment_method")}
      </h3>

      <div className="space-y-2">
        {/* Card Payment */}
        <div
          onClick={handleCardClick}
          className={optionClass(method === PAYMENT_METHODS.CARD)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
        >
          <div className={radioClass(method === PAYMENT_METHODS.CARD)}>
            {method === PAYMENT_METHODS.CARD && (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
          <span className="flex-1 font-medium text-sm">
            {t("checkout_card_payment")}
          </span>
          <div className="flex items-center gap-1.5">
            {isValidImageUrl(PAYMENT_LOGOS.VISA) && (
              <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7 w-12">
                <img src={PAYMENT_LOGOS.VISA} className="h-3.5 w-auto object-contain" alt="Visa" loading="lazy" />
              </span>
            )}
            {isValidImageUrl(PAYMENT_LOGOS.MASTERCARD) && (
              <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
                <img src={PAYMENT_LOGOS.MASTERCARD} className="h-5 w-auto object-contain" alt="Mastercard" loading="lazy" />
              </span>
            )}
            {isValidImageUrl(PAYMENT_LOGOS.ApplePay) && (
              <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-1.5 py-1 shadow-sm h-7 w-12">
                <img src={PAYMENT_LOGOS.ApplePay} className="h-5 w-auto object-contain" alt="Apple Pay" loading="lazy" />
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
          className={optionClass(method === PAYMENT_METHODS.ORANGE_MONEY, !isOrangeAvailable)}
          role="button"
          tabIndex={isOrangeAvailable ? 0 : -1}
          aria-disabled={!isOrangeAvailable}
          onKeyDown={(e) => e.key === "Enter" && handleOrangeClick()}
        >
          <div className={radioClass(method === PAYMENT_METHODS.ORANGE_MONEY)}>
            {method === PAYMENT_METHODS.ORANGE_MONEY && isOrangeAvailable && (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <span className="font-medium text-sm">Orange Money</span>
            {/* رسالة توضيحية لما المبلغ أقل من الحد الأدنى */}
            {!isOrangeAvailable && (
              <p className="text-xs text-gray-400 mt-0.5">
                الحد الأدنى للدفع عبر Orange Money هو {ORANGE_MIN_AMOUNT} دينار
              </p>
            )}
          </div>
          <div className="inline-flex items-center justify-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm h-7">
            <span className="text-orange-500 font-bold text-xs">🟠 Orange</span>
          </div>
        </div>
      </div>
    </div>
  );
});

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
};

export default PaymentMethodSelector;

// import { useState } from "react";
// import { CheckCircle2, XCircle, Loader2, Tag } from "lucide-react";

// export default function PromoCodeInput({
//   appliedPromo,
//   onApply,
//   onRemove,
//   isSubmitting,
//   t,
// }) {
//   const [code, setCode] = useState("");
//   const [checking, setChecking] = useState(false);
//   const [error, setError] = useState("");

//   const handleApply = async () => {
//     if (!code.trim()) return;
//     setChecking(true);
//     setError("");
//     try {
//       await onApply(code.trim().toUpperCase());
//       setCode("");
//     } catch (err) {
//       setError(err?.message || t("promo_invalid") || "الكود غير صالح");
//     } finally {
//       setChecking(false);
//     }
//   };

//   if (appliedPromo) {
//     return (
//       <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
//         <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
//           <CheckCircle2 className="w-4 h-4" />
//           {appliedPromo.code} ({appliedPromo.discountPercentage}%{" "}
//           {t("discount") || "خصم"})
//         </div>
//         <button
//           type="button"
//           onClick={onRemove}
//           className="text-red-500 text-sm font-medium hover:underline"
//         >
//           {t("remove") || "إزالة"}
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="mb-4">
//       <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
//         <Tag className="w-4 h-4" />
//         {t("have_promo_code") || "عندك كود خصم؟"}
//       </h3>
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//           placeholder={t("promo_code_placeholder") || "ادخل الكود هون"}
//           disabled={isSubmitting || checking}
//           className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
//         />
//         <button
//           type="button"
//           onClick={handleApply}
//           disabled={isSubmitting || checking || !code.trim()}
//           className="bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 whitespace-nowrap"
//         >
//           {checking ? (
//             <Loader2 className="w-4 h-4 animate-spin" />
//           ) : (
//             t("apply") || "تطبيق"
//           )}
//         </button>
//       </div>
//       {error && (
//         <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
//           <XCircle className="w-3.5 h-3.5" /> {error}
//         </p>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Tag } from "lucide-react";

export default function PromoCodeInput({
  appliedPromo,
  onApply,
  onRemove,
  isSubmitting,
  t,
}) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setChecking(true);
    setError("");
    try {
      await onApply(code.trim().toUpperCase());
      setCode("");
    } catch (err) {
      setError(err?.message || t("promo_invalid") || "الكود غير صالح");
    } finally {
      setChecking(false);
    }
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          {appliedPromo.code} ({appliedPromo.discountPercentage}%{" "}
          {t("discount") || "خصم"})
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 text-sm font-medium hover:underline"
        >
          {t("remove") || "إزالة"}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <Tag className="w-4 h-4" />
        {t("have_promo_code") || "عندك كود خصم؟"}
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("promo_code_placeholder") || "ادخل الكود هون"}
          disabled={isSubmitting || checking}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isSubmitting || checking || !code.trim()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 whitespace-nowrap"
        >
          {checking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t("apply") || "تطبيق"
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
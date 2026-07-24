// // import { useState, useEffect, useCallback } from "react";
// // import { useTranslation } from "react-i18next";
// // import { Trash2, Tag, Loader2 } from "lucide-react";
// // import { useUser } from "@/contexts/UserContext";
// // import PromoService from "@/services/promoService";
// // import toast from "react-hot-toast";

// // export default function PromoCodeManagement() {
// //   const { t } = useTranslation();
// //   const { user } = useUser();
// //   const [promoCodes, setPromoCodes] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [code, setCode] = useState("");
// //   const [discount, setDiscount] = useState("");
// //   const [submitting, setSubmitting] = useState(false);

// //   const fetchPromoCodes = useCallback(async () => {
// //     if (!user?.token) return;
// //     setLoading(true);
// //     try {
// //       const data = await PromoService.fetchPromoCodes(user.token);
// //       setPromoCodes(Array.isArray(data) ? data : []);
// //     } catch (err) {
// //       toast.error(t("promo_fetch_error") || "فشل تحميل أكواد الخصم");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [user?.token, t]);

// //   useEffect(() => {
// //     fetchPromoCodes();
// //   }, [fetchPromoCodes]);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!code.trim()) {
// //       toast.error(t("promo_code_required") || "الرجاء إدخال الكود");
// //       return;
// //     }
// //     const pct = Number(discount);
// //     if (!pct || pct <= 0 || pct > 100) {
// //       toast.error(
// //         t("promo_invalid_percentage") || "النسبة يجب أن تكون بين 1 و 100",
// //       );
// //       return;
// //     }

// //     setSubmitting(true);
// //     try {
// //       const newPromo = await PromoService.createPromoCode(
// //         {
// //           code: code.trim().toUpperCase(),
// //           discountPercentage: pct,
// //           isActive: true,
// //         },
// //         user.token,
// //       );
// //       setPromoCodes((prev) => [newPromo, ...prev]);
// //       setCode("");
// //       setDiscount("");
// //       toast.success(t("promo_created") || "تم إنشاء الكود بنجاح");
// //     } catch (err) {
// //       toast.error(
// //         err?.response?.data?.message ||
// //           t("promo_create_error") ||
// //           "فشل إنشاء الكود (ربما مستخدم مسبقًا)",
// //       );
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleToggle = async (id, isActive) => {
// //     try {
// //       const updated = await PromoService.toggleActive(
// //         id,
// //         !isActive,
// //         user.token,
// //       );
// //       setPromoCodes((prev) =>
// //         prev.map((p) => (p._id === id ? updated : p)),
// //       );
// //     } catch (err) {
// //       toast.error(t("promo_update_error") || "فشل التحديث");
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     try {
// //       await PromoService.deletePromoCode(id, user.token);
// //       setPromoCodes((prev) => prev.filter((p) => p._id !== id));
// //       toast.success(t("promo_deleted") || "تم الحذف");
// //     } catch (err) {
// //       toast.error(t("promo_delete_error") || "فشل الحذف");
// //     }
// //   };

// //   return (
// //     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
// //       <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
// //         <Tag className="w-5 h-5" />
// //         {t("promo_codes") || "أكواد الخصم"}
// //       </h2>

// //       <form
// //         onSubmit={handleSubmit}
// //         className="flex flex-col sm:flex-row gap-3 mb-5"
// //       >
// //         <input
// //           type="text"
// //           placeholder={t("promo_code_placeholder") || "الكود، مثال: SUMMER25"}
// //           value={code}
// //           onChange={(e) => setCode(e.target.value.toUpperCase())}
// //           className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
// //         />
// //         <input
// //           type="number"
// //           min="1"
// //           max="100"
// //           placeholder={t("discount_percentage") || "نسبة الخصم %"}
// //           value={discount}
// //           onChange={(e) => setDiscount(e.target.value)}
// //           className="w-full sm:w-40 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
// //         />
// //         <button
// //           type="submit"
// //           disabled={submitting}
// //           className="bg-gray-900 text-white rounded-xl px-5 py-2.5 font-semibold disabled:opacity-60"
// //         >
// //           {submitting ? (
// //             <Loader2 className="w-5 h-5 animate-spin mx-auto" />
// //           ) : (
// //             t("add") || "إضافة"
// //           )}
// //         </button>
// //       </form>

// //       {loading ? (
// //         <p className="text-gray-500 text-sm">
// //           {t("loading") || "جاري التحميل..."}
// //         </p>
// //       ) : promoCodes.length === 0 ? (
// //         <p className="text-gray-500 text-sm">
// //           {t("no_promo_codes") || "لا يوجد أكواد خصم حاليًا"}
// //         </p>
// //       ) : (
// //         <div className="space-y-2">
// //           {promoCodes.map((p) => (
// //             <div
// //               key={p._id}
// //               className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
// //             >
// //               <div className="flex items-center gap-3">
// //                 <span className="font-mono font-bold text-gray-900">
// //                   {p.code}
// //                 </span>
// //                 <span className="text-sm text-gray-600">
// //                   {p.discountPercentage}%
// //                 </span>
// //               </div>
// //               <div className="flex items-center gap-3">
// //                 <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
// //                   <input
// //                     type="checkbox"
// //                     checked={p.isActive}
// //                     onChange={() => handleToggle(p._id, p.isActive)}
// //                   />
// //                   {t("active") || "مفعّل"}
// //                 </label>
// //                 <button
// //                   onClick={() => handleDelete(p._id)}
// //                   className="text-red-500 hover:text-red-700"
// //                   aria-label="delete"
// //                   type="button"
// //                 >
// //                   <Trash2 className="w-4 h-4" />
// //                 </button>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import { useState, useEffect, useCallback } from "react";
// import { useTranslation } from "react-i18next";
// import { Trash2, Tag } from "lucide-react";
// import { useUser } from "@/contexts/UserContext";
// import PromoService from "@/services/promoService";
// import toast from "react-hot-toast";

// export default function PromoCodeManagement() {
//   const { t } = useTranslation();
//   const { user } = useUser();
//   const [promoCodes, setPromoCodes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [code, setCode] = useState("");
//   const [discount, setDiscount] = useState("");
//   const [maxUses, setMaxUses] = useState(""); // ✅ فاضي = بدون حد أقصى
//   const [submitting, setSubmitting] = useState(false);

//   const fetchPromoCodes = useCallback(async () => {
//     if (!user?.token) return;
//     setLoading(true);
//     try {
//       const data = await PromoService.fetchPromoCodes(user.token);
//       setPromoCodes(Array.isArray(data) ? data : []);
//     } catch (err) {
//       toast.error(t("promo_fetch_error") || "فشل تحميل أكواد الخصم");
//     } finally {
//       setLoading(false);
//     }
//   }, [user?.token, t]);

//   useEffect(() => {
//     fetchPromoCodes();
//   }, [fetchPromoCodes]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!code.trim()) {
//       toast.error(t("promo_code_required") || "الرجاء إدخال الكود");
//       return;
//     }
//     const pct = Number(discount);
//     if (!pct || pct <= 0 || pct > 100) {
//       toast.error(
//         t("promo_invalid_percentage") || "النسبة يجب أن تكون بين 1 و 100",
//       );
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const newPromo = await PromoService.createPromoCode(
//         {
//           code: code.trim().toUpperCase(),
//           discountPercentage: pct,
//           isActive: true,
//           maxUsesPerUser: maxUses.trim() ? Number(maxUses) : null,
//         },
//         user.token,
//       );
//       setPromoCodes((prev) => [newPromo, ...prev]);
//       setCode("");
//       setDiscount("");
//       setMaxUses("");
//       toast.success(t("promo_created") || "تم إنشاء الكود بنجاح");
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message ||
//           t("promo_create_error") ||
//           "فشل إنشاء الكود (ربما مستخدم مسبقًا)",
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleToggle = async (id, isActive) => {
//     try {
//       const updated = await PromoService.toggleActive(
//         id,
//         !isActive,
//         user.token,
//       );
//       setPromoCodes((prev) =>
//         prev.map((p) => (p._id === id ? updated : p)),
//       );
//     } catch (err) {
//       toast.error(t("promo_update_error") || "فشل التحديث");
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await PromoService.deletePromoCode(id, user.token);
//       setPromoCodes((prev) => prev.filter((p) => p._id !== id));
//       toast.success(t("promo_deleted") || "تم الحذف");
//     } catch (err) {
//       toast.error(t("promo_delete_error") || "فشل الحذف");
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
//       <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//         <Tag className="w-5 h-5" />
//         {t("promo_codes") || "أكواد الخصم"}
//       </h2>

//       <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-5">
//         <div className="flex flex-col sm:flex-row gap-3">
//           <input
//             type="text"
//             placeholder={t("promo_code_placeholder") || "الكود، مثال: SUMMER25"}
//             value={code}
//             onChange={(e) => setCode(e.target.value.toUpperCase())}
//             className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
//           />
//           <input
//             type="number"
//             min="1"
//             max="100"
//             placeholder={t("discount_percentage") || "نسبة الخصم %"}
//             value={discount}
//             onChange={(e) => setDiscount(e.target.value)}
//             className="w-full sm:w-40 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
//           />
//         </div>

//         {/* ✅ حقل الحد الأقصى لعدد مرات الاستخدام لكل زبون */}
//         <div>
//           <input
//             type="number"
//             min="1"
//             placeholder={
//               t("max_uses_per_user") ||
//               "الحد الأقصى للاستخدام لكل زبون (اختياري)"
//             }
//             value={maxUses}
//             onChange={(e) => setMaxUses(e.target.value)}
//             className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
//           />
//           <p className="text-xs text-gray-400 mt-1">
//             {t("max_uses_hint") || "اتركه فاضي للاستخدام بدون حد أقصى"}
//           </p>
//         </div>

//         <button
//           type="submit"
//           disabled={submitting}
//           className="bg-gray-900 text-white rounded-xl px-5 py-2.5 font-semibold disabled:opacity-60"
//         >
//           {submitting ? t("loading") || "..." : t("add") || "إضافة"}
//         </button>
//       </form>

//       {loading ? (
//         <p className="text-gray-500 text-sm">
//           {t("loading") || "جاري التحميل..."}
//         </p>
//       ) : promoCodes.length === 0 ? (
//         <p className="text-gray-500 text-sm">
//           {t("no_promo_codes") || "لا يوجد أكواد خصم حاليًا"}
//         </p>
//       ) : (
//         <div className="space-y-2">
//           {promoCodes.map((p) => (
//             <div
//               key={p._id}
//               className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 flex-wrap gap-2"
//             >
//               <div className="flex items-center gap-3 flex-wrap">
//                 <span className="font-mono font-bold text-gray-900">
//                   {p.code}
//                 </span>
//                 <span className="text-sm text-gray-600">
//                   {p.discountPercentage}%
//                 </span>
//                 {/* ✅ شارة الحد الأقصى إذا موجود */}
//                 {!!p.maxUsesPerUser && (
//                   <span className="text-xs bg-amber-100 text-amber-800 rounded-md px-2 py-0.5">
//                     {t("max_uses_badge", { count: p.maxUsesPerUser }) ||
//                       `الحد: ${p.maxUsesPerUser} مرة`}
//                   </span>
//                 )}
//               </div>
//               <div className="flex items-center gap-3">
//                 <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={p.isActive}
//                     onChange={() => handleToggle(p._id, p.isActive)}
//                   />
//                   {t("active") || "مفعّل"}
//                 </label>
//                 <button
//                   onClick={() => handleDelete(p._id)}
//                   className="text-red-500 hover:text-red-700"
//                   aria-label="delete"
//                   type="button"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Tag } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import PromoService from "@/services/promoService";
import toast from "react-hot-toast";

export default function PromoCodeManagement() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [maxUses, setMaxUses] = useState(""); // ✅ فاضي = بدون حد أقصى
  const [submitting, setSubmitting] = useState(false);

  const fetchPromoCodes = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const data = await PromoService.fetchPromoCodes(user.token);
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(t("promo_fetch_error") || "فشل تحميل أكواد الخصم");
    } finally {
      setLoading(false);
    }
  }, [user?.token, t]);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error(t("promo_code_required") || "الرجاء إدخال الكود");
      return;
    }
    const pct = Number(discount);
    if (!pct || pct <= 0 || pct > 100) {
      toast.error(
        t("promo_invalid_percentage") || "النسبة يجب أن تكون بين 1 و 100",
      );
      return;
    }

    setSubmitting(true);
    try {
      const newPromo = await PromoService.createPromoCode(
        {
          code: code.trim().toUpperCase(),
          discountPercentage: pct,
          isActive: true,
          maxUsesPerUser: maxUses.trim() ? Number(maxUses) : null,
        },
        user.token,
      );
      setPromoCodes((prev) => [newPromo, ...prev]);
      setCode("");
      setDiscount("");
      setMaxUses("");
      toast.success(t("promo_created") || "تم إنشاء الكود بنجاح");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          t("promo_create_error") ||
          "فشل إنشاء الكود (ربما مستخدم مسبقًا)",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      const updated = await PromoService.toggleActive(
        id,
        !isActive,
        user.token,
      );
      setPromoCodes((prev) =>
        prev.map((p) => (p._id === id ? updated : p)),
      );
    } catch (err) {
      toast.error(t("promo_update_error") || "فشل التحديث");
    }
  };

  const handleDelete = async (id) => {
    try {
      await PromoService.deletePromoCode(id, user.token);
      setPromoCodes((prev) => prev.filter((p) => p._id !== id));
      toast.success(t("promo_deleted") || "تم الحذف");
    } catch (err) {
      toast.error(t("promo_delete_error") || "فشل الحذف");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5" />
        {t("promo_codes") || "أكواد الخصم"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={t("promo_code_placeholder") || "الكود، مثال: SUMMER25"}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <input
            type="number"
            min="1"
            max="100"
            placeholder={t("discount_percentage") || "نسبة الخصم %"}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full sm:w-40 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* ✅ حقل الحد الأقصى لعدد مرات الاستخدام لكل زبون */}
        <div>
          <input
            type="number"
            min="1"
            placeholder={
              t("max_uses_per_users") ||
              "الحد الأقصى للاستخدام لكل زبون (اختياري)"
            }
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-400 mt-1">
            {t("max_uses_hint") || "اتركه فاضي للاستخدام بدون حد أقصى"}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-gray-900 text-white rounded-xl px-5 py-2.5 font-semibold disabled:opacity-60"
        >
          {submitting ? t("loading") || "..." : t("add") || "إضافة"}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">
          {t("loading") || "جاري التحميل..."}
        </p>
      ) : promoCodes.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {t("no_promo_codes") || "لا يوجد أكواد خصم حاليًا"}
        </p>
      ) : (
        <div className="space-y-2">
          {promoCodes.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 flex-wrap gap-2"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono font-bold text-gray-900">
                  {p.code}
                </span>
                <span className="text-sm text-gray-600">
                  {p.discountPercentage}%
                </span>
                {/* ✅ شارة الحد الأقصى إذا موجود */}
                {!!p.maxUsesPerUser && (
                  <span className="text-xs bg-amber-100 text-amber-800 rounded-md px-2 py-0.5">
                    {t("max_uses_badge", { count: p.maxUsesPerUser }) ||
                      `الحد: ${p.maxUsesPerUser} مرة`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.isActive}
                    onChange={() => handleToggle(p._id, p.isActive)}
                  />
                  {t("active") || "مفعّل"}
                </label>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="delete"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useCallback, useEffect } from "react";
import api from "@/utils/api"; // عدّل المسار حسب اسم ملف الـ axios/fetch instance عندك

export function usePromoCodes(t) {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/promo-codes");
      setPromoCodes(data);
    } catch (err) {
      setError(t("promo_fetch_error") || "فشل تحميل أكواد الخصم");
    } finally {
      setLoading(false);
    }
  }, [t]);

  const createPromoCode = useCallback(
    async ({ code, discountPercentage, isActive = true, expiryDate = null }) => {
      const { data } = await api.post("/promo-codes", {
        code: code.trim().toUpperCase(),
        discountPercentage: Number(discountPercentage),
        isActive,
        expiryDate,
      });
      setPromoCodes((prev) => [data, ...prev]);
      return data;
    },
    [],
  );

  const deletePromoCode = useCallback(async (id) => {
    await api.delete(`/promo-codes/${id}`);
    setPromoCodes((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const toggleActive = useCallback(async (id, isActive) => {
    const { data } = await api.patch(`/promo-codes/${id}`, { isActive });
    setPromoCodes((prev) => prev.map((p) => (p._id === id ? data : p)));
  }, []);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  return {
    promoCodes,
    loading,
    error,
    fetchPromoCodes,
    createPromoCode,
    deletePromoCode,
    toggleActive,
  };
}
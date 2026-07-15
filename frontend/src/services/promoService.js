import axios from "axios";

// ✅ نفس اسم المتغير المستخدم بباقي المشروع، وهو أصلاً فيه /api بآخره
const API_URL = import.meta.env.VITE_BASE_URL;

const apiClient = axios.create({
  baseURL: API_URL,
});

const PromoService = {
  // للأدمن: جلب كل الأكواد
  fetchPromoCodes: async (token) => {
    const { data } = await apiClient.get("/promo-codes", {
      headers: { authorization: `Bearer ${token}` },
    });
    return data;
  },

  // للأدمن: إنشاء كود جديد
  createPromoCode: async (payload, token) => {
    const { data } = await apiClient.post("/promo-codes", payload, {
      headers: { authorization: `Bearer ${token}` },
    });
    return data;
  },

  // للأدمن: تفعيل/تعطيل كود
  toggleActive: async (id, isActive, token) => {
    const { data } = await apiClient.patch(
      `/promo-codes/${id}`,
      { isActive },
      { headers: { authorization: `Bearer ${token}` } },
    );
    return data;
  },

  // للأدمن: حذف كود
  deletePromoCode: async (id, token) => {
    await apiClient.delete(`/promo-codes/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return id;
  },

  // للزبون: التحقق من صلاحية الكود
  validatePromoCode: async (code) => {
    const { data } = await apiClient.get("/promo-codes/validate", {
      params: { code },
    });
    return data;
  },
};

export default PromoService;
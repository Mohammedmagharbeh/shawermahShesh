import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export function useProducts(baseUrl, t) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/products`);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error(t("fetch_products_error"));
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (payload) => {
    const res = await axios.post(`${baseUrl}/admin/postfood`, payload);
    setProducts((prev) => [res.data, ...prev]);
    toast.success(t("product_added"));
  };

  const updateProduct = async (id, payload) => {
    const res = await axios.put(`${baseUrl}/admin/updatefood/${id}`, payload);
    setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    toast.success(t("product_updated"));
  };

  const deleteProduct = async (id) => {
    await axios.delete(`${baseUrl}/admin/deletefood/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
    toast.success(t("product_deleted"));
  };

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}

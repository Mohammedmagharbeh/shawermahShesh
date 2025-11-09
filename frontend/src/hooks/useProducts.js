import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";

export function useProducts(t, selectedCategory) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/products?category=${selectedCategory}`,
        {
          headers: {
            authorization: `Bearer ${user.token}`,
          },
        }
      );
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (payload) => {
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/admin/postfood`,
      payload
    );
    setProducts((prev) => [res.data, ...prev]);
    toast.success(t("product_added"));
  };

  const updateProduct = async (id, payload) => {
    const res = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/admin/updatefood/${id}`,
      payload
    );
    setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    toast.success(t("product_updated"));
  };

  const deleteProduct = async (id) => {
    await axios.delete(
      `${import.meta.env.VITE_BASE_URL}/admin/deletefood/${id}`
    );
    setProducts((prev) => prev.filter((p) => p._id !== id));
    toast.success(t("product_deleted"));
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}

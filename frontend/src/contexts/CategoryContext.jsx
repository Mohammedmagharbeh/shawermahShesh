import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useUser } from "./UserContext";
import { useTranslation } from "react-i18next";

const CategoryContext = createContext(undefined);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { t } = useTranslation();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/categories`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setCategories(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategory = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/categories/${id}`,
        {
          headers: { authorization: `Bearer ${user.token}` },
        }
      );

      return res.data.data;
    } catch (error) {
      console.error(error);
      toast.error(error.message || "something went wrong");
    }
  };

  // --- Add Category ---
  const addCategory = async (name) => {
    try {
      setLoading(true);
      const payload = { name };
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/categories`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        }
      );
      setCategories((prev) => [...prev, res.data]);

      toast.success(t("category_added"));
    } catch (error) {
      console.error(
        "Error adding category:",
        error.response?.data || error.message
      );
      toast.error(t("error_adding_category"));
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Category ---
  const deleteCategory = async (categoryId) => {
    if (!window.confirm(t("confirm_delete_category"))) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/categories/${categoryId}`,
        {
          headers: { authorization: `Bearer ${user.token}` },
        }
      );
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
      if (categoryId === categories.find((c) => c._id === categoryId)) {
      }
      toast.success(t("category_deleted"));
    } catch (error) {
      console.error(
        "Error deleting category:",
        error.response?.data || error.message
      );
      toast.error(t("error_deleting_category"));
    }
  };

  // --- Update Category ---
  const updateCategory = async (name, id) => {
    try {
      setLoading(true);
      const payload = {
        name,
      };
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/categories/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        }
      );
      setCategories((prev) => prev.map((c) => (c._id === id ? res.data : c)));

      toast.success(t("category_updated_success"));
    } catch (error) {
      console.error(
        "Error updating category:",
        error.response?.data || error.message
      );
      toast.error(t("error_updating_category"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        setCategories,
        fetchCategories,
        getCategory,
        addCategory,
        deleteCategory,
        updateCategory,
        categoriesLoading: loading,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error(
      "useCategoryContext must be used within a CategoryProvider"
    );
  }
  return context;
};

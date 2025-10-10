import { createContext, useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "./UserContext";
import { useTranslation } from "react-i18next";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const { t } = useTranslation();

  const API_URL = `${import.meta.env.VITE_BASE_URL}/order`; // change to your backend URL

  // 🔹 Get all orders (admin use)
  const getAllOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/get`);
      setOrders(res.data.data);
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.message || t("failed_fetch_orders");

      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get orders by userId
  const getOrdersByUserId = async () => {
    if (!user || !user?._id) {
      const msg = t("user_not_logged_in");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/user/${user._id}`);
      setOrders(res.data.data);
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.message || t("failed_fetch_user_orders");

      setError(err.response?.data?.message || "Failed to fetch user orders");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get single order by id
  const getOrderById = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      setError(null);
      return res.data.data; // return directly without overwriting state
    } catch (err) {
      const msg = err.response?.data?.message || t("failed_fetch_order");
      setError(msg || "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Create new order
  const createOrder = async (orderData) => {
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/post`, orderData);
      setOrders((prev) => [...prev, res.data.data]); // append new order
      setError(null);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order");
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update order
  const updateOrder = async (id, updates) => {
    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/${id}`, updates);
      setOrders((prev) =>
        prev.map((order) => (order._id === id ? res.data : order))
      );
      setError(null);
      toast.success(t("order_updated_success"));

      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || t("failed_update_order");

      setError(err.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete order
  const deleteOrder = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setOrders((prev) => prev.filter((order) => order._id !== id));
      setError(null);
      toast.success(t("order_deleted_success"));
    } catch (err) {
      const msg = err.response?.data?.message || t("failed_update_order");
      setError(msg || "Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        getAllOrders,
        getOrdersByUserId,
        getOrderById,
        createOrder,
        updateOrder,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

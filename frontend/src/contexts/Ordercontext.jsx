import { createContext, useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "./UserContext";
import { useTranslation } from "react-i18next";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const { t } = useTranslation();

  const API_URL = `${import.meta.env.VITE_BASE_URL || "http://localhost:5000/api"}/order`;

  const getAllOrders = async ({
    page = 1,
    limit = 30,
    status,
    search,
  } = {}) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (search) params.search = search;

      const res = await axios.get(`${API_URL}/get`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
        params,
      });
      setOrders(res.data.data);
      setOrdersPagination({
        total: res.data.total,
        page: res.data.page,
        pages: res.data.pages,
      });
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || t("failed_fetch_orders"));
    } finally {
      setLoading(false);
    }
  };

  const getOrdersStats = async (period = "all") => {
    try {
      const res = await axios.get(`${API_URL}/stats`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
        params: { period },
      });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order stats");
      return { totalRevenue: 0, totalOrders: 0, userStats: [] };
    }
  };

  const getTodayOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/today`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
      });
      setOrders(res.data.data);
      setError(null);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch today's orders");
    } finally {
      setLoading(false);
    }
  };

  const appendOrder = (order) => {
    setOrders((prev) => {
      const exists = prev?.some((o) => o._id === order._id);
      return exists ? prev : [order, ...(prev || [])];
    });
  };

  const patchOrder = (updatedOrder) => {
    setOrders((prev) =>
      (prev || []).map((o) => (o._id === updatedOrder._id ? updatedOrder : o)),
    );
  };

  const getOrdersByUserId = async (id = user?._id) => {
    if (!user || !id) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/user/${id}`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
      });
      setOrders(res.data.data);
      setError(null);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user orders");
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
      });
      setError(null);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/post`, orderData, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
      });
      setOrders((prev) => [...prev, res.data.data]);
      setError(null);
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create order";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, updates) => {
    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/${id}`, updates, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
      });
      setOrders((prev) =>
        prev.map((order) => (order._id === id ? res.data : order)),
      );
      setError(null);
      toast.success(t("order_updated_success"));
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update order";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
      });
      setOrders((prev) => prev.filter((order) => order._id !== id));
      setError(null);
      toast.success(t("order_deleted_success"));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete order");
      toast.error("Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        ordersPagination,
        loading,
        error,
        getAllOrders,
        getOrdersStats,
        getTodayOrders,
        appendOrder,
        patchOrder,
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
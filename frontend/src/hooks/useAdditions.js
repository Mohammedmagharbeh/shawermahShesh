import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export function useAdditions(baseUrl, t) {
  const [additions, setAdditions] = useState([]);

  useEffect(() => {
    fetchAdditions();
  }, []);

  const fetchAdditions = async () => {
    try {
      const res = await axios.get(`${baseUrl}/additions`);
      setAdditions(res.data.additions || []);
    } catch (err) {
      console.error("Error fetching additions:", err);
    }
  };

  const addAddition = async (data) => {
    const res = await axios.post(`${baseUrl}/additions`, data);
    setAdditions([res.data, ...additions]);
    toast.success(t("Add Addition"));
  };

  const updateAddition = async (id, data) => {
    const res = await axios.put(`${baseUrl}/additions/${id}`, data);
    setAdditions(additions.map((a) => (a._id === id ? res.data : a)));
    toast.success(t("edit_addition"));
  };

  const deleteAddition = async (id) => {
    await axios.delete(`${baseUrl}/additions/${id}`);
    setAdditions(additions.filter((a) => a._id !== id));
    toast.success(t("addition_deleted"));
  };

  return { additions, addAddition, updateAddition, deleteAddition };
}

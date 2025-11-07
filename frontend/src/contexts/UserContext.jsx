import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const { t } = useTranslation();

  const login = (userData) => {
    sessionStorage.setItem("token", userData.token);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updatePhone = async (newPhone, navigate) => {
    if (!user) throw new Error("No user logged in");

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/update-phone`,
        { newPhone }, // this is the body data
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (res.data.msg === "OTP sent to your phone") {
        toast.success(t("otp_sent"));
        // move to otp-verification page with state
        navigate("/otp-verification", {
          state: { phone: user.phone, newPhone, newPhone },
        });
      }
      setUser({ ...user, phone: newPhone });
    } catch (error) {
      console.error("Failed to update phone number:", error);
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`);
      if (!res.status === 200) {
        throw new Error("Failed to fetch users");
      }

      setAllUsers(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(t(error));
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        allUsers,
        login,
        logout,
        updatePhone,
        getAllUsers,

        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const { t } = useTranslation();

  // ✅ Load user from sessionStorage on mount
  useEffect(() => {
    const savedUser = JSON.parse(sessionStorage.getItem("user"));
    if (savedUser) setUser(savedUser);
    setLoading(false);
  }, []);

  const login = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    toast.error(t("session_expired") || "Session expired, please log in again");
  };

  // ✅ Axios interceptor for expired tokens
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (err.message.includes("Invalid token")) {
          logout(); // log the user out
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const updatePhone = async (newPhone, navigate) => {
    if (!user) throw new Error("No user logged in");

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/update-phone`,
        { newPhone },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (res.data.msg === "OTP sent to your phone") {
        toast.success(t("otp_sent"));
        navigate("/otp-verification", {
          state: { phone: user.phone, newPhone },
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
      if (res.status !== 200) throw new Error("Failed to fetch users");
      setAllUsers(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(t("error_fetching_users"));
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

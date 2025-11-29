import axios from "axios";
import Cookies from "js-cookie";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const COOKIE_KEY = "user";
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";

  const persistUser = useCallback(
    (value) => {
      if (!value) {
        Cookies.remove(COOKIE_KEY);
        return;
      }

      Cookies.set(COOKIE_KEY, JSON.stringify(value), {
        expires: 1,
        sameSite: "Strict",
        secure: isHttps,
      });
    },
    [COOKIE_KEY, isHttps]
  );
  const { t } = useTranslation();

  const logout = useCallback(() => {
    persistUser(null);
    setUser(null);
    toast.error(t("session_expired") || "Session expired, please log in again");
  }, [persistUser, t]);

  const syncUserWithServer = useCallback(
    async (token) => {
      if (!token) return null;

      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/me`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const normalizedUser = { ...res.data, token };
        setUser(normalizedUser);
        persistUser(normalizedUser);
        return normalizedUser;
      } catch (error) {
        console.error("Failed to sync user with server:", error);
        logout();
        return null;
      }
    },
    [logout, persistUser]
  );

  // ✅ Load user from cookies on mount and revalidate with the server
  useEffect(() => {
    let isMounted = true;

    const initializeUser = async () => {
      const savedUser = Cookies.get(COOKIE_KEY);

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (isMounted) {
            setUser(parsedUser);
          }
          await syncUserWithServer(parsedUser.token);
        } catch (err) {
          console.warn("Failed to parse user cookie, clearing it", err);
          Cookies.remove(COOKIE_KEY);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initializeUser();

    return () => {
      isMounted = false;
    };
  }, [COOKIE_KEY, syncUserWithServer]);

  const login = (userData) => {
    persistUser(userData);
    setUser(userData);
    syncUserWithServer(userData.token);
  };

  // ✅ Set up axios interceptor + fetch wrapper to handle "Invalid token" responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check if the error response contains "Invalid token"
        const errorMessage =
          error.response?.data ||
          error.response?.data?.message ||
          error.message ||
          "";

        // Convert to string for comparison (handles both string and object responses)
        const errorString =
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage);

        if (
          errorString.includes("Invalid token") ||
          (error.response?.status === 403 &&
            errorString.toLowerCase().includes("invalid token"))
        ) {
          logout();
        }

        return Promise.reject(error);
      }
    );

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 403) {
        try {
          const cloned = response.clone();
          const contentType = cloned.headers.get("content-type") || "";
          let payload = "";

          if (contentType.includes("application/json")) {
            const data = await cloned.json();
            payload = typeof data === "string" ? data : JSON.stringify(data);
          } else {
            payload = await cloned.text();
          }

          if (payload.toLowerCase().includes("invalid token")) {
            logout();
          }
        } catch (err) {
          console.error("Failed to inspect fetch response:", err);
        }
      }

      return response;
    };

    // Cleanup: remove interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
      window.fetch = originalFetch;
    };
  }, [logout]);

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

      const updatedUser = { ...user, phone: newPhone };
      setUser(updatedUser);
      persistUser(updatedUser);
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
        refreshUser: () => syncUserWithServer(user?.token),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

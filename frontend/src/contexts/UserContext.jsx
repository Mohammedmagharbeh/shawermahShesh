import axios from "axios";
import Cookies from "js-cookie";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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

  const { t } = useTranslation();

  const userRef = useRef(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const persistUser = useCallback(
    (value) => {
      if (!value) {
        Cookies.remove(COOKIE_KEY);
        return;
      }
// تعديل التوكن
      Cookies.set(COOKIE_KEY, JSON.stringify(value), {
        expires: 365,
        sameSite: "Strict",
        secure: isHttps,
      });
    },
    [COOKIE_KEY, isHttps],
  );

  const logout = useCallback(async () => {
    const currentUser = userRef.current;
    if (currentUser?.role === "rider" && currentUser?.token) {
      try {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/delivery/rider-logout`,
          {},
          { headers: { authorization: `Bearer ${currentUser.token}` } }
        );
      } catch (e) {
        console.warn("Failed to notify server of rider logout:", e?.message);
      }
    }
    persistUser(null);
    setUser(null);
    // مسح أي بيانات أخرى قد تؤثر على الدخول القادم
    window.location.href = "/";
  }, [persistUser]);

  const syncUserWithServer = useCallback(
    async (token) => {
      if (!token) return null;

      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/me`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        // ✅ التعديل هنا: نأخذ كل شيء من السيرفر (بما في ذلك الـ role الحقيقي)
        // ونضيف عليه التوكن يدوياً لأن السيرفر غالباً لا يرجعه في راوت /me
        const normalizedUser = {
          ...res.data,
          token: token,
          // نضمن أن الاسم يظهر سواء كان مخزن بـ name أو username
          username: res.data.username || res.data.name,
        };

        setUser(normalizedUser);
        persistUser(normalizedUser);
        return normalizedUser;
      } catch (error) {
        console.error("Failed to sync user with server:", error);
        // إذا كان الخطأ بسبب صلاحية التوكن، نقوم بتسجيل الخروج
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        }
        return null;
      }
    },
    [logout, persistUser],
  );

  // ✅ التحميل عند تشغيل التطبيق أول مرة
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
          // التأكد من صحة البيانات والـ role من السيرفر
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
  }, [syncUserWithServer]);

  // ✅ دالة الدخول المعدلة
  const login = async (userData) => {
    // 1. تخزين البيانات الأولية القادمة من صفحة الدخول فوراً
    setUser(userData);
    persistUser(userData);

    // 2. تحديث البيانات من السيرفر فوراً للتأكد من الـ Role الصحيح
    await syncUserWithServer(userData.token);
  };

  // ✅ Axios Interceptor لمعالجة انتهاء الجلسة (مع استثناء محاولات تسجيل الدخول)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const requestUrl = String(error.config?.url || "").toLowerCase();
        const isAuthEndpoint =
          requestUrl.includes("login") ||
          requestUrl.includes("employee-login") ||
          requestUrl.includes("register") ||
          requestUrl.includes("otp");

        const errorMessage =
          error.response?.data?.message || error.response?.data || "";
        const errorString =
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage);

        // لا نقوم بتسجيل الخروج إذا كان الخطأ 401 نتيجة إدخال بيانات خاطئة في شاشات تسجيل الدخول
        if (
          !isAuthEndpoint &&
          (error.response?.status === 401 ||
            errorString.toLowerCase().includes("invalid token") ||
            errorString.toLowerCase().includes("jwt expired"))
        ) {
          logout();
          toast.error(t("session_expired"));
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout, t]);

  const updatePhone = async (newPhone, navigate) => {
    if (!user) throw new Error("No user logged in");
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/update-phone`,
        { newPhone },
        {
          headers: {
            authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (res.data.msg === "OTP sent to your phone") {
        toast.success(t("otp_sent"));
        navigate("/otp-verification", {
          state: { phone: user.phone, newPhone },
        });
      }
    } catch (error) {
      console.error("Failed to update phone number:", error);
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/users/all`,
        {
          headers: { authorization: `Bearer ${user?.token}` },
        },
      );
      // /users/all returns a flat array directly
      setAllUsers(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching users:", error);
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

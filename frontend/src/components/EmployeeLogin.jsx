import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

function EmployeeLogin() {
  const { t, i18n } = useTranslation();
  const [employeeName, setEmployeeName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();

  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const checkStatus = () => {
      const hour = new Date().getHours();
      if (hour >= 3 && hour < 10) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    document.body.style.background = "#b80505";
    return () => {
      document.body.style.background = "";
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // هنا يمكنك إضافة توجيه تلقائي إذا كان المستخدم مسجل دخول أصلاً
      // navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isOpen) {
      toast.error(t("restaurant_closed_msg"));
      return;
    }

    if (!employeeName.trim() || !password.trim()) {
      toast.error(t("fill_all_fields"));
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/employee-login`,
        {
          name: employeeName,
          password: password,
        },
      );

      if (res.data.token) {
        // التعديل هنا يا غالي: نأخذ الرول من res.data.user.role وليس كلمة "employee" ثابتة
        const userRole = res.data.user.role;

        login({
          _id: res.data.user._id,
          username: res.data.user.name,
          token: res.data.token,
          role: userRole, // هكذا سيتعرف عليه النظام كمدير إذا كان روله admin
        });

        toast.success(t("success_login"));

        // توجيه ذكي بناءً على الرول
        if (userRole === "admin" || userRole === "employee") {
          navigate("/admin/dashboard");
        } else if (userRole === "rider") {
          navigate("/rider");
        } else if (userRole === "cashier") {
          navigate("/admin/dispatch");
        } else {
          navigate("/products");
        }
      }
    } catch (error) {
      console.error("Employee login failed:", error);
      const serverMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === "string" ? error.response.data : null);
      toast.error(
        serverMsg ||
          t(
            "error_invalid_credentials",
            "اسم المستخدم أو كلمة المرور غير صحيحة",
          ),
        { duration: 4000 },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-[#b80505] p-4 font-sans"
      dir={direction}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-[#dc0606] rounded-3xl shadow-2xl border border-red-700 text-center"
      >
        <div className="flex justify-center mb-6">
          {isOpen ? (
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-1.5 rounded-full border border-green-500/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-green-100 text-xs font-bold uppercase tracking-wider">
                {t("system_open")}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full border border-white/20">
              <span className="h-3 w-3 rounded-full bg-gray-400"></span>
              <span className="text-gray-200 text-xs font-bold uppercase tracking-wider">
                {t("system_closed")}
              </span>
            </div>
          )}
        </div>

        <div className="mx-auto w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
          <User className="h-10 w-10 text-[#dc0606]" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {t("employee_login_title")}
        </h1>
        <p className="text-red-100 text-sm mb-8 opacity-80">
          {t("employee_login_subtitle")}
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <div
              className={`absolute inset-y-0 ${direction === "rtl" ? "right-4" : "left-4"} flex items-center pointer-events-none`}
            >
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder={t("employee_name_placeholder")}
              className={`w-full p-4 ${direction === "rtl" ? "pr-12" : "pl-12"} bg-white rounded-2xl text-black font-semibold focus:ring-4 focus:ring-yellow-400/50 outline-none transition-all shadow-inner`}
              required
            />
          </div>

          <div className="relative">
            <div
              className={`absolute inset-y-0 ${direction === "rtl" ? "right-4" : "left-4"} flex items-center pointer-events-none`}
            >
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password")}
              className={`w-full p-4 ${direction === "rtl" ? "pr-12" : "pl-12"} bg-white rounded-2xl text-black font-semibold focus:ring-4 focus:ring-yellow-400/50 outline-none transition-all shadow-inner`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 ${direction === "rtl" ? "left-4" : "right-4"} flex items-center text-gray-400 hover:text-gray-600`}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <motion.button
            type="submit"
            whileHover={isOpen && !loading ? { scale: 1.02 } : {}}
            whileTap={isOpen && !loading ? { scale: 0.98 } : {}}
            className={`w-full py-4 mt-2 rounded-2xl font-bold text-lg shadow-xl transition-all flex justify-center items-center gap-2 ${
              isOpen
                ? "bg-yellow-400 text-black hover:bg-yellow-500 shadow-yellow-900/20"
                : "bg-gray-500 text-gray-200 cursor-not-allowed opacity-70"
            }`}
            disabled={loading || !isOpen}
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              t("login")
            )}
          </motion.button>
        </form>

        <p className="mt-8 text-white/60 text-xs italic">
          {t("employee_security_notice")}
        </p>

        {/* العودة لتسجيل دخول الزبائن */}
        <div className="mt-5 pt-4 border-t border-white/20">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-white/80 hover:text-white text-xs font-bold underline transition-colors"
          >
            {t("back_to_customer_login", "العودة إلى تسجيل دخول الزبائن")} ➔
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default EmployeeLogin;

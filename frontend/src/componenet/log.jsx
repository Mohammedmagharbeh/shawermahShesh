
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function Login() {
  const [phone, setphone] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // إدارة حالة فتح/إغلاق المطعم وتنسيقات الصفحة
  useEffect(() => {
    const checkStatus = () => {
      const hour = new Date().getHours();
      // مغلق من الساعة 3:00 فجراً حتى 9:59 صباحاً
      if (hour >= 3 && hour < 10) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkStatus();
    // فحص الوقت كل دقيقة لتحديث الحالة تلقائياً
    const interval = setInterval(checkStatus, 60000);

    document.body.style.background = "#b80505";
    return () => {
      document.body.style.background = "";
      clearInterval(interval);
    };
  }, []);

  const Loginhandler = async (e) => {
    e.preventDefault();

    // 1. منع الدخول إذا كان المطعم مغلقاً برمجياً
    if (!isOpen) {
      toast.error(t("restaurant_closed_msg"), {
        duration: 6000,
        icon: '🌙',
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#b80505',
          fontWeight: '600',
          direction: 'rtl',
          border: '2px solid #b80505'
        },
      });
      return;
    }

    // 2. التحقق من الحظر المؤقت في المتصفح
    const lockUntil = localStorage.getItem("login_lock_until");
    const currentTime = new Date().getTime();

    if (lockUntil && currentTime < parseInt(lockUntil)) {
      const remainingSeconds = Math.ceil((parseInt(lockUntil) - currentTime) / 1000);
      toast.error(`${t("please_wait")} ${remainingSeconds} ${t("seconds_retry")}`);
      return;
    }

    setLoading(true);

    if (phone.length !== 10 || !/^(079|078|077)\d{7}$/.test(phone)) {
      toast.error(t("invalid_phone"));
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
        phone: phone,
      });

      if (res.data.token) {
        localStorage.removeItem("login_lock_until");
        login({
          _id: res.data._id,
          phone: phone,
          token: res.data.token,
          role: res.data.role,
        });
        toast.success(t("login_success"));
        navigate("/");
        return;
      }

      if (res.data.msg === "OTP sent to your phone") {
        toast.success(t("otp_sent"));
        navigate("/otp-verification", { state: { phone: phone } });
      }
    } catch (error) {
      console.error(error);
      toast.error(t("login_error"));
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    navigate("/products");
    return null;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#b80505] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-10 bg-[#dc0606] backdrop-blur-sm rounded-2xl shadow-2xl border border-red-700 text-center"
      >
        
        {/* مؤشر حالة المطعم التفاعلي */}
        <div className="flex justify-center mb-6">
          {isOpen ? (
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-1.5 rounded-full border border-green-500/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-green-100 text-xs font-bold uppercase tracking-wider">
                {t("we_are_open")}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full border border-white/20">
              <span className="h-3 w-3 rounded-full bg-gray-400"></span>
              <span className="text-gray-200 text-xs font-bold">
                {t("restaurant_closed_status")}
              </span>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="mb-6 relative"
        >
          <div className="relative inline-block">
            <div className="flex justify-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Sheesh%202025-cBMQInheJu59v7DqexALEnU0AaaWZq.png"
                alt="Restaurant Logo"
                className="h-48 w-48 object-contain"
              />
            </div>
            <motion.div
              className="absolute inset-0 -z-10 rounded-full blur-2xl"
              style={{
                width: "200px", height: "200px", left: "50%", top: "50%",
                transform: "translate(-50%, -50%)", borderRadius: "50%",
              }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        <div className="flex flex-col items-center mb-6">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
            alt="Yalla Sheesh"
            className="h-16 w-auto object-contain"
          />
        </div>

        <p className="text-white/90 text-sm mb-8">{t("enter_phone_to_continue")}</p>

        <form onSubmit={Loginhandler} className="flex flex-col gap-5">
          <motion.div whileFocus={{ scale: 1.01 }} className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              type="tel"
              placeholder={t("phone_placeholder")}
              value={phone}
              maxLength={10}
              onChange={(e) => setphone(e.target.value)}
              required
              className="w-full p-4 pr-4 pl-12 border-2 border-gray-200 rounded-xl text-base focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 placeholder:text-gray-400 text-right transition-all duration-200 bg-white"
            />
          </motion.div>

          <div className="flex flex-col gap-3 mt-2">
            <motion.button
              type="submit"
              whileHover={isOpen && !loading && phone.length === 10 ? { scale: 1.02, y: -2 } : {}}
              whileTap={isOpen && !loading && phone.length === 10 ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg
                ${isOpen 
                  ? "bg-yellow-400 text-black shadow-yellow-500/30 hover:bg-yellow-500 hover:shadow-yellow-600/50" 
                  : "bg-gray-500 text-gray-200 cursor-not-allowed opacity-80"}
              `}
              disabled={loading}
            >
              {loading ? t("logging_in") + "..." : isOpen ? t("login") : t("closed_btn")}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
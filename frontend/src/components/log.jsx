
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// Jordanian phone validation: must start with 079/078/077, total 10 digits
const JO_PHONE_RE = /^(079|078|077)\d{7}$/;

function Login() {
  const [phone, setphone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneInputRef = useRef(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const phoneValid = JO_PHONE_RE.test(phone);
  const phoneInvalid = phoneTouched && phone.length > 0 && !phoneValid;

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

    if (!phoneValid) {
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
          {/* Phone number field */}
          <div className="flex flex-col gap-1.5" dir="ltr">
            <motion.div
              animate={phoneInvalid ? { x: [-6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.35 }}
              className={`
                flex items-stretch rounded-xl border-2 overflow-hidden bg-white
                transition-all duration-200
                ${phoneInvalid
                  ? "border-red-400 shadow-md shadow-red-500/20"
                  : phoneValid
                    ? "border-green-400 shadow-md shadow-green-500/20"
                    : "border-white/40 focus-within:border-yellow-400 focus-within:shadow-md focus-within:shadow-yellow-400/30"
                }
              `}
            >
              {/* Country code prefix */}
              <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 select-none shrink-0">
                <span className="text-lg leading-none">🇯🇴</span>
                <span className="text-sm font-semibold text-gray-600">+962</span>
              </div>

              {/* Number input */}
              <input
                ref={phoneInputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="07XXXXXXXX"
                value={phone}
                maxLength={10}
                dir="ltr"
                autoComplete="tel-national"
                onFocus={() => setPhoneTouched(false)}
                onBlur={() => setPhoneTouched(true)}
                onChange={(e) => {
                  // Digits only
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setphone(digits);
                }}
                required
                className="flex-1 py-4 px-3 text-base outline-none bg-transparent text-gray-800 placeholder:text-gray-300 tracking-wider font-mono"
              />

              {/* Validation indicator */}
              <div className="flex items-center pr-3">
                <AnimatePresence mode="wait">
                  {phone.length > 0 && (
                    phoneValid ? (
                      <motion.svg
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    ) : (
                      <motion.div
                        key="dot"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="h-2.5 w-2.5 rounded-full bg-red-400"
                      />
                    )
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Hint text */}
            <AnimatePresence>
              {phoneInvalid && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-red-200 text-right pr-1"
                >
                  {t("invalid_phone")}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <motion.button
              type="submit"
              whileHover={isOpen && !loading && phoneValid ? { scale: 1.02, y: -2 } : {}}
              whileTap={isOpen && !loading && phoneValid ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg
                ${!isOpen
                  ? "bg-gray-500 text-gray-200 cursor-not-allowed opacity-80"
                  : loading || !phoneValid
                    ? "bg-yellow-400/60 text-black/50 cursor-not-allowed"
                    : "bg-yellow-400 text-black shadow-yellow-500/30 hover:bg-yellow-500 hover:shadow-yellow-600/50"
                }
              `}
              disabled={loading || !phoneValid || !isOpen}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {t("logging_in")}...
                </span>
              ) : isOpen ? t("login") : t("closed_btn")}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;

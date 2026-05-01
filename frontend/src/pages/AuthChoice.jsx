"use client";

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { User, Briefcase, ChevronRight, ChevronLeft } from "lucide-react";
import i18n from "i18next";
import { useEffect } from "react";

function AuthChoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === "ar";

  // توحيد لون الخلفية مع صفحة الـ Login
  useEffect(() => {
    document.body.style.background = "#b80505";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#b80505] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-10 bg-[#dc0606] backdrop-blur-sm rounded-2xl shadow-2xl border border-red-700 text-center"
      >
        {/* الشعارات (نفس الـ Login) */}
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
                className="h-40 w-40 object-contain"
              />
            </div>
            {/* تأثير الـ Glow خلف الشعار */}
            <motion.div
              className="absolute inset-0 -z-10 rounded-full blur-2xl bg-yellow-400/20"
              style={{
                width: "150px", height: "150px", left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [0.9, 1.2, 0.9],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        <div className="flex flex-col items-center mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
            alt="Yalla Sheesh"
            className="h-14 w-auto object-contain"
          />
        </div>

        <h2 className="text-white font-bold text-xl mb-8 tracking-tight">
          {t("choose_login_type") || (isRtl ? "اختر طريقة الدخول" : "Choose Login Type")}
        </h2>

        <div className="flex flex-col gap-4">
          {/* خيار الزبون - تصميم يشبه المدخلات */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/login")}
            className="flex items-center justify-between p-5 bg-white rounded-xl border-2 border-transparent hover:border-yellow-400 transition-all shadow-lg group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                <User className="w-6 h-6 text-red-600 group-hover:text-white" />
              </div>
              <div className="text-left flex flex-col" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <span className="text-gray-900 font-bold text-lg leading-tight">
                    {t("customer_login") || (isRtl ? "دخول الزبائن" : "Customer Login")}
                </span>
                <span className="text-gray-400 text-xs font-medium">
                    {isRtl ? "لطلب الوجبات وتتبع الطلب" : "To order and track meals"}
                </span>
              </div>
            </div>
            {isRtl ? <ChevronLeft className="text-gray-300 group-hover:text-red-600" /> : <ChevronRight className="text-gray-300 group-hover:text-red-600" />}
          </motion.button>

          {/* خيار الموظف - تصميم يشبه زر الدخول الأصفر */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/employee-login")}
            className="flex items-center justify-between p-5 bg-yellow-400 rounded-xl border-2 border-yellow-500 shadow-lg shadow-yellow-600/20 group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-black/10 p-3 rounded-lg group-hover:bg-black/20 transition-colors">
                <Briefcase className="w-6 h-6 text-black" />
              </div>
              <div className="text-left flex flex-col" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <span className="text-black font-bold text-lg leading-tight">
                    {t("employee_login") || (isRtl ? "دخول الموظفين" : "Team Login")}
                </span>
                <span className="text-black/60 text-xs font-medium">
                    {isRtl ? "للموظفين والمديرين فقط" : "For staff & managers only"}
                </span>
              </div>
            </div>
            {isRtl ? <ChevronLeft className="text-black/30" /> : <ChevronRight className="text-black/30" />}
          </motion.button>
        </div>

        <p className="mt-10 text-white/40 text-xs font-mono">
           YALLA SHEESH SYSTEM v2.0
        </p>
      </motion.div>
    </div>
  );
}

export default AuthChoice;
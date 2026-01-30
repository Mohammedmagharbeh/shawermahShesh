
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function EmployeeLogin() {
  const { t, i18n } = useTranslation();
  const [employeeName, setEmployeeName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();
  const EMPLOYEE_USERNAME = "employee";

  // تحديد الاتجاه بناءً على اللغة (rtl للعربية، ltr للانجليزية)
  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const checkStatus = () => {
      const hour = new Date().getHours();
      // إذا كانت الساعة بين 3 فجراً و 10 صباحاً، النظام مغلق
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
      navigate("/products");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();

    if (!isOpen) {
      toast.error(t("restaurant_closed_msg"));
      return;
    }

    if (!employeeName.trim()) {
      toast.error(t("error_enter_name"));
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/employee-login`, {
        username: EMPLOYEE_USERNAME,
        employeeName: employeeName,
      });

      if (res.data.msg === "OTP sent to your phone") {
        toast.success(t("otp_sent"));
        setOtpSent(true);
        setTimer(60);
        setOtp("");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("otp_send_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!isOpen) {
      toast.error(t("restaurant_closed_msg"));
      return;
    }

    if (!otp) {
      toast.error(t("error_enter_otp"));
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/verify-otp`, {
        username: EMPLOYEE_USERNAME,
        otp: otp.toString(),
      });

      if (res.data.token) {
        login({
          _id: res.data._id,
          username: EMPLOYEE_USERNAME,
          token: res.data.token,
          role: "employee",
          name: employeeName
        });
        toast.success(t("success_verified"));
        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast.error(t("error_invalid_otp"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#b80505] p-4 font-sans" dir={direction}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 bg-[#dc0606] rounded-2xl shadow-2xl border border-red-700 text-center"
      >
        {/* مؤشر الحالة (مفتوح/مغلق) */}
        <div className="flex justify-center mb-6">
          {isOpen ? (
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-1.5 rounded-full border border-green-500/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-green-100 text-xs font-bold uppercase tracking-wider">{t("system_open")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full border border-white/20">
              <span className="h-3 w-3 rounded-full bg-gray-400"></span>
              <span className="text-gray-200 text-xs font-bold uppercase tracking-wider">{t("system_closed")}</span>
            </div>
          )}
        </div>

        <div className="mx-auto w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#dc0606]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">{t("employee_login_title")}</h1>
        <p className="text-red-100 text-sm mb-8">{t("employee_login_subtitle")}</p>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
            <div className={direction === "rtl" ? "text-right" : "text-left"}>
              <label className="text-white text-xs mb-2 block mx-1 opacity-80">{t("employee_name_label")}</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder={t("employee_name_placeholder")}
                className="w-full p-4 bg-white rounded-xl text-black text-center font-bold focus:ring-4 focus:ring-yellow-400/50 outline-none transition-all"
                minLength={3}
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={isOpen && !loading ? { scale: 1.02 } : {}}
              whileTap={isOpen && !loading ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${isOpen
                ? "bg-yellow-400 text-black hover:bg-yellow-500 shadow-yellow-600/20"
                : "bg-gray-500 text-gray-200 cursor-not-allowed opacity-70"
                }`}
              disabled={loading || !isOpen}
            >
              {loading ? t("sending") : t("send_otp")}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="- - - -"
              maxLength="6"
              className="w-full p-4 rounded-xl text-center text-3xl font-bold focus:ring-4 focus:ring-yellow-400/50 outline-none"
            />
            <motion.button
              type="submit"
              whileHover={!loading ? { scale: 1.02 } : {}}
              className="w-full py-4 bg-yellow-400 text-black rounded-xl font-bold text-lg hover:bg-yellow-500 shadow-lg"
              disabled={loading}
            >
              {loading ? t("verifying") : t("verify_otp")}
            </motion.button>

            <button
              type="button"
              onClick={handleSendOTP}
              disabled={timer > 0 || loading}
              className="text-white text-sm underline opacity-80 disabled:no-underline disabled:opacity-50"
            >
              {timer > 0 ? t("resend_after", { seconds: timer }) : t("resend_otp")}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default EmployeeLogin;

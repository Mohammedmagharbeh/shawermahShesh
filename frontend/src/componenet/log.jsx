

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function Login() {
  const [phone, setphone] = useState("");
  const navigate = useNavigate();
  const { login } = useUser();
  const { t } = useTranslation();

  const Loginhandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
        phone: phone,
      });

      if (res.data.token) {
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
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            type: "spring",
          }}
          className="mb-6 relative"
        >
          {/* Smile face container */}
          <div className="relative inline-block">
            {/* Eyes */}
            <motion.div
              className="flex justify-center gap-2 mb-1"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg shadow-yellow-400/50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg shadow-yellow-400/50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.1,
                }}
              />
            </motion.div>

            {/* Arabic text */}
            <motion.h2
              className="text-4xl font-black text-white mb-1"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              يلا شيش
            </motion.h2>

            {/* English text */}
            <p className="text-sm font-bold text-white tracking-wider mb-2">
              YALLA SHEESH
            </p>

            {/* Smile curve */}
            <motion.div
              className="relative h-8 flex justify-center items-start"
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                width="120"
                height="30"
                viewBox="0 0 120 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <motion.path
                  d="M10 5 Q60 25, 110 5"
                  stroke="url(#smileGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
                <defs>
                  <linearGradient
                    id="smileGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            <div className="absolute inset-0 -z-10 bg-red-600 rounded-2xl blur-xl opacity-70" />
          </div>
        </motion.div>

        <h1
          className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2"
          style={{ fontFamily: "Pacifico, cursive" }}
        >
          Welcome to شاورما شيش
        </h1>

        <p className="text-gray-500 text-sm mb-8">أدخل رقم هاتفك للمتابعة</p>

        <form onSubmit={Loginhandler} className="flex flex-col gap-5">
          <motion.div whileFocus={{ scale: 1.02 }} className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <input
              type="tel"
              placeholder="رقم الهاتف"
              value={phone}
              maxLength={10}
              onChange={(e) => setphone(e.target.value)}
              required
              className="w-full p-4 pr-4 pl-12 border-2 border-gray-200 rounded-xl text-base focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 placeholder:text-gray-400 text-right transition-all duration-200 bg-gray-50/50"
            />
          </motion.div>

          <div className="flex flex-col gap-3 mt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200"
            >
              تسجيل الدخول
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;

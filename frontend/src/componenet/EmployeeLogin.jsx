"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function EmployeeLogin() {
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();
  const { t } = useTranslation();
  const EMPLOYEE_USERNAME = "employee";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/products");
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/employee-login`,
        {
          username: EMPLOYEE_USERNAME,
        }
      );

      if (res.data.msg === "OTP sent to your phone") {
        toast.success(t("otp_sent"));
        setOtpSent(true);
        setTimer(60);
        setOtp("");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("otp_send_failed") || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otp || otp.length === 0) {
        toast.error(t("enter_otp") || "Please enter the OTP");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/verify-otp`,
        {
          username: EMPLOYEE_USERNAME,
          otp: otp.toString(),
        }
      );

      if (res.data.token) {
        login({
          _id: res.data._id,
          username: EMPLOYEE_USERNAME,
          token: res.data.token,
          role: "employee",
        });

        toast.success(t("otp_verified") || "OTP verified successfully");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("otp_invalid") || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (e) => {
    e.preventDefault();
    if (timer === 0) {
      await handleSendOTP(e);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#b80505]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-10 bg-[#dc0606] backdrop-blur-sm rounded-2xl shadow-2xl border border-red-700"
      >
        {/* Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#dc0606]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m0 0H7.5a2.5 2.5 0 01-2.5-2.5V5.5a2.5 2.5 0 012.5-2.5h3.747m6.503 9.571C20.009 17.799 21 14.517 21 11m0 0h2.5a2.5 2.5 0 012.5 2.5v9.571m0 0h-3.753m2.5-2.5a2.5 2.5 0 01-2.5 2.5m0 0H9.75"
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white text-center mb-2"
        >
          {t("employee_login") || "Employee Login"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-red-100 text-center mb-8 text-sm"
        >
          {t("employee_login_desc") || "Login to access the employee dashboard"}
        </motion.p>

        {!otpSent ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSendOTP}
            className="space-y-6"
          >
            <div className="bg-red-700 bg-opacity-50 p-4 rounded-lg border border-red-600">
              <p className="text-white text-center text-sm font-medium">
                {t("employee_account") || "Employee Account"}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#dc0606] font-bold py-3 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="ml-2">{t("sending") || "Sending..."}</span>
                </div>
              ) : (
                t("send_otp") || "Send OTP"
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/")}
              className="w-full bg-transparent border-2 border-white text-white font-bold py-2 rounded-lg hover:bg-white hover:text-[#dc0606] transition-all"
            >
              {t("back") || "Back"}
            </motion.button>
          </motion.form>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleVerifyOTP}
            className="space-y-6"
          >
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                {t("enter_otp") || "Enter OTP"}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("otp_placeholder") || "Enter 6-digit OTP"}
                maxLength="6"
                className="w-full px-4 py-3 border-2 border-red-600 rounded-lg focus:outline-none focus:border-white bg-red-700 bg-opacity-30 text-white placeholder-red-200 text-center text-2xl tracking-widest font-bold"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full bg-white text-[#dc0606] font-bold py-3 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="ml-2">
                    {t("verifying") || "Verifying..."}
                  </span>
                </div>
              ) : (
                t("verify_otp") || "Verify OTP"
              )}
            </motion.button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={timer > 0}
              className="w-full text-white font-semibold py-2 rounded-lg hover:bg-red-700 hover:bg-opacity-30 transition-all disabled:opacity-50 text-sm"
            >
              {timer > 0
                ? `${t("resend_otp_in") || "Resend OTP in"} ${timer}s`
                : t("resend_otp") || "Resend OTP"}
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setTimer(0);
              }}
              className="w-full bg-transparent border-2 border-white text-white font-bold py-2 rounded-lg hover:bg-white hover:text-[#dc0606] transition-all"
            >
              {t("back") || "Back"}
            </motion.button>
          </motion.form>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-red-100 text-xs"
        >
          <p>
            {t("not_employee") || "Not an employee?"}{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-white font-bold hover:underline"
            >
              {t("customer_login") || "Customer Login"}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default EmployeeLogin;

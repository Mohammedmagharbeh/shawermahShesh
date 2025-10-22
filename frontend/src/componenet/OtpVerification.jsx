"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import { useUser } from "@/contexts/UserContext"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

function OtpVerification() {
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(20)
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone
  const newPhone = location.state?.newPhone
  const { login, user } = useUser()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  if (!phone) {
    navigate("/login")
  }

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000)
      return () => clearTimeout(countdown)
    }
  }, [timer])

  const verifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/verify-otp`, {
        phone,
        newPhone,
        otp,
      })

      login({
        _id: res.data._id,
        phone,
        token: res.data.token,
        role: res.data.role,
      })

      toast.success(t("otp_verified"))
      if (res.data.role === "employee") navigate("/admin/dashboard")

      navigate("/products")
    } catch (error) {
      toast.error(t("otp_invalid"))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
        phone,
      })
      if (res.data.msg === "OTP sent to your phone") {
        toast.success(t("otp_sent"))
        setTimer(20)
      }
    } catch (error) {
      console.error(error)
      toast.error(t("otp_resend_failed"))
    }
  }

  if (user) {
    navigate("/products")
    return null
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#b80505]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-10 bg-[#dc0606] backdrop-blur-sm rounded-2xl shadow-2xl border border-red-700 text-center"
      >
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </motion.div>
 <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
            alt="Yalla Sheesh"
            className="h-20 w-auto object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">أدخل رمز التحقق</h1>
        <p className="text-white/80 text-sm mb-8">تم إرسال رمز التحقق إلى {phone}</p>

        <form onSubmit={verifyOtp} className="flex flex-col gap-5">
          <motion.input
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="● ● ● ● ● ●"
            maxLength={6}
            required
            className="p-5 border-2 border-gray-200 rounded-xl text-2xl font-bold text-center tracking-[0.5em] focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 placeholder:text-gray-300 placeholder:tracking-[0.5em] transition-all duration-200 bg-white"
          />

         <motion.button
    type="submit"
    whileHover={!loading && otp.length === 6 ? { scale: 1.02, y: -2 } : {}}
    whileTap={!loading && otp.length === 6 ? { scale: 0.98 } : {}}
    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
        ${
            loading || otp.length < 6
            ? "bg-yellow-400 "
            : "bg-yellow-400 text-black shadow-lg shadow-yellow-500/30 hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-600/50 active:bg-yellow-600"
        }
    `}
    disabled={loading || otp.length < 6}
>
    {loading ? t("verifying") + "..." : t("verify_otp")}
</motion.button>

          {timer === 0 ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resendOtp}
              className="text-white/80 hover:text-white font-medium transition-colors duration-200"
            >
              لم تستلم الرمز؟ إعادة الإرسال
            </motion.button>
          ) : (
            <p className="text-white/70 text-sm">يمكنك إعادة الإرسال بعد {timer} ثانية</p>
          )}
        </form>

        <motion.button
          whileHover={{ x: 5 }}
          onClick={() => navigate(-1)}
          className="mt-8 text-white/70 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          العودة إلى تسجيل الدخول
        </motion.button>
      </motion.div>
    </div>
  )
}

export default OtpVerification

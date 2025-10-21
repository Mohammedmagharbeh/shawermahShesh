
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import { useUser } from "@/contexts/UserContext"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

function Login() {
  const [phone, setphone] = useState("")
  const navigate = useNavigate()
  const { login } = useUser()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  // إصلاح الخلفية والمركزية
  useEffect(() => {
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.background = "#b80505"
    document.body.style.minHeight = "100vh"
    document.body.style.display = "flex"
    document.body.style.alignItems = "center"
    document.body.style.justifyContent = "center"
    
    return () => {
      document.body.style.margin = ""
      document.body.style.padding = ""
      document.body.style.background = ""
      document.body.style.minHeight = ""
      document.body.style.display = ""
      document.body.style.alignItems = ""
      document.body.style.justifyContent = ""
    }
  }, [])

  const Loginhandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (phone.length !== 10 || !/^(079|078|077)\d{7}$/.test(phone)) {
      toast.error(t("invalid_phone"))
      setLoading(false)
      return
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
        phone: phone,
      })

      if (res.data.token) {
        login({
          _id: res.data._id,
          phone: phone,
          token: res.data.token,
          role: res.data.role,
        })
        toast.success(t("login_success"))
        navigate("/")
        return
      }

      if (res.data.msg === "OTP sent to your phone") {
        toast.success(t("otp_sent"))
        navigate("/otp-verification", { state: { phone: phone } })
      }
    } catch (error) {
      console.error(error)
      toast.error(t("login_error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-10 bg-[#dc0606] backdrop-blur-sm rounded-2xl shadow-2xl border border-red-700 text-center"
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
          <div className="relative inline-block">
            <div className="flex justify-center">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Sheesh%202025-cBMQInheJu59v7DqexALEnU0AaaWZq.png" 
                alt="Restaurant Logo" 
                className="h-56 w-56 object-contain" 
              />
            </div>
            <motion.div
              className="absolute inset-0 -z-10 rounded-full blur-2xl"
              style={{
                width: '224px',
                height: '224px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%'
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
            alt="Yalla Sheesh"
            className="h-20 w-auto object-contain"
          />
        </div>

        <p className="text-white/90 text-sm mb-8">أدخل رقم هاتفك للمتابعة</p>

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
              className="w-full p-4 pr-4 pl-12 border-2 border-gray-200 rounded-xl text-base focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 placeholder:text-gray-400 text-right transition-all duration-200 bg-white"
            />
          </motion.div>

          <div className="flex flex-col gap-3 mt-2">
            <motion.button
              type="submit"
              whileHover={!loading && phone.length === 10 ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading && phone.length === 10 ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
                bg-yellow-400 black shadow-yellow-500/30 hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-600/50 active:bg-yellow-600
              `}
              disabled={loading}
            >
              {loading ? t("logging_in") + "..." : t("login")}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default Login
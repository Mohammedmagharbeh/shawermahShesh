// // "use client";

// // import { useState, useEffect } from "react";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import axios from "axios";
// // import { motion } from "framer-motion";
// // import { useUser } from "@/contexts/UserContext";
// // import toast from "react-hot-toast";
// // import { useTranslation } from "react-i18next";

// // function OtpVerification() {
// //   const [otp, setOtp] = useState("");
// //   const [timer, setTimer] = useState(60);
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const phone = location.state?.phone;
// //   const newPhone = location.state?.newPhone;
// //   const { login } = useUser();
// //   const { t } = useTranslation();
// //   const [loading, setLoading] = useState(false);

// //   if (!phone) {
// //     navigate("/login");
// //   }

// //   useEffect(() => {
// //     if (timer > 0) {
// //       const countdown = setTimeout(() => setTimer(timer - 1), 1000);
// //       return () => clearTimeout(countdown);
// //     }
// //   }, [timer]);

// //   const verifyOtp = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       const res = await axios.post(
// //         `${import.meta.env.VITE_BASE_URL}/verify-otp`,
// //         {
// //           phone,
// //           newPhone,
// //           otp,
// //         }
// //       );

// //       login({
// //         _id: res.data._id,
// //         phone,
// //         token: res.data.token,
// //         role: res.data.role,
// //       });

// //       toast.success(t("otp_verified"));
// //       if (res.data.role === "employee") navigate("/admin/dashboard");

// //       navigate("/products");
// //     } catch (error) {
// //       toast.error(t("otp_invalid"));
// //       console.error(error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const resendOtp = async () => {
// //     try {
// //       const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
// //         phone,
// //       });
// //       if (res.data.msg === "OTP sent to your phone") {
// //         toast.success(t("otp_sent"));
// //         setTimer(60);
// //       }
// //     } catch (error) {
// //       console.error(error);
// //       toast.error(t("otp_resend_failed"));
// //     }
// //   };

// //   return (
// //     <div className="flex justify-center items-center min-h-screen bg-[#b80505]">
// //       <motion.div
// //         initial={{ opacity: 0, y: 20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.5 }}
// //         className="w-full max-w-md p-10 bg-[#dc0606] backdrop-blur-sm rounded-2xl shadow-2xl border border-red-700 text-center"
// //       >
// //         <motion.div
// //           initial={{ scale: 0 }}
// //           animate={{ scale: 1 }}
// //           transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
// //           className="mx-auto w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center shadow-lg"
// //         >
// //           <svg
// //             xmlns="http://www.w3.org/2000/svg"
// //             className="h-10 w-10 text-[#dc0606]"
// //             fill="none"
// //             viewBox="0 0 24 24"
// //             stroke="currentColor"
// //           >
// //             <path
// //               strokeLinecap="round"
// //               strokeLinejoin="round"
// //               strokeWidth={2}
// //               d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
// //             />
// //           </svg>
// //         </motion.div>
// //         <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
// //           <img
// //             src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
// //             alt="Yalla Sheesh"
// //             className="h-20 w-auto object-contain"
// //           />
// //         </div>
// //         <h1 className="text-3xl font-bold text-white mb-2">أدخل رمز التحقق</h1>
// //         <p className="text-white/80 text-sm mb-8">
// //           تم إرسال رمز التحقق إلى {phone}
// //         </p>

// //         <form onSubmit={verifyOtp} className="flex flex-col gap-5">
// //           <motion.input
// //             initial={{ scale: 0.9, opacity: 0 }}
// //             animate={{ scale: 1, opacity: 1 }}
// //             transition={{ delay: 0.3 }}
// //             type="text"
// //             value={otp}
// //             onChange={(e) => setOtp(e.target.value)}
// //             placeholder="● ● ● ● ● ●"
// //             maxLength={6}
// //             required
// //             className="p-5 border-2 border-gray-200 rounded-xl text-2xl font-bold text-center tracking-[0.5em] focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 placeholder:text-gray-300 placeholder:tracking-[0.5em] transition-all duration-200 bg-white"
// //           />

// //           <motion.button
// //             type="submit"
// //             whileHover={
// //               !loading && otp.length === 6 ? { scale: 1.02, y: -2 } : {}
// //             }
// //             whileTap={!loading && otp.length === 6 ? { scale: 0.98 } : {}}
// //             className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
// //         ${
// //           loading || otp.length < 6
// //             ? "bg-yellow-400 "
// //             : "bg-yellow-400 text-black shadow-lg shadow-yellow-500/30 hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-600/50 active:bg-yellow-600"
// //         }
// //     `}
// //             disabled={loading || otp.length < 4}
// //           >
// //             {loading ? t("verifying") + "..." : t("verify_otp")}
// //           </motion.button>

// //           {timer === 0 ? (
// //             <motion.button
// //               type="button"
// //               whileHover={{ scale: 1.02 }}
// //               whileTap={{ scale: 0.98 }}
// //               onClick={resendOtp}
// //               className="text-white/80 hover:text-white font-medium transition-colors duration-200"
// //             >
// //               لم تستلم الرمز؟ إعادة الإرسال
// //             </motion.button>
// //           ) : (
// //             <p className="text-white/70 text-sm">
// //               يمكنك إعادة الإرسال بعد {timer} ثانية
// //             </p>
// //           )}
// //         </form>

// //         <motion.button
// //           whileHover={{ x: 5 }}
// //           onClick={() => navigate(-1)}
// //           className="mt-8 text-white/70 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors duration-200"
// //         >
// //           <svg
// //             xmlns="http://www.w3.org/2000/svg"
// //             className="h-4 w-4"
// //             fill="none"
// //             viewBox="0 0 24 24"
// //             stroke="currentColor"
// //           >
// //             <path
// //               strokeLinecap="round"
// //               strokeLinejoin="round"
// //               strokeWidth={2}
// //               d="M15 19l-7-7 7-7"
// //             />
// //           </svg>
// //           العودة إلى تسجيل الدخول
// //         </motion.button>
// //       </motion.div>
// //     </div>
// //   );
// // }

// // export default OtpVerification;


// "use client";

// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { useUser } from "@/contexts/UserContext";
// import toast from "react-hot-toast";
// import { useTranslation } from "react-i18next";

// function OtpVerification() {
//   const [otp, setOtp] = useState("");
//   const [timer, setTimer] = useState(60);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const phone = location.state?.phone;
//   const newPhone = location.state?.newPhone;
//   const { login } = useUser();
//   const { t } = useTranslation();
//   const [loading, setLoading] = useState(false);

//   // إعادة التوجيه إذا لم يوجد رقم هاتف
//   useEffect(() => {
//     if (!phone) {
//       navigate("/login");
//     }
//   }, [phone, navigate]);

//   // عداد الوقت لإعادة الإرسال
//   useEffect(() => {
//     if (timer > 0) {
//       const countdown = setTimeout(() => setTimer(timer - 1), 1000);
//       return () => clearTimeout(countdown);
//     }
//   }, [timer]);

//   // التحقق التلقائي عند اكتمال الـ 6 أرقام (اختياري)
//   useEffect(() => {
//     if (otp.length === 6 && !loading) {
//       const fakeEvent = { preventDefault: () => {} };
//       verifyOtp(fakeEvent);
//     }
//   }, [otp]);

//   const verifyOtp = async (e) => {
//     if (e) e.preventDefault();
//     if (otp.length < 6) return;

//     setLoading(true);
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/verify-otp`,
//         {
//           phone,
//           newPhone,
//           otp,
//         }
//       );

//       login({
//         _id: res.data._id,
//         phone,
//         token: res.data.token,
//         role: res.data.role,
//       });

//       toast.success(t("otp_verified"));
//       if (res.data.role === "employee") {
//         navigate("/admin/dashboard");
//       } else {
//         navigate("/products");
//       }
//     } catch (error) {
//       toast.error(t("otp_invalid"));
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resendOtp = async () => {
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
//         phone,
//       });
//       if (res.data.msg === "OTP sent to your phone") {
//         toast.success(t("otp_sent"));
//         setTimer(60);
//         setOtp(""); // مسح الكود القديم عند إعادة الإرسال
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error(t("otp_resend_failed"));
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-[#b80505]">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-md p-10 bg-[#dc0606] backdrop-blur-sm rounded-2xl shadow-2xl border border-red-700 text-center"
//       >
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//           className="mx-auto w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center shadow-lg"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-10 w-10 text-[#dc0606]"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//             />
//           </svg>
//         </motion.div>

//         <div className="flex flex-col items-center mb-6">
//           <img
//             src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
//             alt="Yalla Sheesh"
//             className="h-20 w-auto object-contain"
//           />
//         </div>

//         <h1 className="text-3xl font-bold text-white mb-2">أدخل رمز التحقق</h1>
//         <p className="text-white/80 text-sm mb-8">
//           تم إرسال رمز التحقق إلى {phone}
//         </p>

//         <form onSubmit={verifyOtp} className="flex flex-col gap-5">
//           <motion.input
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.3 }}
            
//             // --- إعدادات التعبئة التلقائية ---
//             type="text"
//             inputMode="numeric"        // يظهر لوحة الأرقام فقط
//             autoComplete="one-time-code" // يلتقط الرمز من الرسائل النصية
//             pattern="\d{6}"            // يتوقع 6 أرقام
//             // ---------------------------

//             value={otp}
//             onChange={(e) => {
//               const val = e.target.value.replace(/\D/g, ""); // منع إدخال غير الأرقام
//               if (val.length <= 6) setOtp(val);
//             }}
//             placeholder="● ● ● ● ● ●"
//             maxLength={6}
//             required
//             className="p-5 border-2 border-gray-200 rounded-xl text-2xl font-bold text-center tracking-[0.5em] focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 placeholder:text-gray-300 placeholder:tracking-[0.5em] transition-all duration-200 bg-white"
//           />

//           <motion.button
//             type="submit"
//             whileHover={!loading && otp.length === 6 ? { scale: 1.02, y: -2 } : {}}
//             whileTap={!loading && otp.length === 6 ? { scale: 0.98 } : {}}
//             className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
//               ${
//                 loading || otp.length < 6
//                   ? "bg-yellow-400/50 cursor-not-allowed text-black/50"
//                   : "bg-yellow-400 text-black shadow-lg shadow-yellow-500/30 hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-600/50 active:bg-yellow-600"
//               }`}
//             disabled={loading || otp.length < 6}
//           >
//             {loading ? t("verifying") + "..." : t("verify_otp")}
//           </motion.button>

//           {timer === 0 ? (
//             <motion.button
//               type="button"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={resendOtp}
//               className="text-white/80 hover:text-white font-medium transition-colors duration-200"
//             >
//               لم تستلم الرمز؟ إعادة الإرسال
//             </motion.button>
//           ) : (
//             <p className="text-white/70 text-sm">
//               يمكنك إعادة الإرسال بعد {timer} ثانية
//             </p>
//           )}
//         </form>

//         <motion.button
//           whileHover={{ x: -5 }}
//           onClick={() => navigate(-1)}
//           className="mt-8 text-white/70 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors duration-200"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-4 w-4"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//           العودة إلى تسجيل الدخول
//         </motion.button>
//       </motion.div>
//     </div>
//   );
// }

// export default OtpVerification;
"use client";

// import { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import { useUser } from "@/contexts/UserContext";
// import toast from "react-hot-toast";
// import { useTranslation } from "react-i18next";

// const OTP_LENGTH = 4;

// function OtpVerification() {
//   const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
//   const [timer, setTimer] = useState(60);
//   const [loading, setLoading] = useState(false);
//   const isVerifying = useRef(false);

//   const [shake, setShake] = useState(false);

//   const inputRefs = useRef([]);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login } = useUser();
//   const { t, i18n } = useTranslation();

//   const phone = location.state?.phone;
//   const newPhone = location.state?.newPhone;

//   // تحديد الاتجاه (RTL للعربي و LTR للإنجليزي)
//   const isRtl = i18n.language === "ar";

//   useEffect(() => {
//     if (!phone) navigate("/login");
//   }, [phone, navigate]);
//   const { login } = useUser();
//   const { t } = useTranslation();

//   const otp = digits.join("");

//   if (!phone) navigate("/login");

//   // Countdown timer
//   useEffect(() => {
//     if (timer > 0) {
//       const countdown = setTimeout(() => setTimer((t) => t - 1), 1000);
//       return () => clearTimeout(countdown);
//     }
//   }, [timer]);

//   const handleVerify = async (currentOtp) => {
//     if (isVerifying.current || currentOtp.length < 4) return;

//     isVerifying.current = true;
//   // Focus first input on mount
//   useEffect(() => {
//     inputRefs.current[0]?.focus();
//   }, []);

//   // Handle single digit input
//   const handleChange = (index, value) => {
//     // Accept only digits
//     const sanitized = value.replace(/\D/g, "").slice(-1);
//     const newDigits = [...digits];
//     newDigits[index] = sanitized;
//     setDigits(newDigits);

//     // Auto-advance to next field
//     if (sanitized && index < OTP_LENGTH - 1) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   // Handle backspace navigation
//   const handleKeyDown = (index, e) => {
//     if (e.key === "Backspace") {
//       if (digits[index]) {
//         // Clear current
//         const newDigits = [...digits];
//         newDigits[index] = "";
//         setDigits(newDigits);
//       } else if (index > 0) {
//         // Move to previous
//         inputRefs.current[index - 1]?.focus();
//       }
//     } else if (e.key === "ArrowLeft" && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   // Handle paste (works for mobile auto-fill too)
//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pasted = e.clipboardData
//       .getData("text")
//       .replace(/\D/g, "")
//       .slice(0, OTP_LENGTH);
//     if (!pasted) return;

//     const newDigits = Array(OTP_LENGTH).fill("");
//     pasted.split("").forEach((char, i) => {
//       newDigits[i] = char;
//     });
//     setDigits(newDigits);

//     // Focus the next empty slot or the last one
//     const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
//     inputRefs.current[nextIndex]?.focus();
//   };

//   // This is the key for Android auto-fill — the hidden input collects the SMS OTP
//   const handleHiddenInput = (e) => {
//     const value = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
//     if (!value) return;
//     const newDigits = Array(OTP_LENGTH).fill("");
//     value.split("").forEach((char, i) => {
//       newDigits[i] = char;
//     });
//     setDigits(newDigits);
//     inputRefs.current[Math.min(value.length, OTP_LENGTH - 1)]?.focus();
//   };

//   const verifyOtp = async (e) => {
//     e.preventDefault();
//     if (otp.length < OTP_LENGTH) return;
//     setLoading(true);

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/verify-otp`,
//         { phone, newPhone, otp: currentOtp }
//         { phone, newPhone, otp },
//       );

//       login({
//         _id: res.data._id,
//         phone,
//         token: res.data.token,
//         role: res.data.role,
//       });

//       toast.success(t("otp_verified"));
//       navigate(res.data.role === "employee" ? "/admin/dashboard" : "/products");

//     } catch (error) {
//       toast.error(t("otp_invalid"));
//       setOtp(""); 
//       isVerifying.current = false;
//       if (res.data.role === "employee") {
//         navigate("/admin/dashboard");
//       } else {
//         navigate("/products");
//       }
//     } catch (error) {
//       toast.error(t("otp_invalid"));
//       console.error(error);
//       // Shake animation + clear
//       setShake(true);
//       setTimeout(() => setShake(false), 600);
//       setDigits(Array(OTP_LENGTH).fill(""));
//       inputRefs.current[0]?.focus();
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (otp.length === 4) {
//       handleVerify(otp);
//     }
//   }, [otp]);

//   const resendOtp = async () => {
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, { phone });
//       if (res.data.msg === "OTP sent to your phone") {
//         toast.success(t("otp_sent"));
//         setTimer(60);
//         setOtp("");
//         isVerifying.current = false;
//         setDigits(Array(OTP_LENGTH).fill(""));
//         inputRefs.current[0]?.focus();
//       }
//     } catch (error) {
//       toast.error(t("otp_resend_failed"));
//     }
//   };

//   const isComplete = otp.length === OTP_LENGTH;

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-[#b80505]" dir={isRtl ? "rtl" : "ltr"}>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-md p-10 bg-[#dc0606] backdrop-blur-sm rounded-2xl shadow-2xl border border-red-700 text-center"
//       >
//         {/* Lock icon */}
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//           className="mx-auto w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center shadow-lg"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-10 w-10 text-[#dc0606]"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//             />
//           </svg>
//         </motion.div>

//         {/* Logo */}
//         <div className="flex flex-col items-center mb-6">
//           <img
//             src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
//             alt="Yalla Sheesh"
//             className="h-20 w-auto object-contain"
//           />
//         </div>

//         {/* النصوص المترجمة */}
//         <h1 className="text-3xl font-bold text-white mb-2">{t("enter_otp_title", "أدخل رمز التحقق")}</h1>
//         <h1 className="text-3xl font-bold text-white mb-2">أدخل رمز التحقق</h1>
//         <p className="text-white/80 text-sm mb-8">
//           {t("otp_sent_to", "تم إرسال رمز التحقق إلى")} <span dir="ltr">{phone}</span>
//         </p>

//         <form onSubmit={(e) => { e.preventDefault(); handleVerify(otp); }} className="flex flex-col gap-5">
//           <motion.input
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.3 }}
//             type="text"
//             inputMode="numeric"
//             autoComplete="one-time-code"
//             value={otp}
//             onChange={(e) => {
//               const val = e.target.value.replace(/\D/g, "");
//               if (val.length <= 4) setOtp(val);
//             }}
//             placeholder="● ● ● ●"
//             maxLength={4}
//             required
//             className="p-5 border-2 border-gray-200 rounded-xl text-2xl font-bold text-center tracking-[0.5em] focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 placeholder:text-gray-300 transition-all duration-200 bg-white"
//         <form onSubmit={verifyOtp} className="flex flex-col gap-6">
         
//           <input
//             type="text"
//             inputMode="numeric"
//             autoComplete="one-time-code"
//             pattern="\d*"
//             maxLength={OTP_LENGTH}
//             className="sr-only"
//             aria-hidden="true"
//             onChange={handleHiddenInput}
//             onPaste={handlePaste}
//           />

//           {/* Individual OTP digit boxes */}
//           <motion.div
//             animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
//             transition={{ duration: 0.5 }}
//             className="flex justify-center gap-3"
//             dir="ltr"
//           >
//             {digits.map((digit, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.1 + index * 0.05 }}
//                 className="relative"
//               >
//                 <input
//                   ref={(el) => (inputRefs.current[index] = el)}
//                   type="text"
//                   inputMode="numeric"
//                   pattern="\d*"
//                   maxLength={1}
//                   value={digit}
//                   onChange={(e) => handleChange(index, e.target.value)}
//                   onKeyDown={(e) => handleKeyDown(index, e)}
//                   onPaste={handlePaste}
//                   onFocus={(e) => e.target.select()}
//                   autoComplete={index === 0 ? "one-time-code" : "off"}
//                   className={`
//                     w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none
//                     transition-all duration-150 bg-white text-gray-900
//                     ${
//                       digit
//                         ? "border-yellow-400 shadow-lg shadow-yellow-400/30 scale-105"
//                         : "border-white/40 hover:border-white/70"
//                     }
//                     focus:border-yellow-400 focus:shadow-lg focus:shadow-yellow-400/40 focus:scale-105
//                     caret-transparent select-none
//                   `}
//                 />
//                 {/* Animated bottom-bar indicator */}
//                 <AnimatePresence>
//                   {digit && (
//                     <motion.div
//                       initial={{ scaleX: 0 }}
//                       animate={{ scaleX: 1 }}
//                       exit={{ scaleX: 0 }}
//                       className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full"
//                     />
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             ))}
//           </motion.div>

//           {/* Progress dots */}
//           <div className="flex justify-center gap-1.5 -mt-2">
//             {digits.map((d, i) => (
//               <motion.div
//                 key={i}
//                 animate={{
//                   backgroundColor: d ? "#facc15" : "rgba(255,255,255,0.3)",
//                   scale: d ? 1.2 : 1,
//                 }}
//                 className="w-1.5 h-1.5 rounded-full"
//               />
//             ))}
//           </div>

//           {/* Verify button */}
//           <motion.button
//             type="submit"
//             whileHover={!loading && otp.length === 4 ? { scale: 1.02, y: -2 } : {}}
//             whileTap={!loading && otp.length === 4 ? { scale: 0.98 } : {}}
//             className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
//               ${
//                 loading || otp.length < 4
//                   ? "bg-yellow-400 cursor-not-allowed"
//                   : "bg-yellow-400 text-black shadow-lg shadow-yellow-500/30 hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-600/50 active:bg-yellow-600"
//               }`}
//             disabled={loading || otp.length < 4}
//             whileHover={isComplete && !loading ? { scale: 1.02, y: -2 } : {}}
//             whileTap={isComplete && !loading ? { scale: 0.98 } : {}}
//             className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
//               loading || !isComplete
//                 ? "bg-yellow-400/60 text-black/50 cursor-not-allowed"
//                 : "bg-yellow-400 text-black shadow-lg shadow-yellow-500/30 hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-600/50 active:bg-yellow-600"
//             }`}
//             disabled={loading || !isComplete}
//           >
//             {loading ? (
//               <span className="flex items-center justify-center gap-2">
//                 <svg
//                   className="animate-spin h-5 w-5"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8H4z"
//                   />
//                 </svg>
//                 {t("verifying")}...
//               </span>
//             ) : (
//               t("verify_otp")
//             )}
//           </motion.button>

//           {/* Resend / Timer */}
//           {timer === 0 ? (
//             <motion.button
//               type="button"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={resendOtp}
//               className="text-white/80 hover:text-white font-medium transition-colors duration-200"
//             >
//               {t("didnt_receive_otp", "لم تستلم الرمز؟ إعادة الإرسال")}
//             </motion.button>
//           ) : (
//             <p className="text-white/70 text-sm">
//               {t("resend_after", "يمكنك إعادة الإرسال بعد")} {timer} {t("seconds", "")}
//               يمكنك إعادة الإرسال بعد{" "}
//               <span className="font-bold text-yellow-400">{timer}</span> ثانية
//             </p>
//           )}
//         </form>

//         {/* Back button */}
//         <motion.button
//           whileHover={isRtl ? { x: -5 } : { x: 5 }}
//           onClick={() => navigate(-1)}
//           className="mt-8 text-white/70 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors duration-200"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className={`h-4 w-4 ${isRtl ? "" : "rotate-180"}`}
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//           {t("back_to_login", "العودة إلى تسجيل الدخول")}
//         </motion.button>
//       </motion.div>
//     </div>
//   );
// }

// export default OtpVerification;

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const OTP_LENGTH = 4;

function OtpVerification() {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const isVerifying = useRef(false);
  const [shake, setShake] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const { t, i18n } = useTranslation();

  const phone = location.state?.phone;
  const newPhone = location.state?.newPhone;
  const isRtl = i18n.language === "ar";
  const otp = digits.join("");

  // التحقق من وجود رقم الهاتف عند الدخول
  useEffect(() => {
    if (!phone) navigate("/login");
  }, [phone, navigate]);

  // التركيز على أول حقل عند التحميل
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // عداد الوقت
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  // التحقق التلقائي عند اكتمال الـ 4 أرقام
  useEffect(() => {
    if (otp.length === OTP_LENGTH && !isVerifying.current) {
      handleVerify(otp);
    }
  }, [otp]);

  const handleVerify = async (currentOtp) => {
    if (isVerifying.current || currentOtp.length < OTP_LENGTH) return;
    
    isVerifying.current = true;
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/verify-otp`, {
        phone,
        newPhone,
        otp: currentOtp,
      });

      login({
        _id: res.data._id,
        phone,
        token: res.data.token,
        role: res.data.role,
      });

      toast.success(t("otp_verified"));
      navigate(res.data.role === "employee" ? "/admin/dashboard" : "/products");
    } catch (error) {
      toast.error(t("otp_invalid"));
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setDigits(Array(OTP_LENGTH).fill(""));
      isVerifying.current = false;
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = sanitized;
    setDigits(newDigits);

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newDigits = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const resendOtp = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, { phone });
      if (res.data.msg === "OTP sent to your phone") {
        toast.success(t("otp_sent"));
        setTimer(60);
        setDigits(Array(OTP_LENGTH).fill(""));
        isVerifying.current = false;
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(t("otp_resend_failed"));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#b80505]" dir={isRtl ? "rtl" : "ltr"}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 bg-[#dc0606] rounded-2xl shadow-2xl border border-red-700 text-center"
      >
        <div className="mx-auto w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center">
          <svg className="h-10 w-10 text-[#dc0606]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="flex flex-col items-center mb-6">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png" alt="Yalla Sheesh" className="h-20 w-auto" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{t("enter_otp_title", "أدخل رمز التحقق")}</h1>
        <p className="text-white/80 text-sm mb-8">
          {t("otp_sent_to", "تم إرسال رمز التحقق إلى")} <span dir="ltr">{phone}</span>
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleVerify(otp); }} className="flex flex-col gap-6">
          <motion.div 
            animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
            className="flex justify-center gap-3" 
            dir="ltr"
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all bg-white text-gray-900 ${digit ? "border-yellow-400" : "border-white/40"}`}
              />
            ))}
          </motion.div>

          <button
            type="submit"
            disabled={loading || otp.length < OTP_LENGTH}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${loading || otp.length < OTP_LENGTH ? "bg-yellow-400/60 cursor-not-allowed" : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
          >
            {loading ? t("verifying") : t("verify_otp", "تحقق الآن")}
          </button>

          {timer === 0 ? (
            <button type="button" onClick={resendOtp} className="text-white/80 hover:text-white">
              {t("didnt_receive_otp", "إعادة الإرسال")}
            </button>
          ) : (
            <p className="text-white/70 text-sm">
              {t("resend_after", "إعادة الإرسال بعد")} <span className="font-bold text-yellow-400">{timer}</span> ثانية
            </p>
          )}
        </form>

        <button onClick={() => navigate(-1)} className="mt-8 text-white/70 flex items-center justify-center gap-2 mx-auto">
           {t("back_to_login", "العودة")}
        </button>
      </motion.div>
    </div>
  );
}

export default OtpVerification;
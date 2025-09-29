import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";

function Login() {
  const [phone, setphone] = useState("");
  const navigate = useNavigate();
  const { login } = useUser();

  const formatPhone = (phone) => {
    let cleaned = phone.trim();
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }
    return `+962${cleaned}`;
  };

  const Loginhandler = async (e) => {
    e.preventDefault();

    const formattedPhone = formatPhone(phone);
    try {
      const token = sessionStorage.getItem("jwt"); // get token if exists

      const res = await axios.post("http://127.0.0.1:5000/api/login", {
        phone: formattedPhone,
        token,
      });

      // If token valid → login directly
      if (res.data.token) {
        login({
          _id: res.data._id,
          phone: formattedPhone,
          token: res.data.token,
        });
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/");
        return;
      }

      // If OTP required
      if (res.data.msg === "OTP sent to your phone") {
        toast.success("تم إرسال رمز التحقق 📲");
        navigate("/otp-verification", { state: { phone: formattedPhone } });
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تسجيل الدخول ❌");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <motion.img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzGI9tRqzIVulcl3ghkfQ61TOgQmkuOt3gg&s"
          alt="شعار شاورما شيش"
          className="mx-auto w-28 h-28 object-cover mb-4 rounded-full"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 120,
            damping: 10,
          }}
        />

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome to شاورما شيش
        </h1>

        <form onSubmit={Loginhandler} className="flex flex-col gap-4">
          <input
            type="tel"
            placeholder=" رقم الهاتف"
            value={phone}
            maxLength={10}
            onChange={(e) => setphone(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg text-base focus:border-red-600 focus:outline-none focus:shadow-md placeholder:text-gray-500 text-right"
          />

          <button
            type="submit"
            className="bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition"
          >
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

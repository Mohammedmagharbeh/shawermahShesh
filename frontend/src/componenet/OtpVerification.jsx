import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

function OtpVerification() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone;
  const { login } = useUser();

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/verify-otp", {
        phone,
        otp,
      });

      // ✅ Save user to context
      login({
        _id: res.data._id,
        phone,
        token: res.data.token,
      });

      alert("تم التحقق من OTP بنجاح 🎉");
      navigate("/");
    } catch (error) {
      alert("OTP غير صحيح ❌");
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-xl font-bold mb-4">أدخل رمز التحقق</h1>
        <form onSubmit={verifyOtp} className="flex flex-col gap-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="ادخل الرمز"
            maxLength={6}
            required
            className="p-3 border border-gray-300 rounded-lg text-base text-center focus:border-red-600 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700"
          >
            تحقق
          </button>
        </form>
      </div>
    </div>
  );
}

export default OtpVerification;

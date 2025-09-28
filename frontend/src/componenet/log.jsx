import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const Loginhandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/login", {
        username,
        password,
      });
      sessionStorage.setItem("jwt", res.data.token);
      sessionStorage.setItem("username", username);
      alert("تم تسجيل الدخول بنجاح");
      navigate("/");
    } catch (error) {
      console.error(error);
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

        <h1 className="text-2xl font-bold text-gray-800 mb-6 relative after:content-[''] after:block after:w-16 after:h-[3px] after:bg-red-600 after:mx-auto after:mt-2 rounded">
          Welcome to شاورما شيش
        </h1>

        <form onSubmit={Loginhandler} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg text-base focus:border-red-600 focus:outline-none focus:shadow-md placeholder:text-gray-500 text-right"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg text-base focus:border-red-600 focus:outline-none focus:shadow-md placeholder:text-gray-500 text-right"
          />

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold text-lg transition-transform hover:bg-red-700 hover:-translate-y-0.5"
            >
              تسجيل الدخول
            </button>

            <motion.button
              type="button"
              onClick={() => navigate("/Registration")}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold text-lg transition-transform hover:bg-gray-700 hover:-translate-y-0.5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              انشاء حساب
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

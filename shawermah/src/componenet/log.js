import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import '../css/log.css'; // تأكد من استيراد ملف الـ CSS

function Login() {
  const [username, setsusername] = useState("");
  const [password, setpassword] = useState("");
  const navigate = useNavigate();

  const Loginhandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/login', { username, password });
      sessionStorage.setItem('jwt', res.data.token);
      sessionStorage.setItem("username", username);
      alert("تم تسجيل الدخول بنجاح");
      navigate('/');
    } catch (error) {
      
    }
  };

  return (
    <div className="login-container">
      {/* الأيقونة الثابتة مع Framer Motion اللطيف */}
      <motion.div 
        className="car-animation"
        initial={{ opacity: 0, y: -50 }} // تبدأ الأيقونة شفافة وفوق مكانها الأصلي بـ 50px
        animate={{ opacity: 1, y: 0 }} // تتحرك لتظهر بوضوح وتستقر في مكانها
        transition={{ duration: 0.8, type: "spring", stiffness: 120, damping: 10 }} // انيميشن ناعم ومرح
      >
      </motion.div>
      
      <h1 className="login-header"> Welcome to شاورما شيش</h1>

      <form onSubmit={Loginhandler} className="loginn-form">
        <input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setsusername(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setpassword(e.target.value)}
          required
          className="input-field"
        />
        <div className="button-group">
            <button type="submit" className="log-button">تسجيل الدخول</button>
            <motion.button 
                onClick={() => { navigate("/Registration"); }} 
                className="reg-button"
                whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px rgba(255,255,255,0.8)" }}
                whileTap={{ scale: 0.9 }}
            >
                انشاء حساب
            </motion.button>
        </div>
      </form>
    </div>
  );
}

export default Login;
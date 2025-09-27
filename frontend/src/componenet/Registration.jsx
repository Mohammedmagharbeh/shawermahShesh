import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { postregiter } from "../../../shawermah/src/back/api";

// دوال قوة كلمة المرور
function calculatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

function getStrengthColor(strength) {
  switch (strength) {
    case 1: return '#ff4d4d';
    case 2: return '#ff944d';
    case 3: return '#ffdb4d';
    case 4: return '#a3ff4d';
    case 5: return '#4dff4d';
    
    default: return '#ddd';
  }
}

function Registration() {
  const [regData, setregData] = useState({ username:'', email:'', password:'', confirmPassword:'' });
  const navigate = useNavigate();

  const handelChange = (e) => {
    const { name, value } = e.target;
    setregData({...regData, [name]: value});
  };

  const postusers = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = regData;

    if (password !== confirmPassword) {
      alert('كلمتا المرور غير متطابقتين، الرجاء المحاولة مرة أخرى.');
      return;
    }

    // تحقق من قوة كلمة المرور
    const passwordStrength = calculatePasswordStrength(password);
    if (passwordStrength < 4) {
      alert('كلمة المرور ضعيفة. الرجاء اختيار كلمة مرور قوية أو ممتازة.');
      return;
    }

    try {
      await postregiter({ username, email, password });
      alert('تم التسجيل بنجاح');
      navigate('/login');
    } catch(error) {
      alert('الرجاء التاكد من المعلومات');
    }
  };

  // تحديث شريط قوة كلمة المرور
  const passwordStrength = calculatePasswordStrength(regData.password);
  const strengthPercent = (passwordStrength / 5) * 100;
  const strengthColor = getStrengthColor(passwordStrength);
  let strengthLabel = "";
  if (passwordStrength <= 1) strengthLabel = "ضعيف";
  else if (passwordStrength === 2) strengthLabel = "متوسط";
  else if (passwordStrength === 3) strengthLabel = "جيد";
  else if (passwordStrength === 4) strengthLabel = "قوي";
  else if (passwordStrength === 5) strengthLabel = "ممتاز";

  return (
    <div className="registration-container">
      {/* Shawarma Animation */}
      <motion.div
        className="shawarma-animation"
        initial={{ opacity: 0, y: -150 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 120, damping: 12 }}
      />

      <div className="logo-container">
        <h2>تسجيل حساب جديد</h2>
      </div>

      <form onSubmit={postusers} className="registration-form">
        <label>اسم المستخدم</label>
        <input type="text" name="username" value={regData.username} onChange={handelChange} />

        <label>البريد الإلكتروني</label>
        <input type="email" name="email" value={regData.email} onChange={handelChange} />

        <label>كلمة المرور</label>
        <input type="password" name="password" value={regData.password} onChange={handelChange} />

        {/* شريط قوة كلمة المرور */}
        <div className="password-strength-meter">
          <div
            className="strength-bar"
            style={{
              width: `${strengthPercent}%`,
              backgroundColor: strengthColor,
              transition: 'width 0.5s ease'
            }}
          ></div>
        </div>
        <span className="strength-label">{strengthLabel}</span>

        <label>تأكيد كلمة المرور</label>
        <input type="password" name="confirmPassword" value={regData.confirmPassword} onChange={handelChange} />

        <div className="button-group">
          <button type="submit" className="register-btn">تسجيل</button>
          <button type="button" className="login-btn" onClick={() => navigate('/login')}>الانتقال إلى تسجيل الدخول</button>
        </div>
      </form>
    </div>
  );
}

export default Registration;

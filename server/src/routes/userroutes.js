// const express = require("express");
// const routes = express.Router();
// require("dotenv").config();
// const jwt = require("jsonwebtoken");
// const {
//   getuser,

//   getAllProducts,
//   getSingleProduct,
// } = require("../controller/usercontroller");
// const { generateOTP, sendOTP } = require("../utils/otp");
// const userModel = require("../models/user");
// const validateJWT = require("../middlewares/validateJWT");

// routes.get("/users", getuser);

// routes.get("/me", validateJWT, (req, res) => {
//   const { _id, phone, role, username } = req.user;
//   res.json({ _id, phone, role, username });
// });

// routes.post("/login", async (req, res) => {
//   const { phone } = req.body; // ✅ client should send token if they have one

//   try {
//     let user = await userModel.findOne({ phone });

//     if (!user) {
//       user = new userModel({ phone });
//     }

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     await sendOTP(user.phone, otp);

//     return res.status(200).json({ msg: "OTP sent to your phone" });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// });

// // Employee Login (no phone required, uses username/identifier)
// routes.post("/employee-login", async (req, res) => {
//   const { username } = req.body;

//   try {
//     const employeeUsername = username || "employee";
//     const EMPLOYEE_PHONE = "0788031015"; // Fixed phone number for OTP

//     let user = await userModel.findOne({
//       username: employeeUsername,
//       role: "employee",
//     });

//     if (!user) {
//       user = new userModel({ username: employeeUsername, role: "employee" });
//     }

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     // Send OTP to the fixed employee phone number
//     await sendOTP(EMPLOYEE_PHONE, otp);

//     return res.status(200).json({ msg: "OTP sent to your phone" });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// });

// // Verify OTP → issue JWT
// routes.post("/verify-otp", async (req, res) => {
//   const { phone, newPhone, otp, username } = req.body;

//   try {
//     let user;
//     if (username) {
//       // Employee login verification
//       user = await userModel.findOne({ username, role: "employee" });
//     } else {
//       // Regular customer login
//       user = await userModel.findOne({ phone });
//     }
//     if (!user) return res.status(400).json({ msg: "User not found" });

//     // Validate OTP
//     if (user.otp !== otp) {
//       return res.status(400).json({ msg: "Invalid OTP" });
//     }
//     if (user.otpExpires < Date.now())
//       return res.status(400).json({ msg: "OTP has expired" });
//     // Clear OTP
//     user.otp = null;
//     user.otpExpires = null;
//     if (phone && newPhone) {
//       user.phone = newPhone;
//     } else if (phone && !newPhone) {
//       user.phone = phone;
//     }
//     await user.save();

//     // Issue JWT
//     const token = jwt.sign(
//       {
//         id: user._id,
//         phone: user.phone,
//         username: user.username,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "24h",
//       }
//     );

//     return res.status(200).json({
//       msg: "Login successful",
//       token,
//       _id: user._id,
//       phone: user.phone,
//       role: user.role,
//     });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// });

// routes.get("/products", validateJWT, getAllProducts);
// routes.get("/products/:id", validateJWT, getSingleProduct);
// routes.put("/update-phone", validateJWT, async (req, res) => {
//   try {
//     const { newPhone } = req.body;
//     const userId = req.user._id;

//     const user = await userModel.findById(userId);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     const existingUser = await userModel.findOne({ phone: newPhone });
//     if (existingUser)
//       return res.status(400).json({ msg: "Phone number already in use" });
//     if (user.phone === newPhone)
//       return res
//         .status(400)
//         .json({ msg: "New phone number must be different" });

//     // Generate and send OTP
//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
//     await user.save();
//     await sendOTP(newPhone, otp);

//     res.json({ msg: "OTP sent to your phone" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Failed to send OTP" });
//   }
// });

// module.exports = routes;

// const express = require("express");
// const routes = express.Router();
// require("dotenv").config();
// const jwt = require("jsonwebtoken");
// const {
//   getuser,
//   getAllProducts,
//   getSingleProduct,
// } = require("../controller/usercontroller");
// const { generateOTP, sendOTP } = require("../utils/otp");
// const userModel = require("../models/user");
// const validateJWT = require("../middlewares/validateJWT");

// routes.get("/users", getuser);

// routes.get("/me", validateJWT, (req, res) => {
//   const { _id, phone, role, username } = req.user;
//   res.json({ _id, phone, role, username });
// });

// routes.post("/login", async (req, res) => {
//   const { phone } = req.body;

//   try {
//     let user = await userModel.findOne({ phone });

//     if (!user) {
//       user = new userModel({ phone });
//     }

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     await sendOTP(user.phone, otp);

//     return res.status(200).json({ msg: "OTP sent to your phone" });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// });

// // التعديل هنا: استقبال اسم الموظف وإرساله مع الـ OTP
// routes.post("/employee-login", async (req, res) => {
//   const { username, employeeName } = req.body; // استقبال employeeName من الفرونت إند

//   try {
//     const employeeUsername = username || "employee";
//     const EMPLOYEE_PHONE = "0788031015"; 

//     let user = await userModel.findOne({
//       username: employeeUsername,
//       role: "employee",
//     });

//     if (!user) {
//       user = new userModel({ username: employeeUsername, role: "employee" });
//     }

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     // نمرر اسم الموظف لدالة إرسال الرسائل لكي تضمنه في النص
//     // ملاحظة: تأكد أن دالة sendOTP لديك مهيئة لاستقبال باراميتر ثالث (الاسم)
//     await sendOTP(EMPLOYEE_PHONE, otp, employeeName);

//     return res.status(200).json({ msg: "OTP sent to your phone" });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// });

// routes.post("/verify-otp", async (req, res) => {
//   const { phone, newPhone, otp, username } = req.body;

//   try {
//     let user;
//     if (username) {
//       user = await userModel.findOne({ username, role: "employee" });
//     } else {
//       user = await userModel.findOne({ phone });
//     }
//     if (!user) return res.status(400).json({ msg: "User not found" });

//     if (user.otp !== otp) {
//       return res.status(400).json({ msg: "Invalid OTP" });
//     }
//     if (user.otpExpires < Date.now())
//       return res.status(400).json({ msg: "OTP has expired" });

//     user.otp = null;
//     user.otpExpires = null;
//     if (phone && newPhone) {
//       user.phone = newPhone;
//     } else if (phone && !newPhone) {
//       user.phone = phone;
//     }
//     await user.save();

//     const token = jwt.sign(
//       {
//         id: user._id,
//         phone: user.phone,
//         username: user.username,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "24h",
//       }
//     );

//     return res.status(200).json({
//       msg: "Login successful",
//       token,
//       _id: user._id,
//       phone: user.phone,
//       role: user.role,
//     });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// });

// routes.get("/products", validateJWT, getAllProducts);
// routes.get("/products/:id", validateJWT, getSingleProduct);

// routes.put("/update-phone", validateJWT, async (req, res) => {
//   try {
//     const { newPhone } = req.body;
//     const userId = req.user._id;

//     const user = await userModel.findById(userId);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     const existingUser = await userModel.findOne({ phone: newPhone });
//     if (existingUser)
//       return res.status(400).json({ msg: "Phone number already in use" });
//     if (user.phone === newPhone)
//       return res
//         .status(400)
//         .json({ msg: "New phone number must be different" });

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();
//     await sendOTP(newPhone, otp);

//     res.json({ msg: "OTP sent to your phone" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Failed to send OTP" });
//   }
// });

// module.exports = routes;

const express = require("express");
const routes = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const {
  getuser,
  getAllProducts,
  getSingleProduct,
} = require("../controller/usercontroller");
const { generateOTP, sendOTP } = require("../utils/otp");
const userModel = require("../models/user");
const validateJWT = require("../middlewares/validateJWT");

// إعدادات الرقم الثابت والـ OTP الثابت
const STATIC_PHONE = "0777777777";
const STATIC_OTP = "123456";

routes.get("/users", getuser);

routes.get("/me", validateJWT, (req, res) => {
  const { _id, phone, role, username } = req.user;
  res.json({ _id, phone, role, username });
});

// --- تسجيل الدخول ---
routes.post("/login", async (req, res) => {
  const { phone } = req.body;

  try {
    let user = await userModel.findOne({ phone });

    if (!user) {
      user = new userModel({ phone });
    }

    // إذا كان الرقم هو الرقم الثابت
    if (phone === STATIC_PHONE) {
      user.otp = STATIC_OTP;
      user.otpExpires = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000; 
      await user.save();
      
      // ملاحظة: غيرنا الرسالة هنا لتكون نفس رسالة المستخدم العادي 
      // لضمان أن الـ Frontend ينتقل لصفحة الإدخال فوراً
      return res.status(200).json({ msg: "OTP sent to your phone" });
    }

    // المستخدم الطبيعي
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTP(user.phone, otp);

    return res.status(200).json({ msg: "OTP sent to your phone" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// --- دخول الموظف ---
routes.post("/employee-login", async (req, res) => {
  const { username, employeeName } = req.body;

  try {
    const employeeUsername = username || "employee";
    const EMPLOYEE_PHONE = "0788031015"; 

    let user = await userModel.findOne({
      username: employeeUsername,
      role: "employee",
    });

    if (!user) {
      user = new userModel({ username: employeeUsername, role: "employee" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTP(EMPLOYEE_PHONE, otp, employeeName);

    return res.status(200).json({ msg: "OTP sent to your phone" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// --- التحقق من الـ OTP ---
routes.post("/verify-otp", async (req, res) => {
  const { phone, newPhone, otp, username } = req.body;

  try {
    let user;
    if (username) {
      user = await userModel.findOne({ username, role: "employee" });
    } else {
      user = await userModel.findOne({ phone });
    }

    if (!user) return res.status(400).json({ msg: "User not found" });

    // التحقق من الرمز
    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    
    // فحص انتهاء الصلاحية للكل ما عدا الرقم الثابت
    if (phone !== STATIC_PHONE && user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    user.otp = null;
    user.otpExpires = null;

    if (phone && newPhone) {
      user.phone = newPhone;
    } else if (phone && !newPhone) {
      user.phone = phone;
    }
    
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      msg: "Login successful",
      token,
      _id: user._id,
      phone: user.phone,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

routes.get("/products", validateJWT, getAllProducts);
routes.get("/products/:id", validateJWT, getSingleProduct);

routes.put("/update-phone", validateJWT, async (req, res) => {
  try {
    const { newPhone } = req.body;
    const userId = req.user._id;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const existingUser = await userModel.findOne({ phone: newPhone });
    if (existingUser)
      return res.status(400).json({ msg: "Phone number already in use" });
    
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendOTP(newPhone, otp);

    res.json({ msg: "OTP sent to your phone" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to send OTP" });
  }
});

module.exports = routes;
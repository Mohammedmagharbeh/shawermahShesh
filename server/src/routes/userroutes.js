// const express = require("express");
// const routes = express.Router();
// require("dotenv").config();
// const {
//   getuser,
//   getAllProducts,
//   getSingleProduct,
//   getCurrentUser,
//   sendLoginOTP,
//   sendEmployeeLoginOTP,
//   verifyLoginOTP,
//   updatePhone,
// } = require("../controller/usercontroller");
// const validateJWT = require("../middlewares/validateJWT");

// routes.get("/users", getuser);

// routes.get("/me", validateJWT, getCurrentUser);

// routes.post("/login", sendLoginOTP);

// // التعديل هنا: استقبال اسم الموظف وإرساله مع الـ OTP
// routes.post("/employee-login", sendEmployeeLoginOTP);

// routes.post("/verify-otp", verifyLoginOTP);

// routes.get("/products", validateJWT, getAllProducts);
// routes.get("/products/:id", validateJWT, getSingleProduct);

// routes.put("/update-phone", validateJWT, updatePhone);

// module.exports = routes;

const express = require("express");
const routes = express.Router();
const {
  getuser,
  getAllProducts,
  getSingleProduct,
  getCurrentUser,
  sendLoginOTP,
  verifyLoginOTP,
  updatePhone,
  createEmployee, // الدالة الجديدة
  employeeLogin   // الدالة الجديدة
} = require("../controller/usercontroller");
const validateJWT = require("../middlewares/validateJWT");

// مسارات المستخدمين والمسؤولين
routes.get("/users", validateJWT, getuser);
routes.get("/me", validateJWT, getCurrentUser);
routes.put("/update-phone", validateJWT, updatePhone);

// مسارات تسجيل الدخول (OTP للمستخدمين)
routes.post("/login", sendLoginOTP);
routes.post("/verify-otp", verifyLoginOTP);

// --- مسارات الموظفين (التي كانت تظهر لك الخطأ) ---
// إنشاء موظف (يستخدمه الأدمن في صفحة AdminUsersPage)
routes.post("/auth/create-employee", validateJWT, createEmployee);

// تسجيل دخول الموظف (يستخدم في صفحة EmployeeLogin)
routes.post("/auth/employee-login", employeeLogin);

// مسارات المنتجات
routes.get("/products", validateJWT, getAllProducts);
routes.get("/products/:id", validateJWT, getSingleProduct);

module.exports = routes;
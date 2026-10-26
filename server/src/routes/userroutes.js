const express = require("express");
const routes = express.Router();
const {
  getuser,
  getAllUsers,
  getAllProducts,
  getSingleProduct,
  getCurrentUser,
  sendLoginOTP,
  verifyLoginOTP,
  updatePhone,
  createEmployee,
  employeeLogin,
  deleteAccount,
} = require("../controller/usercontroller");
const validateJWT = require("../middlewares/validateJWT");

// ==========================================
// 1. مسارات الحسابات والهوية (Authentication)
// ==========================================

// دخول المستخدمين العاديين (OTP)
routes.post("/login", sendLoginOTP);
routes.post("/verify-otp", verifyLoginOTP);

// دخول الموظفين والمدراء (Username/Password)
routes.post("/auth/employee-login", employeeLogin);

// إنشاء موظف جديد (يستخدمه الأدمن فقط)
routes.post("/auth/create-employee", validateJWT, createEmployee);

// ==========================================
// 2. مسارات المستخدمين (User Management)
// ==========================================

routes.get("/users", validateJWT, getuser); // paginated — AdminUsers.jsx
routes.get("/users/all", validateJWT, getAllUsers); // flat array — Statistics.jsx
routes.get("/me", validateJWT, getCurrentUser);
routes.delete("/me", validateJWT, deleteAccount);
routes.put("/update-phone", validateJWT, updatePhone);

// مسار إضافي لإضافة مستخدم عادي (Role: user) من لوحة التحكم إذا لزم الأمر
routes.post("/admin/user/add", validateJWT, createEmployee);
// ملاحظة: يمكنك استخدام نفس دالة createEmployee لأنها تعالج الـ role

// ==========================================
// 3. مسارات المنتجات (Products)
// ==========================================

routes.get("/products", getAllProducts);
routes.get("/products/:id", getSingleProduct);

module.exports = routes;

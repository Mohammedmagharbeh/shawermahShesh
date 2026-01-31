const express = require("express");
const routes = express.Router();
require("dotenv").config();
const {
  getuser,
  getAllProducts,
  getSingleProduct,
  getCurrentUser,
  sendLoginOTP,
  sendEmployeeLoginOTP,
  verifyLoginOTP,
  updatePhone,
} = require("../controller/usercontroller");
const validateJWT = require("../middlewares/validateJWT");

routes.get("/users", getuser);

routes.get("/me", validateJWT, getCurrentUser);

routes.post("/login", sendLoginOTP);

// التعديل هنا: استقبال اسم الموظف وإرساله مع الـ OTP
routes.post("/employee-login", sendEmployeeLoginOTP);

routes.post("/verify-otp", verifyLoginOTP);

routes.get("/products", validateJWT, getAllProducts);
routes.get("/products/:id", validateJWT, getSingleProduct);

routes.put("/update-phone", validateJWT, updatePhone);

module.exports = routes;

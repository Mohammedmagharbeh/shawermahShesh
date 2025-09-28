const express = require("express");
const cors = require("cors");
const routes = express.Router();
require("dotenv").config();
const bcrypt = require("bcrypt");

const {
  getuser,
  postuser,
  userLogin,
  verify,
  home,
  getAllProducts,
  getSingleProduct,
} = require("../controller/usercontroller");
const { generateOTP, sendOTP } = require("../utils/otp");
const userModel = require("../models/user");

routes.get("/users", getuser);
routes.post("/users/postuser", postuser);

routes.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    // send via SMS
    await sendOTP(user.phone, otp);

    res.status(200).json({ msg: "OTP sent to your phone", userId: user._id });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// routes/auth.js
routes.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // OTP success → clear otp
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // issue JWT token for session
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ msg: "Login successful", token });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

routes.get("/jwt", verify);
routes.get("/home", verify, home);

// Products routes
routes.get("/", getAllProducts);
routes.get("/:id", getSingleProduct);

module.exports = routes;

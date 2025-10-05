const express = require("express");
const cors = require("cors");
const routes = express.Router();
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  getuser,
  postuser,
  verify,
  home,
  getAllProducts,
  getSingleProduct,
} = require("../controller/usercontroller");
const { generateOTP, sendOTP } = require("../utils/otp");
const userModel = require("../models/user");

routes.get("/users", getuser);
// routes.post("/users/postuser", postuser);

routes.post("/login", async (req, res) => {
  const { phone } = req.body; // ✅ client should send token if they have one

  try {
    let user = await userModel.findOne({ phone });

    // ✅ Case 1: user exists
    if (!user) {
      // const otp = generateOTP();
      // user.otp = otp;
      // user.otpExpires = Date.now() + 5 * 60 * 1000;
      // await user.save();

      // await sendOTP(user.phone, otp);

      // return res.status(200).json({ msg: "OTP sent to your phone" });
      user = new userModel({ phone });
    }

    // ✅ Case 2: user not found → create new user & send OTP

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

// Verify OTP → issue JWT
routes.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const user = await userModel.findOne({ phone });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Validate OTP
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

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

routes.get("/home", verify, home);
routes.get("/products", getAllProducts);
routes.get("/products/:id", getSingleProduct);
routes.put("/users/update-phone", verify, async (req, res) => {
  const userId = req.user; // Extracted from the verify middleware
  const { newPhone } = req.body;

  try {
    // Check if the new phone number is already in use
    const existingUser = await userModel.findOne({ phone: newPhone });
    if (existingUser) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    // Update the user's phone number
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { phone: newPhone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Phone number updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = routes;

const express = require("express");
const routes = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const {
  getuser,
  verify,
  home,
  getAllProducts,
  getSingleProduct,
} = require("../controller/usercontroller");
const { generateOTP, sendOTP } = require("../utils/otp");
const userModel = require("../models/user");
const validateJWT = require("../middlewares/validateJWT");

routes.get("/users", getuser);

routes.post("/login", async (req, res) => {
  const { phone } = req.body; // ✅ client should send token if they have one

  try {
    let user = await userModel.findOne({ phone });

    if (!user) {
      user = new userModel({ phone });
    }

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
  const { phone, newPhone, otp } = req.body;

  try {
    const user = await userModel.findOne({ phone });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Validate OTP
    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    if (user.otpExpires < Date.now())
      return res.status(400).json({ msg: "OTP has expired" });
    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    user.phone = newPhone ?? phone; // Update phone number if needed
    await user.save();

    // Issue JWT
    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
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

routes.get("/home", verify, home);
routes.get("/products", getAllProducts);
routes.get("/products/:id", getSingleProduct);
routes.put("/update-phone", validateJWT, async (req, res) => {
  try {
    const { newPhone } = req.body;
    const userId = req.user._id;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const existingUser = await userModel.findOne({ phone: newPhone });
    if (existingUser)
      return res.status(400).json({ msg: "Phone number already in use" });
    if (user.phone === newPhone)
      return res
        .status(400)
        .json({ msg: "New phone number must be different" });

    // Generate and send OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
    await user.save();
    await sendOTP(newPhone, otp);

    res.json({ msg: "OTP sent to your phone" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
});

module.exports = routes;

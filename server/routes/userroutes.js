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
  const { phone} = req.body;

  try {
    const user = await userModel.findOne({ phone });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

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

// Verify OTP → issue JWT
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

    // issue JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "goback",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ msg: "Login successful", token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

routes.get("/home", verify, home);
routes.get("/products", getAllProducts);
routes.get("/products/:id", getSingleProduct);

module.exports = routes;

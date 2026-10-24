const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const products = require("../models/products");
const Category = require("../models/Category");
const { generateOTP, sendOTP } = require("../utils/otp");
require("dotenv").config();

// ✅ جلب المستخدمين مع pagination + search + role filter
exports.getuser = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const search = (req.query.search || "").trim();
    const role = (req.query.role || "").trim();

    const filter = {};

    if (search) {
      filter.$or = [
        { phone: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    if (role) filter.role = role;

    // Run the query and count in parallel for speed
    const [users, total] = await Promise.all([
      userModel
        .find(filter)
        .select("_id phone username name firstName lastName role createdAt") // never send otp / password
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      userModel.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ جلب كل المستخدمين كمصفوفة كاملة — تستخدمها Statistics.jsx فقط
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find()
      .select("_id phone username name apartment role createdAt") // never send otp / password
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ جلب بيانات المستخدم الحالي (تعديل: يجلب الرتبة من قاعدة البيانات مباشرة)
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user.id يأتي من الـ Middleware (validateJWT)
    const user = await userModel.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.json({
      _id: user._id,
      phone: user.phone,
      role: user.role, // سيجلب admin أو employee المخزن فعلياً
      username: user.username,
      name: user.name,
      apartment: user.apartment,
      driverStatus: user.driverStatus,
      currentOrderId: user.currentOrderId,
      returnedAt: user.returnedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- نظام المستخدمين العاديين (OTP) ---

exports.sendLoginOTP = async (req, res) => {
  const normalizedPhone = String(req.body?.phone || "").trim();
  try {
    if (!normalizedPhone) {
      return res.status(400).json({ msg: "Phone number is required" });
    }

    let user = await userModel.findOne({ phone: normalizedPhone });

    // Rate limit per user/phone: Prevent sending more than 1 OTP per 60 seconds
    if (user?.otpLastSentAt) {
      const timeSinceLastOTP =
        Date.now() - new Date(user.otpLastSentAt).getTime();
      if (timeSinceLastOTP < 60000) {
        return res
          .status(429)
          .json({ msg: "Please wait 60 seconds before requesting a new OTP." });
      }
    }

    if (!user) {
      user = new userModel({ phone: normalizedPhone, role: "user" });
    }
    const isTestAccount = normalizedPhone
      .replace(/\s+/g, "")
      .includes("0790000000");
    const otp = isTestAccount ? "1234" : generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpLastSentAt = Date.now();
    await user.save();

    // Bypass actual SMS delivery for App Store / Google Play review accounts
    if (!isTestAccount) {
      await sendOTP(user.phone, otp);
    }
    return res.status(200).json({ msg: "OTP sent to your phone" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.verifyLoginOTP = async (req, res) => {
  const { phone, newPhone, otp, username } = req.body;
  try {
    let user;
    if (username) {
      user = await userModel.findOne({ username, role: "employee" });
    } else {
      user = await userModel.findOne({ phone });
    }
    if (!user) return res.status(400).json({ msg: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (user.otpExpires < Date.now())
      return res.status(400).json({ msg: "OTP has expired" });

    user.otp = null;
    user.otpExpires = null;
    if (phone && newPhone) user.phone = newPhone;

    if (user.role === "rider") {
      if (user.driverStatus !== "on_delivery" && user.driverStatus !== "assigned") {
        user.driverStatus = "unavailable";
      }
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
      { expiresIn: "365d" },
    );

    return res.status(200).json({
      msg: "Login successful",
      token,
      _id: user._id,
      phone: user.phone,
      role: user.role,
      driverStatus: user.driverStatus,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// --- نظام الموظفين والمدراء (Password) ---

// ✅ إنشاء حساب جديد (موظف، مدير، سائق، كاشير، موارد بشرية)
exports.createEmployee = async (req, res) => {
  try {
    const { username, name, password, phone, firstName, lastName, role } = req.body;

    const finalUsername = String(username || name || "").trim();
    if (!finalUsername) {
      return res.status(400).json({ message: "يرجى إدخال اسم المستخدم" });
    }

    if (!password || !String(password).trim()) {
      return res.status(400).json({ message: "يرجى إدخال كلمة المرور" });
    }

    const userExists = await userModel.findOne({ username: finalUsername });
    if (userExists) {
      return res.status(400).json({ message: "اسم المستخدم موجود مسبقاً" });
    }

    let cleanPhone;
    if (phone && String(phone).trim()) {
      cleanPhone = String(phone).trim();
      const phoneExists = await userModel.findOne({ phone: cleanPhone });
      if (phoneExists) {
        return res.status(400).json({ message: "رقم الهاتف مسجل لمستخدم آخر بالفعل" });
      }
    }

    const fName = String(firstName || "").trim();
    const lName = String(lastName || "").trim();
    const fullName = [fName, lName].filter(Boolean).join(" ") || String(name || "").trim() || finalUsername;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password).trim(), salt);

    const newUser = new userModel({
      username: finalUsername,
      password: hashedPassword,
      role: role || "employee",
      firstName: fName,
      lastName: lName,
      name: fullName,
      ...(cleanPhone ? { phone: cleanPhone } : {}),
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "تم إنشاء الحساب بنجاح", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ تسجيل دخول الموظف أو المدير
exports.employeeLogin = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const identifier = String(username || name || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "يرجى إدخال اسم المستخدم وكلمة المرور" });
    }

    // البحث عن المستخدم باسم المستخدم أو رقم الهاتف
    const user = await userModel.findOne({
      $or: [{ username: identifier }, { phone: identifier }],
      role: { $in: ["employee", "admin", "hr", "rider", "cashier"] },
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "كلمة المرور غير صحيحة" });

    // For riders: ensure driverStatus is set to unavailable upon login so they must scan branch QR first to become available
    if (user.role === "rider") {
      if (user.driverStatus !== "on_delivery" && user.driverStatus !== "assigned") {
        user.driverStatus = "unavailable";
        await user.save();
      }
      const io = req.app.get("io");
      if (io && user.driverStatus === "unavailable") {
        io.emit("driverStatusChanged", {
          riderId: user._id,
          driverStatus: "unavailable",
          currentOrderId: user.currentOrderId || null,
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "365d" },
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name || user.username,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        driverStatus: user.driverStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- تحديث الهاتف والمنتجات ---

exports.updatePhone = async (req, res) => {
  try {
    const { newPhone } = req.body;
    const user = await userModel.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    const normalizedNewPhone = String(newPhone || "").trim();
    if (!normalizedNewPhone) {
      return res.status(400).json({ msg: "newPhone is required" });
    }

    // Rate limit per user: Prevent sending more than 1 OTP per 60 seconds
    if (user?.otpLastSentAt) {
      const timeSinceLastOTP =
        Date.now() - new Date(user.otpLastSentAt).getTime();
      if (timeSinceLastOTP < 60000) {
        return res
          .status(429)
          .json({ msg: "Please wait 60 seconds before requesting a new OTP." });
      }
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpLastSentAt = Date.now();
    await user.save();
    await sendOTP(normalizedNewPhone, otp);
    res.json({ msg: "OTP sent to your phone" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to send OTP" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category, isSpicy } = req.query;
    const query = {};
    if (category) query.category = category;
    if (isSpicy !== undefined) query.isSpicy = isSpicy === "true";

    const productsList = await products
      .find(query)
      .populate("category")
      .sort({ position: 1 })
      .lean();
    res.status(200).json({ message: "Success", data: productsList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await products
      .findById(req.params.id)
      .populate("category")
      .lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Admins usually shouldn't be deleted via this endpoint, or we can just allow it.
    // We will just delete the user.
    await userModel.findByIdAndDelete(userId);
    
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

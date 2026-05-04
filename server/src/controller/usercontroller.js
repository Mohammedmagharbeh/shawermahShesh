// // const userModel = require("../models/user");
// // const bcrypt = require("bcrypt");
// // const jwt = require("jsonwebtoken");
// // const products = require("../models/products");
// // const dotenv = require("dotenv");
// // const Category = require("../models/Category");
// // const { generateOTP, sendOTP } = require("../utils/otp");
// // dotenv.config();

// // exports.getuser = async (req, res) => {
// //   try {
// //     const users = await userModel.find();
// //     res.status(200).json(users);
// //   } catch (error) {
// //     res.status(400).json({ message: error.message });
// //   }
// // };

// // exports.getCurrentUser = (req, res) => {
// //   const { _id, phone, role, username } = req.user;
// //   res.json({ _id, phone, role, username });
// // };

// // exports.sendLoginOTP = async (req, res) => {
// //   const { phone } = req.body;

// //   try {
// //     const userLog = await userModel.findOne({ phone });

// //     let user;
// //     if (!userLog) {
// //       user = new userModel({ phone });
// //     } else {
// //       user = userLog;
// //     }

// //     const otp = generateOTP();
// //     user.otp = otp;
// //     user.otpExpires = Date.now() + 5 * 60 * 1000;
// //     await user.save();

// //     await sendOTP(user.phone, otp);

// //     return res.status(200).json({ msg: "OTP sent to your phone" });
// //   } catch (error) {
// //     res.status(500).json({ msg: error.message });
// //   }
// // };

// // exports.sendEmployeeLoginOTP = async (req, res) => {
// //   const { username, employeeName } = req.body;

// //   try {
// //     const employeeUsername = username || "employee";
// //     const EMPLOYEE_PHONE = "0799446641";

// //     let user = await userModel.findOne({
// //       username: employeeUsername,
// //       role: "employee",
// //     });

// //     if (!user) {
// //       user = new userModel({ username: employeeUsername, role: "employee" });
// //     }

// //     const otp = generateOTP();
// //     user.otp = otp;
// //     user.otpExpires = Date.now() + 5 * 60 * 1000;
// //     await user.save();

// //     await sendOTP(EMPLOYEE_PHONE, otp, employeeName);

// //     return res.status(200).json({ msg: "OTP sent to your phone" });
// //   } catch (error) {
// //     res.status(500).json({ msg: error.message });
// //   }
// // };

// // exports.verifyLoginOTP = async (req, res) => {
// //   const { phone, newPhone, otp, username } = req.body;

// //   try {
// //     let user;
// //     if (username) {
// //       user = await userModel.findOne({ username, role: "employee" });
// //     } else {
// //       user = await userModel.findOne({ phone });
// //     }
// //     if (!user) return res.status(400).json({ msg: "User not found" });

// //     if (user.otp !== otp) {
// //       return res.status(400).json({ msg: "Invalid OTP" });
// //     }
// //     if (user.otpExpires < Date.now())
// //       return res.status(400).json({ msg: "OTP has expired" });

// //     user.otp = null;
// //     user.otpExpires = null;
// //     if (phone && newPhone) {
// //       user.phone = newPhone;
// //     } else if (phone && !newPhone) {
// //       user.phone = phone;
// //     }
// //     await user.save();

// //     const token = jwt.sign(
// //       {
// //         id: user._id,
// //         phone: user.phone,
// //         username: user.username,
// //         role: user.role,
// //       },
// //       process.env.JWT_SECRET,
// //       {
// //         expiresIn: "24h",
// //       },
// //     );

// //     return res.status(200).json({
// //       msg: "Login successful",
// //       token,
// //       _id: user._id,
// //       phone: user.phone,
// //       role: user.role,
// //     });
// //   } catch (err) {
// //     res.status(500).json({ msg: err.message });
// //   }
// // };

// // exports.updatePhone = async (req, res) => {
// //   try {
// //     const { newPhone } = req.body;
// //     const userId = req.user._id;

// //     const user = await userModel.findById(userId);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     const existingUser = await userModel.findOne({ phone: newPhone });
// //     if (existingUser)
// //       return res.status(400).json({ msg: "Phone number already in use" });
// //     if (user.phone === newPhone)
// //       return res
// //         .status(400)
// //         .json({ msg: "New phone number must be different" });

// //     const otp = generateOTP();
// //     user.otp = otp;
// //     user.otpExpires = Date.now() + 5 * 60 * 1000;
// //     await user.save();
// //     await sendOTP(newPhone, otp);

// //     res.json({ msg: "OTP sent to your phone" });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ msg: "Failed to send OTP" });
// //   }
// // };

// // // const productsCache = new NodeCache({ stdTTL: 60 });

// // exports.getAllProducts = async (req, res) => {
// //   try {
// //     const { category, isSpicy, hasTypeChoices, hasProteinChoices } = req.query;

// //     // Build a unique key based on the query parameters
// //     // const cacheKey = JSON.stringify({
// //     //   category,
// //     //   isSpicy,
// //     //   hasTypeChoices,
// //     //   hasProteinChoices,
// //     // });

// //     // Check if cached response exists
// //     // const cachedData = productsCache.get(cacheKey);
// //     // if (cachedData) {
// //     //   return res.status(200).json({
// //     //     message: "Products fetched successfully (from cache)",
// //     //     data: cachedData,
// //     //   });
// //     // }

// //     const query = {};

// //     // Handle category
// //     if (category) {
// //       const categoryDoc = await Category.findById(category).lean();
// //       if (categoryDoc) {
// //         query.category = categoryDoc._id;
// //       } else {
// //         return res.status(404).json({ message: "Category not found" });
// //       }
// //     }

// //     // Boolean filters
// //     if (isSpicy !== undefined) query.isSpicy = isSpicy === "true";
// //     if (hasTypeChoices !== undefined)
// //       query.hasTypeChoices = hasTypeChoices === "true";
// //     if (hasProteinChoices !== undefined)
// //       query.hasProteinChoices = hasProteinChoices === "true";

// //     // Query DB
// //     const productsList = await products
// //       .find(query)
// //       .populate("category")
// //       .sort({ position: 1 })
// //       .lean();

// //     // Store in cache
// //     // productsCache.set(cacheKey, productsList);

// //     res.status(200).json({
// //       message: "Products fetched successfully",
// //       data: productsList,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching products:", error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // exports.getSingleProduct = async (req, res) => {
// //   const { id } = req.params;

// //   try {
// //     const product = await products.findById(id).populate("category").lean();

// //     if (!product) {
// //       return res.status(404).json({ message: "Product not found" });
// //     }

// //     res.status(200).json({
// //       message: "Product fetched successfully",
// //       data: product,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching product:", error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// const userModel = require("../models/user");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const products = require("../models/products");
// const Category = require("../models/Category");
// const { generateOTP, sendOTP } = require("../utils/otp");
// require("dotenv").config();

// // جلب كل المستخدمين
// exports.getuser = async (req, res) => {
//   try {
//     const users = await userModel.find().sort({ createdAt: -1 });
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // جلب بيانات المستخدم الحالي
// exports.getCurrentUser = (req, res) => {
//   const { _id, phone, role, username } = req.user;
//   res.json({ _id, phone, role, username });
// };

// // --- نظام المستخدمين (OTP) ---

// exports.sendLoginOTP = async (req, res) => {
//   const { phone } = req.body;
//   try {
//     let user = await userModel.findOne({ phone });
//     if (!user) {
//       user = new userModel({ phone, role: "user" });
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
// };

// exports.verifyLoginOTP = async (req, res) => {
//   const { phone, newPhone, otp, username } = req.body;
//   try {
//     let user;
//     if (username) {
//       user = await userModel.findOne({ username, role: "employee" });
//     } else {
//       user = await userModel.findOne({ phone });
//     }
//     if (!user) return res.status(400).json({ msg: "User not found" });
//     if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });
//     if (user.otpExpires < Date.now()) return res.status(400).json({ msg: "OTP has expired" });

//     user.otp = null;
//     user.otpExpires = null;
//     if (phone && newPhone) user.phone = newPhone;
//     await user.save();

//     const token = jwt.sign(
//       { id: user._id, phone: user.phone, username: user.username, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
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
// };

// // --- نظام الموظفين الجديد (Password) ---

// // إنشاء موظف جديد (للأدمن فقط)
// exports.createEmployee = async (req, res) => {
//   try {
//     const { name, password } = req.body; // name هو الـ username
//     if (!name || !password) return res.status(400).json({ message: "يرجى إدخال الاسم وكلمة المرور" });

//     const userExists = await userModel.findOne({ username: name });
//     if (userExists) return res.status(400).json({ message: "اسم الموظف موجود مسبقاً" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const employee = new userModel({
//       username: name,
//       password: hashedPassword,
//       role: "employee",
//     });

//     await employee.save();
//     res.status(201).json({ success: true, message: "تم إنشاء حساب الموظف بنجاح" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // دخول الموظف بكلمة المرور
// exports.employeeLogin = async (req, res) => {
//   try {
//     const { name, password } = req.body;
//     const user = await userModel.findOne({ username: name, role: "employee" });
    
//     if (!user || !user.password) {
//         return res.status(401).json({ message: "بيانات الدخول غير صحيحة أو الحساب غير مفعل كموظف" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "كلمة المرور غير صحيحة" });

//     const token = jwt.sign(
//       { id: user._id, username: user.username, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     res.status(200).json({
//       success: true,
//       token,
//       user: { _id: user._id, name: user.username, role: user.role }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- المنتجات والخدمات الأخرى ---

// exports.updatePhone = async (req, res) => {
//   try {
//     const { newPhone } = req.body;
//     const user = await userModel.findById(req.user._id);
//     if (!user) return res.status(404).json({ msg: "User not found" });
    
//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();
//     await sendOTP(newPhone, otp);
//     res.json({ msg: "OTP sent to your phone" });
//   } catch (error) {
//     res.status(500).json({ msg: "Failed to send OTP" });
//   }
// };

// exports.getAllProducts = async (req, res) => {
//   try {
//     const { category, isSpicy } = req.query;
//     const query = {};
//     if (category) query.category = category;
//     if (isSpicy !== undefined) query.isSpicy = isSpicy === "true";

//     const productsList = await products.find(query).populate("category").sort({ position: 1 }).lean();
//     res.status(200).json({ message: "Success", data: productsList });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getSingleProduct = async (req, res) => {
//   try {
//     const product = await products.findById(req.params.id).populate("category").lean();
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.status(200).json({ data: product });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const products = require("../models/products");
const Category = require("../models/Category");
const { generateOTP, sendOTP } = require("../utils/otp");
require("dotenv").config();

// ✅ جلب كل المستخدمين
exports.getuser = async (req, res) => {
  try {
    const users = await userModel.find().sort({ createdAt: -1 });
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
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- نظام المستخدمين العاديين (OTP) ---

exports.sendLoginOTP = async (req, res) => {
  const { phone } = req.body;
  try {
    let user = await userModel.findOne({ phone });
    
    // Rate limit: Prevent sending more than 1 OTP per 60 seconds
    if (user && user.otpExpires) {
      const timeSinceLastOTP = Date.now() - (user.otpExpires.getTime() - 5 * 60 * 1000);
      if (timeSinceLastOTP < 60000) { // 60 seconds
        return res.status(429).json({ msg: "Please wait 60 seconds before requesting a new OTP." });
      }
    }

    if (!user) {
      user = new userModel({ phone, role: "user" });
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
    if (user.otpExpires < Date.now()) return res.status(400).json({ msg: "OTP has expired" });

    user.otp = null;
    user.otpExpires = null;
    if (phone && newPhone) user.phone = newPhone;
    await user.save();

    const token = jwt.sign(
      { id: user._id, phone: user.phone, username: user.username, role: user.role },
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
};

// --- نظام الموظفين والمدراء (Password) ---

// ✅ إنشاء حساب جديد (موظف أو مدير)
exports.createEmployee = async (req, res) => {
  try {
    // نأخذ الـ role من الـ body لكي لا يتثبت كموظف دائماً
    const { name, password, role } = req.body; 

    if (!name || !password) {
      return res.status(400).json({ message: "يرجى إدخال الاسم وكلمة المرور" });
    }

    const userExists = await userModel.findOne({ username: name });
    if (userExists) return res.status(400).json({ message: "اسم المستخدم موجود مسبقاً" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      username: name,
      password: hashedPassword,
      role: role || "employee", // سيأخذ القيمة القادمة من الشاشة (admin أو employee)
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "تم إنشاء الحساب بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ تسجيل دخول الموظف أو المدير
exports.employeeLogin = async (req, res) => {
  try {
    const { name, password } = req.body;
    
    // البحث عن المستخدم إذا كان employee أو admin
    const user = await userModel.findOne({ 
      username: name, 
      role: { $in: ["employee", "admin","hr"] } 
    });
    
    if (!user || !user.password) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "كلمة المرور غير صحيحة" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      token,
      user: { _id: user._id, name: user.username, role: user.role }
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

    // Rate limit: Prevent sending more than 1 OTP per 60 seconds
    if (user && user.otpExpires) {
      const timeSinceLastOTP = Date.now() - (user.otpExpires.getTime() - 5 * 60 * 1000);
      if (timeSinceLastOTP < 60000) { // 60 seconds
        return res.status(429).json({ msg: "Please wait 60 seconds before requesting a new OTP." });
      }
    }
    
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendOTP(newPhone, otp);
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

    const productsList = await products.find(query).populate("category").sort({ position: 1 }).lean();
    res.status(200).json({ message: "Success", data: productsList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await products.findById(req.params.id).populate("category").lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
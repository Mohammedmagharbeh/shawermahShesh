const jwt = require("jsonwebtoken");

// ⚠️ إذا عندك middleware جاهز للتحقق من المستخدم (بملف مشابه بمشروعك
// زي verifyUser / protect / authMiddleware)، استخدمه هو بدل هاد الملف
// بس تأكد إنه بيحط req.userId بنفس الطريقة تحت.
module.exports = function verifyUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "غير مصرح — الرجاء تسجيل الدخول" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded._id || decoded.userId;

    if (!req.userId) {
      return res.status(401).json({ message: "توكن غير صالح" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "توكن غير صالح أو منتهي الصلاحية" });
  }
};
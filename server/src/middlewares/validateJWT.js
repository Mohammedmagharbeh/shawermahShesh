// const jwt = require("jsonwebtoken");
// const userModel = require("../models/user");

// const validateJWT = async (req, res, next) => {
//   const authorizationHeader = req.get("authorization");

//   if (!authorizationHeader) {
//     res.status(403).send("Authorization header was not provided");
//     return;
//   }

//   const token = authorizationHeader.split(" ")[1];

//   if (!token) {
//     res.status(403).send("Bearer token not found");
//     return;
//   }

//   jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
//     if (err || !payload) {
//       res.status(403).send("Invalid token");
//       return;
//     }

//     const user = await userModel.findOne({ phone: payload.phone });
//     if (!user) {
//       res.status(403).send("User not found");
//       return;
//     }

//     req.user = user;
//     next();
//   });
// };

// module.exports = validateJWT;

const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const validateJWT = async (req, res, next) => {
  const authorizationHeader = req.get("authorization");

  if (!authorizationHeader) {
    res.status(403).send("Authorization header was not provided");
    return;
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    res.status(403).send("Bearer token not found");
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err || !payload) {
      res.status(403).send("Invalid token");
      return;
    }

    try {
      // ✅ التعديل الجوهري: البحث عن طريق الـ ID (لأنه موجود في كل الحالات)
      // payload.id أو payload._id حسب ما تضعه في دالة الـ jwt.sign
      const userId = payload.id || payload._id;
      
      const user = await userModel.findById(userId);
      
      if (!user) {
        res.status(403).send("User not found");
        return;
      }

      // نمرر كائن المستخدم كاملاً للطلبات القادمة
      req.user = user;
      next();
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  });
};

module.exports = validateJWT;
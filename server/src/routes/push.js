// // const express = require("express");
// // const { Expo } = require("expo-server-sdk");
// // const validateJWT = require("../middlewares/validateJWT"); // عدّل المسار حسب مشروعك
// // const PushToken = require("../models/pushToken");

// // const router = express.Router();
// // const expo = new Expo();

// // // ⚠️ تأكد من اسم دور الأدمن بملف constants (USER_ROLES)
// // const ADMIN_ROLES = ["admin"];

// // const adminOnly = (req, res, next) => {
// //   if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
// //     return res.status(403).json({ error: "للأدمن فقط" });
// //   }
// //   next();
// // };

// // // التطبيق بيسجّل التوكن (مفتوح، لأنه بيشتغل قبل تسجيل الدخول كمان)
// // router.post("/register", async (req, res) => {
// //   try {
// //     const { token, platform } = req.body;
// //     if (!Expo.isExpoPushToken(token)) {
// //       return res.status(400).json({ error: "invalid token" });
// //     }
// //     await PushToken.updateOne(
// //       { token },
// //       { token, platform },
// //       { upsert: true },
// //     );
// //     res.json({ ok: true });
// //   } catch (e) {
// //     res.status(500).json({ error: "server error" });
// //   }
// // });

// // // عدد الأجهزة المسجلة
// // router.get("/stats", validateJWT, adminOnly, async (req, res) => {
// //   const [total, ios, android] = await Promise.all([
// //     PushToken.countDocuments(),
// //     PushToken.countDocuments({ platform: "ios" }),
// //     PushToken.countDocuments({ platform: "android" }),
// //   ]);
// //   res.json({ total, ios, android });
// // });

// // // إرسال للكل
// // router.post("/send", validateJWT, adminOnly, async (req, res) => {
// //   try {
// //     const { title, body } = req.body;
// //     if (!title?.trim() || !body?.trim()) {
// //       return res.status(400).json({ error: "العنوان والنص مطلوبين" });
// //     }

// //     const docs = await PushToken.find().lean();
// //     const messages = docs.map((d) => ({
// //       to: d.token,
// //       sound: "default",
// //       title: title.trim(),
// //       body: body.trim(),
// //       channelId: "default",
// //     }));

// //     let sent = 0;
// //     let failed = 0;
// //     const dead = [];

// //     for (const chunk of expo.chunkPushNotifications(messages)) {
// //       const tickets = await expo.sendPushNotificationsAsync(chunk);
// //       tickets.forEach((t, i) => {
// //         if (t.status === "ok") sent++;
// //         else {
// //           failed++;
// //           if (t.details?.error === "DeviceNotRegistered") dead.push(chunk[i].to);
// //         }
// //       });
// //     }

// //     if (dead.length) await PushToken.deleteMany({ token: { $in: dead } });
// //     res.json({ sent, failed, removed: dead.length });
// //   } catch (e) {
// //     console.error("push send error:", e);
// //     res.status(500).json({ error: "فشل الإرسال" });
// //   }
// // });

// // module.exports = router;

// const express = require("express");
// const jwt = require("jsonwebtoken");
// const { Expo } = require("expo-server-sdk");
// const validateJWT = require("../middlewares/validateJWT");
// const PushToken = require("../models/pushToken");
// const User = require("../models/user");

// const router = express.Router();
// const expo = new Expo();

// const ADMIN_ROLES = ["admin"];

// const adminOnly = (req, res, next) => {
//   if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
//     return res.status(403).json({ error: "للأدمن فقط" });
//   }
//   next();
// };

// // بيقرأ التوكن إذا موجود، وما بيرفض الطلب لو الزبون مش مسجل دخول
// const optionalAuth = async (req, res, next) => {
//   try {
//     const bearer = (req.get("authorization") || "").split(" ")[1];
//     if (bearer) {
//       const payload = jwt.verify(bearer, process.env.JWT_SECRET);
//       const user = await User.findById(payload.id || payload._id);
//       if (user) req.user = user;
//     }
//   } catch {}
//   next();
// };

// router.post("/register", optionalAuth, async (req, res) => {
//   try {
//     const { token, platform } = req.body;
//     if (!Expo.isExpoPushToken(token)) {
//       return res.status(400).json({ error: "invalid token" });
//     }
//     await PushToken.updateOne(
//       { token },
//       {
//         $set: {
//           token,
//           platform,
//           ...(req.user ? { userId: req.user._id } : {}),
//         },
//       },
//       { upsert: true },
//     );
//     res.json({ ok: true });
//   } catch (e) {
//     res.status(500).json({ error: "server error" });
//   }
// });

// router.get("/stats", validateJWT, adminOnly, async (req, res) => {
//   const [total, ios, android] = await Promise.all([
//     PushToken.countDocuments(),
//     PushToken.countDocuments({ platform: "ios" }),
//     PushToken.countDocuments({ platform: "android" }),
//   ]);
//   res.json({ total, ios, android });
// });

// router.post("/send", validateJWT, adminOnly, async (req, res) => {
//   try {
//     const { title, body } = req.body;
//     if (!title?.trim() || !body?.trim()) {
//       return res.status(400).json({ error: "العنوان والنص مطلوبين" });
//     }

//     const docs = await PushToken.find().lean();
//     const messages = docs.map((d) => ({
//       to: d.token,
//       sound: "default",
//       title: title.trim(),
//       body: body.trim(),
//       channelId: "default",
//     }));

//     let sent = 0;
//     let failed = 0;
//     const dead = [];

//     for (const chunk of expo.chunkPushNotifications(messages)) {
//       const tickets = await expo.sendPushNotificationsAsync(chunk);
//       tickets.forEach((t, i) => {
//         if (t.status === "ok") sent++;
//         else {
//           failed++;
//           if (t.details?.error === "DeviceNotRegistered") dead.push(chunk[i].to);
//         }
//       });
//     }

//     if (dead.length) await PushToken.deleteMany({ token: { $in: dead } });
//     res.json({ sent, failed, removed: dead.length });
//   } catch (e) {
//     console.error("push send error:", e);
//     res.status(500).json({ error: "فشل الإرسال" });
//   }
// });

// module.exports = router;


// خريى 

const express = require("express");
const jwt = require("jsonwebtoken");
const { Expo } = require("expo-server-sdk");
const validateJWT = require("../middlewares/validateJWT");
const PushToken = require("../models/pushToken");
const User = require("../models/user");

const mongoose = require("mongoose");
const router = express.Router();
const expo = new Expo();

const ADMIN_ROLES = ["admin"];

const adminOnly = (req, res, next) => {
  if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: "للأدمن فقط" });
  }
  next();
};

// بيقرأ التوكن إذا موجود، وما بيرفض الطلب لو الزبون مش مسجل دخول
const optionalAuth = async (req, res, next) => {
  try {
    const bearer = (req.get("authorization") || "").split(" ")[1];
    if (bearer) {
      const payload = jwt.verify(bearer, process.env.JWT_SECRET);
      const user = await User.findById(payload.id || payload._id);
      if (user) req.user = user;
      else console.log("[push] optionalAuth: user not found, payload:", payload);
    }
  } catch (e) {
    console.log("[push] optionalAuth failed:", e.message);
  }
  next();
};

router.post("/register", optionalAuth, async (req, res) => {
  try {
    const { token, platform, userId: bodyUserId } = req.body;
    const resolvedUserId =
      req.user?._id ||
      (bodyUserId && mongoose.Types.ObjectId.isValid(bodyUserId)
        ? bodyUserId
        : null);

    console.log("[push] register", {
      hasBearer: !!req.get("authorization"),
      hasUser: !!req.user,
      userId: resolvedUserId,
    });

    if (!Expo.isExpoPushToken(token)) {
      return res.status(400).json({ error: "invalid token" });
    }
    await PushToken.updateOne(
      { token },
      {
        $set: {
          token,
          platform,
          ...(resolvedUserId ? { userId: resolvedUserId } : {}),
        },
      },
      { upsert: true },
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("[push] register error:", e);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/stats", validateJWT, adminOnly, async (req, res) => {
  const [total, ios, android] = await Promise.all([
    PushToken.countDocuments(),
    PushToken.countDocuments({ platform: "ios" }),
    PushToken.countDocuments({ platform: "android" }),
  ]);
  res.json({ total, ios, android });
});

router.post("/send", validateJWT, adminOnly, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: "العنوان والنص مطلوبين" });
    }

    const docs = await PushToken.find().lean();
    const messages = docs.map((d) => ({
      to: d.token,
      sound: "default",
      title: title.trim(),
      body: body.trim(),
      channelId: "default",
    }));

    let sent = 0;
    let failed = 0;
    const dead = [];

    for (const chunk of expo.chunkPushNotifications(messages)) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((t, i) => {
        if (t.status === "ok") sent++;
        else {
          failed++;
          if (t.details?.error === "DeviceNotRegistered") dead.push(chunk[i].to);
        }
      });
    }

    if (dead.length) await PushToken.deleteMany({ token: { $in: dead } });
    res.json({ sent, failed, removed: dead.length });
  } catch (e) {
    console.error("push send error:", e);
    res.status(500).json({ error: "فشل الإرسال" });
  }
});

module.exports = router;
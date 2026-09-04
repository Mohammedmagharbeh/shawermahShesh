// const User = require("../models/user");
// // const { sendPushNotifications } = require("../../../frontend/src/services/pushService");

// // POST /users/push-token
// // async function savePushToken(req, res) {
// //   try {
// //     const { token } = req.body;
// //     if (!token) {
// //       return res.status(400).json({ message: "Push token is required" });
// //     }

// //     await User.findByIdAndUpdate(req.user._id, {
// //       $addToSet: { pushTokens: token },
// //     });

// //     res.json({ message: "Push token saved" });
// //   } catch (err) {
// //     console.error("savePushToken error:", err);
// //     res.status(500).json({ message: "Failed to save push token" });
// //   }
// // }

// async function savePushToken(req, res) {
//   try {
//     const { token } = req.body;
//     if (!token) {
//       return res.status(400).json({ message: "Push token is required" });
//     }

//     await User.findByIdAndUpdate(req.user._id, {
//       $addToSet: { pushTokens: token },
//     });

//     res.json({ message: "Push token saved" });
//   } catch (err) {
//     console.error("savePushToken error:", err);
//     res.status(500).json({ message: "Failed to save push token" });
//   }
// }


// // DELETE /users/push-token
// // async function removePushToken(req, res) {
// //   try {
// //     const { token } = req.body;
// //     if (!token) {
// //       return res.status(400).json({ message: "Push token is required" });
// //     }

// //     await User.findByIdAndUpdate(req.user._id, {
// //       $pull: { pushTokens: token },
// //     });

// //     res.json({ message: "Push token removed" });
// //   } catch (err) {
// //     console.error("removePushToken error:", err);
// //     res.status(500).json({ message: "Failed to remove push token" });
// //   }
// // }

// async function removePushToken(req, res) {
//   try {
//     const { token } = req.body;
//     if (!token) {
//       return res.status(400).json({ message: "Push token is required" });
//     }

//     await User.findByIdAndUpdate(req.user._id, {
//       $pull: { pushTokens: token },
//     });

//     res.json({ message: "Push token removed" });
//   } catch (err) {
//     console.error("removePushToken error:", err);
//     res.status(500).json({ message: "Failed to remove push token" });
//   }
// }

// // POST /admin/notifications/broadcast
// // async function broadcastNotification(req, res) {
// //   try {
// //     const { title, body, productId } = req.body;
// //     if (!title || !body) {
// //       return res.status(400).json({ message: "title and body are required" });
// //     }

// //     const users = await User.find({
// //       pushTokens: { $exists: true, $ne: [] },
// //     }).select("pushTokens");

// //     const allTokens = users.flatMap((u) => u.pushTokens);

// //     const result = await sendPushNotifications(allTokens, {
// //       title,
// //       body,
// //       data: productId ? { productId } : {},
// //     });

// //     res.json({ message: "Notification broadcast sent", recipients: result.sent });
// //   } catch (err) {
// //     console.error("broadcastNotification error:", err);
// //     res.status(500).json({ message: "Failed to send notifications" });
// //   }
// // }

// // POST /admin/notifications/broadcast
// async function broadcastNotification(req, res) {
//   try {
//     const { title, body, productId } = req.body;
//     if (!title || !body) {
//       return res.status(400).json({ message: "title and body are required" });
//     }

//     const users = await User.find({
//       pushTokens: { $exists: true, $ne: [] },
//     }).select("pushTokens");

//     const allTokens = users.flatMap((u) => u.pushTokens);

//     // ✅ إضافة sound, priority, و channelId هنا
//     const result = await sendPushNotifications(allTokens, {
//       title,
//       body,
//       sound: "default",       // 👈 صوت التنبيه
//       priority: "high",       // 👈 أولوية قصوى لأندرويد
//       channelId: "default",   // 👈 القناة المعرفة بـ _layout.jsx
//       data: productId ? { productId } : {},
//     });

//     res.json({ message: "Notification broadcast sent", recipients: result.sent });
//   } catch (err) {
//     console.error("broadcastNotification error:", err);
//     res.status(500).json({ message: "Failed to send notifications" });
//   }
// }

// module.exports = { savePushToken, removePushToken, broadcastNotification };


const User = require("../models/user");

// دالة باك إند محلية لإرسال الإشعارات عبر Expo Push API بدون الاعتماد على الفرونت إند
async function sendPushNotifications(tokens, messageData) {
  if (!tokens || tokens.length === 0) return { sent: 0 };

  const messages = tokens.map((token) => ({
    to: token,
    sound: messageData.sound || "default",
    title: messageData.title,
    body: messageData.body,
    priority: messageData.priority || "high",
    channelId: messageData.channelId || "default",
    data: messageData.data || {},
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  const data = await response.json();
  return { sent: messages.length, data };
}

// POST /users/push-token
async function savePushToken(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Push token is required" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { pushTokens: token },
    });

    res.json({ message: "Push token saved" });
  } catch (err) {
    console.error("savePushToken error:", err);
    res.status(500).json({ message: "Failed to save push token" });
  }
}

// DELETE /users/push-token
async function removePushToken(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Push token is required" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { pushTokens: token },
    });

    res.json({ message: "Push token removed" });
  } catch (err) {
    console.error("removePushToken error:", err);
    res.status(500).json({ message: "Failed to remove push token" });
  }
}

// POST /admin/notifications/broadcast
// async function broadcastNotification(req, res) {
//   try {
//     const { title, body, productId } = req.body;
//     if (!title || !body) {
//       return res.status(400).json({ message: "title and body are required" });
//     }

//     const users = await User.find({
//       pushTokens: { $exists: true, $ne: [] },
//     }).select("pushTokens");

//     const allTokens = users.flatMap((u) => u.pushTokens);

//     const result = await sendPushNotifications(allTokens, {
//       title,
//       body,
//       sound: "default",
//       priority: "high",
//       channelId: "default",
//       data: productId ? { productId } : {},
//     });

//     res.json({ message: "Notification broadcast sent", recipients: result.sent });
//   } catch (err) {
//     console.error("broadcastNotification error:", err);
//     res.status(500).json({ message: "Failed to send notifications" });
//   }
// }

// POST /admin/notifications/broadcast
async function broadcastNotification(req, res) {
  try {
    const { title, body, productId } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "title and body are required" });
    }

    const users = await User.find({
      pushTokens: { $exists: true, $ne: [] },
    }).select("pushTokens");

    const allTokens = users.flatMap((u) => u.pushTokens);

    const result = await sendPushNotifications(allTokens, {
      title,
      body,
      sound: "default",
      priority: "high",
      channelId: "default",
      data: productId ? { productId } : {},
    });

    // 👈 طباعة التقرير الكامل من خوادم Expo في التيرمنال
    console.log("Expo Push Tickets Response:", JSON.stringify(result.data, null, 2));

    res.json({ 
      message: "Notification broadcast sent", 
      recipients: result.sent,
      expoDetails: result.data // 👈 إرجاع النتيجة لتراها بـ Postman أو الواجهة
    });
  } catch (err) {
    console.error("broadcastNotification error:", err);
    res.status(500).json({ message: "Failed to send notifications" });
  }
}

module.exports = { savePushToken, removePushToken, broadcastNotification };
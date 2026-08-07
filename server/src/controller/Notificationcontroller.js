const User = require("../models/User");
const { sendPushNotifications } = require("../../../frontend/src/services/pushService");

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
      data: productId ? { productId } : {},
    });

    res.json({ message: "Notification broadcast sent", recipients: result.sent });
  } catch (err) {
    console.error("broadcastNotification error:", err);
    res.status(500).json({ message: "Failed to send notifications" });
  }
}

module.exports = { savePushToken, removePushToken, broadcastNotification };
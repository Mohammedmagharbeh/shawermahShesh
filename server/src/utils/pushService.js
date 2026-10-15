const { Expo } = require("expo-server-sdk");
const PushToken = require("../models/pushToken");

const expo = new Expo();

// الرسائل اللي بتوصل للزبون عند كل حالة (عدّلها زي ما بدك)
const ORDER_STATUS_MESSAGES = {
  Confirmed: "تم تأكيد طلبك وجاري تجهيزه 👨‍🍳",
  Shipped: "طلبك صار جاهز وبطريقه إلك",
  OutForDelivery: "طلبك بالطريق إلك 🚗",
  ReadyForPickup: "طلبك جاهز للاستلام ✅",
  Delivered: "تم تسليم طلبك، بالهنا والشفا 🍽️",
  Cancelled: "تم إلغاء طلبك",
};

// async function sendToUser(userId, title, body, data = {}) {
//   try {
//     if (!userId) return;

//     const docs = await PushToken.find({ userId }).lean();
//     const messages = docs
//       .filter((d) => Expo.isExpoPushToken(d.token))
//       .map((d) => ({
//         to: d.token,
//         sound: "default",
//         title,
//         body,
//         data,
//         channelId: "default",
//       }));

//     if (!messages.length) return;

//     const dead = [];
//     for (const chunk of expo.chunkPushNotifications(messages)) {
//       const tickets = await expo.sendPushNotificationsAsync(chunk);
//       tickets.forEach((t, i) => {
//         if (t.status === "error" && t.details?.error === "DeviceNotRegistered") {
//           dead.push(chunk[i].to);
//         }
//       });
//     }

//     if (dead.length) await PushToken.deleteMany({ token: { $in: dead } });
//   } catch (e) {
//     // الإشعار ما لازم يكسر تحديث الطلب
//     console.error("sendToUser failed:", e.message);
//   }
// }

async function sendToUser(userId, title, body, data = {}) {
  try {
    console.log("[push] sendToUser userId:", userId);
    if (!userId) {
      console.log("[push] no userId");
      return;
    }

    const docs = await PushToken.find({ userId }).lean();
    console.log("[push] tokens found:", docs.length, docs.map((d) => d.token));

    const messages = docs
      .filter((d) => Expo.isExpoPushToken(d.token))
      .map((d) => ({
        to: d.token,
        sound: "default",
        title,
        body,
        data,
        channelId: "default",
      }));

    console.log("[push] valid messages:", messages.length);
    if (!messages.length) return;

    const dead = [];
    for (const chunk of expo.chunkPushNotifications(messages)) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      console.log("[push] tickets:", JSON.stringify(tickets));
      tickets.forEach((t, i) => {
        if (t.status === "error" && t.details?.error === "DeviceNotRegistered") {
          dead.push(chunk[i].to);
        }
      });
    }

    if (dead.length) await PushToken.deleteMany({ token: { $in: dead } });
  } catch (e) {
    console.error("sendToUser failed:", e);
  }
}
module.exports = { sendToUser, ORDER_STATUS_MESSAGES };
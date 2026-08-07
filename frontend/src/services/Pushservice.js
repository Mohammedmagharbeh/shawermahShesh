// // npm install expo-server-sdk
// const { Expo } = require("expo-server-sdk");

// const expo = new Expo();

// async function sendPushNotifications(pushTokens = [], { title, body, data = {} }) {
//   const uniqueValidTokens = [...new Set(pushTokens)].filter((token) =>
//     Expo.isExpoPushToken(token),
//   );

//   if (uniqueValidTokens.length === 0) {
//     return { sent: 0, tickets: [] };
//   }

//   const messages = uniqueValidTokens.map((token) => ({
//     to: token,
//     sound: "default",
//     title,
//     body,
//     data,
//   }));

//   const chunks = expo.chunkPushNotifications(messages);
//   const tickets = [];

//   for (const chunk of chunks) {
//     try {
//       const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//       tickets.push(...ticketChunk);
//     } catch (err) {
//       console.error("Push notification send error:", err);
//     }
//   }

//   return { sent: uniqueValidTokens.length, tickets };
// }

// module.exports = { sendPushNotifications };

// npm install expo-server-sdk
import { Expo } from "expo-server-sdk";

const expo = new Expo();

async function sendPushNotifications(pushTokens = [], { title, body, data = {} }) {
  const uniqueValidTokens = [...new Set(pushTokens)].filter((token) =>
    Expo.isExpoPushToken(token),
  );

  if (uniqueValidTokens.length === 0) {
    return { sent: 0, tickets: [] };
  }

  const messages = uniqueValidTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error("Push notification send error:", err);
    }
  }

  return { sent: uniqueValidTokens.length, tickets };
}

export { sendPushNotifications };
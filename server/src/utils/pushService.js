const { Expo } = require("expo-server-sdk");
const mongoose = require("mongoose");
const PushToken = require("../models/pushToken");

const expo = new Expo();

// الرسائل المعتمدة لكل حالة من حالات الطلب
const ORDER_STATUS_MESSAGES = {
  Confirmed: "تم تأكيد طلبك وجاري تجهيزه 👨‍🍳",
  Shipped: "طلبك صار جاهز وبطريقه إلك 🚗",
  OutForDelivery: "طلبك بالطريق إلك 🚗",
  ReadyForPickup: "طلبك جاهز للاستلام من الفرع ✅",
  Delivered: "تم تسليم طلبك، بالهنا والشفا 🍽️",
  Submitted: "تم تسليم طلبك، بالهنا والشفا 🍽️",
  Cancelled: "تم إلغاء طلبك ❌",
  Canceled: "تم إلغاء طلبك ❌",
};

/**
 * Returns formatted { title, body } for customer push notification based on order status and type.
 * Also supports string coercion (pushMsg.toString() returns body) for backward compatibility.
 */
const getOrderStatusPushMessage = (status, orderType, order = {}) => {
  if (!status) return null;
  const rawStatus = String(status).trim();
  const norm = rawStatus.toLowerCase().replace(/[\s_-]/g, "");
  const seqStr = order.sequenceNumber ? ` #${order.sequenceNumber}` : "";
  const isPickup = String(orderType || order.orderType || "").toLowerCase() === "pickup";

  let title = "تحديث على حالة الطلب 🔔";
  let body = "";

  if (norm === "confirmed" || norm === "processing") {
    title = "تم تأكيد طلبك 👨‍🍳";
    body = `تم تأكيد طلبك${seqStr} وبدأ فريق المطبخ في تحضيره.`;
  } else if (norm === "readyforpickup" || norm === "ready") {
    if (isPickup) {
      title = "طلبك جاهز للاستلام! ✅";
      body = `طلبك${seqStr} جاهز للاستلام الآن من كاونتر الفرع. أهلاً بك!`;
    } else {
      title = "طلبك جاهز وبانتظار الكابتن 🛵";
      body = `طلبك${seqStr} جاهز في المطعم وبانتظار استلام السائق للانطلاق إليك.`;
    }
  } else if (norm === "shipped" || norm === "outfordelivery" || norm === "ondelivery") {
    title = "طلبك في الطريق إليك 🚗";
    const otpPart = order.deliveryOtp ? ` رمز التسليم عند الاستلام: ${order.deliveryOtp}` : "";
    body = `طلبك${seqStr} صار مع الكابتن وبطريقه إلك!${otpPart}`;
  } else if (norm === "delivered" || norm === "submitted" || norm === "completed") {
    title = isPickup ? "تم استلام الطلب 🍽️" : "تم تسليم طلبك 🍽️";
    body = isPickup
      ? `تم استلام طلبك${seqStr} بنجاح. شكراً لزيارتك وبالهنا والشفا!`
      : `تم تسليم طلبك${seqStr} بنجاح. شكراً لطلبك من شاورما شيش، بالهنا والشفا!`;
  } else if (norm === "cancelled" || norm === "canceled") {
    title = "تم إلغاء الطلب ❌";
    body = `نأسف، تم إلغاء طلبك${seqStr}.`;
  } else {
    const fallbackText = ORDER_STATUS_MESSAGES[rawStatus];
    if (!fallbackText) return null;
    title = "حالة الطلب";
    body = `${fallbackText}${seqStr ? ` (طلب${seqStr})` : ""}`;
  }

  const result = { title, body };
  result.toString = () => body;
  return result;
};

/**
 * Resiliently sends a push notification to a user.
 * Target can be:
 * - String / ObjectId of User
 * - User document
 * - Order document (extracts userId or userDetails.phone)
 */
async function sendToUser(target, titleOrMsg, bodyParam, data = {}) {
  try {
    let targetUserId = null;

    // 1. Resolve userId from various possible inputs (user ID, User doc, or Order doc)
    if (typeof target === "string") {
      targetUserId = target;
    } else if (target && typeof target === "object") {
      if (target._bsontype === "ObjectID" || target instanceof mongoose.Types.ObjectId) {
        targetUserId = String(target);
      } else if (target.userId) {
        const u = target.userId;
        targetUserId = u?._id ? String(u._id) : String(u);
      } else if (target._id && !target.products) {
        // user object
        targetUserId = String(target._id);
      }
    }

    // 2. If targetUserId is still not found, check if target has a phone number to find user
    if (!targetUserId && target && typeof target === "object") {
      const phone = target.userDetails?.phone || target.customerPhone || target.phone;
      if (phone) {
        try {
          const User = require("../models/user");
          const userDoc = await User.findOne({ phone }).select("_id").lean();
          if (userDoc) targetUserId = String(userDoc._id);
        } catch (phoneErr) {
          console.warn("[push] User lookup by phone failed:", phoneErr.message);
        }
      }
    }

    if (!targetUserId) {
      console.log("[push] sendToUser skipped: no userId could be resolved from target:", target);
      return;
    }

    // 3. Resolve title & body (supports passing `{ title, body }` as second arg)
    let title = titleOrMsg;
    let body = bodyParam;
    let payloadData = data;

    if (titleOrMsg && typeof titleOrMsg === "object" && titleOrMsg.title) {
      title = titleOrMsg.title;
      body = titleOrMsg.body;
      payloadData = bodyParam || {};
    }

    if (!body) {
      console.log("[push] sendToUser skipped: body is empty");
      return;
    }

    // 4. Query PushToken collection by userId (supporting both ObjectId & string)
    const orConditions = [{ userId: targetUserId }];
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      orConditions.push({ userId: new mongoose.Types.ObjectId(targetUserId) });
    }

    const docs = await PushToken.find({ $or: orConditions }).lean();
    console.log(`[push] sendToUser target: ${targetUserId}, found tokens: ${docs.length}`);

    const messages = docs
      .filter((d) => Expo.isExpoPushToken(d.token))
      .map((d) => ({
        to: d.token,
        sound: "default",
        priority: "high",
        channelId: "default",
        title: title || "شاورما شيش",
        body: String(body),
        data: payloadData,
      }));

    if (!messages.length) {
      console.log("[push] no valid expo push tokens for user:", targetUserId);
      return;
    }

    const dead = [];
    for (const chunk of expo.chunkPushNotifications(messages)) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      console.log("[push] tickets status:", tickets.map((t) => t.status).join(", "));
      tickets.forEach((t, i) => {
        if (t.status === "error" && t.details?.error === "DeviceNotRegistered") {
          dead.push(chunk[i].to);
        }
      });
    }

    if (dead.length) {
      console.log(`[push] removing ${dead.length} dead tokens`);
      await PushToken.deleteMany({ token: { $in: dead } });
    }
  } catch (e) {
    console.error("[push] sendToUser error:", e);
  }
}

/**
 * High-level helper: notifies customer on an order status transition.
 */
async function notifyCustomerOnOrderStatusChange(order, newStatus, previousStatus) {
  try {
    if (!order || !newStatus) return;
    if (
      previousStatus &&
      String(newStatus).trim().toLowerCase() === String(previousStatus).trim().toLowerCase()
    ) {
      return; // Same status, no notification needed
    }

    const pushMsg = getOrderStatusPushMessage(newStatus, order.orderType, order);
    if (!pushMsg) return;

    await sendToUser(
      order,
      pushMsg.title,
      pushMsg.body,
      {
        orderId: String(order._id),
        sequenceNumber: order.sequenceNumber,
        status: newStatus,
        orderType: order.orderType,
        deliveryOtp: order.deliveryOtp || null,
      }
    );
  } catch (err) {
    console.error("[push] notifyCustomerOnOrderStatusChange error:", err);
  }
}

module.exports = {
  sendToUser,
  ORDER_STATUS_MESSAGES,
  getOrderStatusPushMessage,
  notifyCustomerOnOrderStatusChange,
};
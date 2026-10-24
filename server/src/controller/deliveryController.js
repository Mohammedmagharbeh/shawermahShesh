const Order = require("../models/orders");
const User = require("../models/user");
require("../models/products");
require("../models/locations");
const { BRANCH_QR_CODE } = require("../constants");
const { sendToUser } = require("../utils/pushService");

/**
 * 1. GET /api/delivery/queue
 * Returns ReadyForPickup delivery orders + available drivers in FIFO order (by returnedAt)
 * Accessible by: admin, employee, cashier
 */
exports.getDeliveryQueue = async (req, res) => {
  try {
    // 1. Fetch orders ready for delivery pickup (excluding external ishbek orders)
    const orders = await Order.find({
      status: "ReadyForPickup",
      orderType: "delivery",
      source: { $ne: "ishbek" },
    })
      .populate("products.productId", "name image basePrice")
      .populate("userId", "name username phone")
      .populate("shippingAddress")
      .populate("assignedRiderId", "_id name username phone driverStatus")
      .sort({ createdAt: 1 })
      .lean();

    // 2. Fetch available drivers sorted FIFO by returnedAt (oldest return time first)
    const availableDrivers = await User.find({
      role: "rider",
      driverStatus: "available",
    })
      .select("_id name username phone driverStatus currentOrderId returnedAt")
      .sort({ returnedAt: 1 })
      .lean();

    // 3. Fetch all riders for staff monitoring
    const allDrivers = await User.find({ role: "rider" })
      .select("_id name username phone driverStatus currentOrderId returnedAt")
      .populate("currentOrderId", "sequenceNumber status totalPrice userDetails")
      .sort({ returnedAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      orders,
      availableDrivers,
      allDrivers,
    });
  } catch (error) {
    console.error("Error in getDeliveryQueue:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. POST /api/delivery/assign
 * Staff assigns an order to an available driver
 * Body: { orderId, riderId }
 * Accessible by: admin, employee, cashier
 */
exports.assignOrderToDriver = async (req, res) => {
  try {
    const { orderId, riderId } = req.body;

    if (!orderId || !riderId) {
      return res.status(400).json({
        success: false,
        message: "orderId and riderId are required",
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    }

    if (order.source === "ishbek") {
      return res.status(400).json({
        success: false,
        message: "طلبات إشبك (طلبات خارجية مثل طلبات) لا يتم تعيينها لسائقي الفرع",
      });
    }

    if (order.orderType !== "delivery") {
      return res.status(400).json({
        success: false,
        message: "هذا الطلب ليس طلب توصيل",
      });
    }

    if (order.status !== "ReadyForPickup") {
      return res.status(400).json({
        success: false,
        message: `الطلب ليس جاهزاً للتسليم (الحالة الحالية: ${order.status})`,
      });
    }

    // Find driver
    const rider = await User.findById(riderId);
    if (!rider || !["rider", "admin"].includes(rider.role)) {
      return res.status(404).json({ success: false, message: "السائق غير موجود" });
    }

    if (rider.driverStatus !== "available") {
      return res.status(400).json({
        success: false,
        message: `السائق غير متاح حالياً (الحالة: ${rider.driverStatus})`,
      });
    }

    // Update driver state
    rider.driverStatus = "assigned";
    rider.currentOrderId = order._id;
    await rider.save();

    // Update order state (status remains ReadyForPickup until driver physically picks up)
    order.assignedRiderId = rider._id;
    order.assignedAt = new Date();
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress")
      .populate("assignedRiderId", "_id name username phone driverStatus");

    // Push notification to rider
    sendToUser(
      rider._id,
      "طلب جديد بانتظارك 🛵",
      `تم تعيين الطلب #${order.sequenceNumber} لك، يرجى استلامه من المطعم`,
      { orderId: String(order._id) }
    );

    // Socket emission
    const io = req.app.get("io");
    if (io) {
      io.emit("driverAssigned", {
        orderId: order._id,
        riderId: rider._id,
        order: populatedOrder,
        rider: {
          _id: rider._id,
          name: rider.name || rider.username,
          phone: rider.phone,
          driverStatus: rider.driverStatus,
          currentOrderId: rider.currentOrderId,
        },
      });
      io.emit("updatedOrder", populatedOrder);
      io.emit("driverStatusChanged", {
        riderId: rider._id,
        driverStatus: "assigned",
        currentOrderId: order._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "تم تعيين السائق للطلب بنجاح",
      order: populatedOrder,
      rider: {
        _id: rider._id,
        name: rider.name || rider.username,
        driverStatus: rider.driverStatus,
        currentOrderId: rider.currentOrderId,
      },
    });
  } catch (error) {
    console.error("Error in assignOrderToDriver:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. POST /api/delivery/confirm-pickup
 * Driver confirms physical pickup from branch
 * Body: { orderId } (optional if rider is already assigned)
 * Accessible by: rider
 */
exports.confirmPickup = async (req, res) => {
  try {
    const callerId = req.user._id || req.user.id;
    const caller = await User.findById(callerId);

    if (!caller || !["rider", "admin"].includes(caller.role)) {
      return res.status(403).json({ success: false, message: "غير مصرح لك" });
    }

    // Allow admin to act on behalf of a rider if riderId is passed
    const targetRiderId =
      caller.role === "admin" && req.body.riderId ? req.body.riderId : callerId;
    const rider = await User.findById(targetRiderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: "السائق غير موجود" });
    }

    let orderId = req.body.orderId || rider.currentOrderId;
    if (!orderId) {
      const activeOrder = await Order.findOne({
        assignedRiderId: rider._id,
        status: "ReadyForPickup",
      });
      if (activeOrder) orderId = activeOrder._id;
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "ليس لديك طلب مخصص قيد الانتظار للاستلام",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    }

    // Generate 3-digit OTP (100 - 999)
    const deliveryOtp = Math.floor(100 + Math.random() * 900).toString();

    // Update order state
    order.status = "Shipped";
    order.shippedAt = new Date();
    order.deliveryOtp = deliveryOtp;
    order.assignedRiderId = rider._id;
    await order.save();

    // Update rider state
    rider.driverStatus = "on_delivery";
    rider.currentOrderId = order._id;
    await rider.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress")
      .populate("assignedRiderId", "_id name username phone driverStatus");

    // Push notification to customer with OTP
    const customerUserId = order.userId?._id || order.userId;
    sendToUser(
      customerUserId,
      "طلبك صار جاهز وبطريقه إلك 🚗",
      `طلب #${order.sequenceNumber} بالطريق إلك! رمز التسليم عند الاستلام: ${deliveryOtp}`,
      { orderId: String(order._id), deliveryOtp }
    );

    // Socket emission
    const io = req.app.get("io");
    if (io) {
      io.emit("updatedOrder", populatedOrder);
      io.emit("driverStatusChanged", {
        riderId: rider._id,
        driverStatus: "on_delivery",
        currentOrderId: order._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "تم تأكيد استلام الطلب وبدء رحلة التوصيل",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error in confirmPickup:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. POST /api/delivery/verify-otp
 * Driver verifies customer OTP upon delivery
 * Body: { orderId, otp }
 * Accessible by: rider
 */
exports.verifyDeliveryOtp = async (req, res) => {
  try {
    const callerId = req.user._id || req.user.id;
    const caller = await User.findById(callerId);

    if (!caller || !["rider", "admin"].includes(caller.role)) {
      return res.status(403).json({ success: false, message: "غير مصرح لك" });
    }

    const { orderId, otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "رمز التحقق (OTP) مطلوب",
      });
    }

    const targetRiderId =
      caller.role === "admin" && req.body.riderId ? req.body.riderId : callerId;
    const rider = await User.findById(targetRiderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: "السائق غير موجود" });
    }

    let targetOrderId = orderId || rider.currentOrderId;
    if (!targetOrderId) {
      const activeOrder = await Order.findOne({
        assignedRiderId: rider._id,
        status: "Shipped",
      });
      if (activeOrder) targetOrderId = activeOrder._id;
    }

    const order = await Order.findById(targetOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    }

    // Verify OTP match
    if (!order.deliveryOtp || String(order.deliveryOtp).trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "رمز التحقق غير صحيح، يرجى التأكد من الرمز وإعادة المحاولة",
      });
    }

    // Mark order as Delivered (terminal status in the system) and record submittedAt timestamp
    order.status = "Delivered";
    order.submittedAt = new Date();
    order.deliveryOtp = null;
    await order.save();

    // Update driver: transitioning to returning
    rider.driverStatus = "returning";
    rider.currentOrderId = null;
    await rider.save();

    // If order has an assigned rider different from caller/target rider, update them too
    if (order.assignedRiderId && String(order.assignedRiderId) !== String(rider._id)) {
      const assignedRider = await User.findById(order.assignedRiderId);
      if (assignedRider && assignedRider.role === "rider") {
        assignedRider.driverStatus = "returning";
        assignedRider.currentOrderId = null;
        await assignedRider.save();
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress")
      .populate("assignedRiderId", "_id name username phone driverStatus");

    // Push notification to customer
    const customerUserId = order.userId?._id || order.userId;
    sendToUser(
      customerUserId,
      "تم تسليم طلبك، بالهنا والشفا 🍽️",
      `تم تسليم طلبك #${order.sequenceNumber} بنجاح. شكراً لطلبك من شاورما شيش!`,
      { orderId: String(order._id) }
    );

    // Socket emission
    const io = req.app.get("io");
    if (io) {
      io.emit("updatedOrder", populatedOrder);
      io.emit("driverStatusChanged", {
        riderId: rider._id,
        driverStatus: "returning",
        currentOrderId: null,
      });
      if (order.assignedRiderId && String(order.assignedRiderId) !== String(rider._id)) {
        io.emit("driverStatusChanged", {
          riderId: order.assignedRiderId,
          driverStatus: "returning",
          currentOrderId: null,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "تم التحقق من الرمز وتسليم الطلب بنجاح",
      order: populatedOrder,
      rider: {
        _id: rider._id,
        name: rider.name || rider.username,
        driverStatus: "returning",
        currentOrderId: null,
      },
    });
  } catch (error) {
    console.error("Error in verifyDeliveryOtp:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. POST /api/delivery/qr-checkin
 * Driver scans branch physical QR code to return to 'available' pool
 * Body: { qrCode }
 * Accessible by: rider, admin
 */
exports.qrCheckIn = async (req, res) => {
  try {
    const callerId = req.user._id || req.user.id;
    const caller = await User.findById(callerId);

    if (!caller || !["rider", "admin"].includes(caller.role)) {
      return res.status(403).json({ success: false, message: "غير مصرح لك" });
    }

    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: "رمز الـ QR مطلوب",
      });
    }

    if (qrCode !== BRANCH_QR_CODE) {
      return res.status(400).json({
        success: false,
        message: "رمز الـ QR غير صحيح. يرجى مسح رمز الفرع المعتمد",
      });
    }

    const targetRiderId =
      caller.role === "admin" && req.body.riderId ? req.body.riderId : callerId;
    const rider = await User.findById(targetRiderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: "السائق غير موجود" });
    }

    const prevOrderId = rider.currentOrderId;

    // Set driver to available and record returnedAt for FIFO queuing
    rider.driverStatus = "available";
    rider.returnedAt = new Date();
    rider.currentOrderId = null;
    await rider.save();

    // Revert any pending/uncompleted assigned orders back to ReadyForPickup
    const orderQuery = {
      $or: [
        { assignedRiderId: rider._id, status: { $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"] } },
        ...(prevOrderId ? [{ _id: prevOrderId, status: { $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"] } }] : []),
      ],
    };

    const activeOrders = await Order.find(orderQuery);
    const io = req.app.get("io");

    for (const ord of activeOrders) {
      ord.assignedRiderId = null;
      ord.assignedAt = null;
      ord.shippedAt = null;
      ord.deliveryOtp = null;
      ord.status = "ReadyForPickup";
      await ord.save();

      if (io) {
        const populatedOrd = await Order.findById(ord._id)
          .populate("products.productId", "name image basePrice")
          .populate("userId", "name username phone")
          .populate("shippingAddress");
        io.emit("updatedOrder", populatedOrd || ord);
        io.emit("orderUpdated", populatedOrd || ord);
      }
    }

    // Close trip duration on driver's last delivered order
    await Order.findOneAndUpdate(
      {
        assignedRiderId: rider._id,
        status: { $in: ["Delivered", "Submitted"] },
        returnedAt: null,
      },
      { returnedAt: rider.returnedAt },
      { sort: { submittedAt: -1 } }
    );

    // Socket emission
    if (io) {
      io.emit("driverAvailable", {
        riderId: rider._id,
        rider: {
          _id: rider._id,
          name: rider.name || rider.username,
          phone: rider.phone,
          driverStatus: rider.driverStatus,
          returnedAt: rider.returnedAt,
        },
      });
      io.emit("driverStatusChanged", {
        riderId: rider._id,
        driverStatus: "available",
        currentOrderId: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "تم تسجيل العودة للفرع بنجاح، أنت الآن متاح في قائمة الانتظار",
      rider: {
        _id: rider._id,
        name: rider.name || rider.username,
        driverStatus: rider.driverStatus,
        returnedAt: rider.returnedAt,
      },
    });
  } catch (error) {
    console.error("Error in qrCheckIn:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. POST /api/delivery/manual-checkin/:riderId
 * Staff manually resets/checks-in a driver back to 'available'
 * Param: riderId
 * Accessible by: admin, employee, cashier
 */
exports.manualCheckIn = async (req, res) => {
  try {
    const { riderId } = req.params;

    const rider = await User.findById(riderId);
    if (!rider || rider.role !== "rider") {
      return res.status(404).json({ success: false, message: "السائق غير موجود" });
    }

    const prevOrderId = rider.currentOrderId;

    rider.driverStatus = "available";
    rider.returnedAt = new Date();
    rider.currentOrderId = null;
    await rider.save();

    // 1. Revert any active assigned order(s) for this driver back to the unassigned queue
    const orderQuery = {
      $or: [
        { assignedRiderId: rider._id, status: { $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"] } },
        ...(prevOrderId ? [{ _id: prevOrderId, status: { $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"] } }] : []),
      ],
    };

    const activeOrders = await Order.find(orderQuery);
    const io = req.app.get("io");

    for (const ord of activeOrders) {
      ord.assignedRiderId = null;
      ord.assignedAt = null;
      ord.shippedAt = null;
      ord.deliveryOtp = null;
      ord.status = "ReadyForPickup";
      await ord.save();

      // Notify clients that order has been reverted back to unassigned queue
      if (io) {
        const populatedOrd = await Order.findById(ord._id)
          .populate("products.productId", "name image basePrice")
          .populate("userId", "name username phone")
          .populate("shippingAddress");
        io.emit("updatedOrder", populatedOrd || ord);
        io.emit("orderUpdated", populatedOrd || ord);
      }
    }

    // Close trip duration on driver's last delivered order
    await Order.findOneAndUpdate(
      {
        assignedRiderId: rider._id,
        status: { $in: ["Delivered", "Submitted"] },
        returnedAt: null,
      },
      { returnedAt: rider.returnedAt },
      { sort: { submittedAt: -1 } }
    );

    // Socket emission for driver status
    if (io) {
      io.emit("driverAvailable", {
        riderId: rider._id,
        rider: {
          _id: rider._id,
          name: rider.name || rider.username,
          phone: rider.phone,
          driverStatus: rider.driverStatus,
          returnedAt: rider.returnedAt,
        },
      });
      io.emit("driverStatusChanged", {
        riderId: rider._id,
        driverStatus: "available",
        currentOrderId: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: activeOrders.length > 0
        ? "تم إعادة تعيين السائق إلى متاح، وإلغاء تعيين الطلب وإعادته لطابور الإرسال بنجاح"
        : "تم إعادة تعيين حالة السائق إلى متاح بنجاح",
      revertedOrdersCount: activeOrders.length,
      rider: {
        _id: rider._id,
        name: rider.name || rider.username,
        driverStatus: rider.driverStatus,
        returnedAt: rider.returnedAt,
      },
    });
  } catch (error) {
    console.error("Error in manualCheckIn:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6.1 POST /api/delivery/unassign/:orderId
 * Manually unassign an order from its driver and return both to unassigned/available
 * Accessible by: admin, employee, cashier
 */
exports.unassignOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    }

    const prevRiderId = order.assignedRiderId;

    order.assignedRiderId = null;
    order.assignedAt = null;
    order.shippedAt = null;
    order.deliveryOtp = null;
    order.status = "ReadyForPickup";
    await order.save();

    if (prevRiderId) {
      const rider = await User.findById(prevRiderId);
      if (rider && rider.role === "rider") {
        rider.currentOrderId = null;
        rider.driverStatus = "available";
        rider.returnedAt = new Date();
        await rider.save();

        const io = req.app.get("io");
        if (io) {
          io.emit("driverAvailable", {
            riderId: rider._id,
            rider: {
              _id: rider._id,
              name: rider.name || rider.username,
              phone: rider.phone,
              driverStatus: rider.driverStatus,
              returnedAt: rider.returnedAt,
            },
          });
          io.emit("driverStatusChanged", {
            riderId: rider._id,
            driverStatus: "available",
            currentOrderId: null,
          });
        }
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("products.productId", "name image basePrice")
      .populate("userId", "name username phone")
      .populate("shippingAddress");

    const io = req.app.get("io");
    if (io) {
      io.emit("updatedOrder", populatedOrder || order);
      io.emit("orderUpdated", populatedOrder || order);
    }

    return res.status(200).json({
      success: true,
      message: "تم إلغاء تعيين الطلب بنجاح وإعادته لطابور الإرسال",
      order: populatedOrder || order,
    });
  } catch (error) {
    console.error("Error in unassignOrder:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. GET /api/delivery/my-status
 * Driver fetches their own status and current assigned order details
 * Accessible by: rider, admin
 */
exports.getMyDriverStatus = async (req, res) => {
  try {
    const callerId = req.user._id || req.user.id;
    const caller = await User.findById(callerId);

    if (!caller || !["rider", "admin"].includes(caller.role)) {
      return res.status(403).json({ success: false, message: "غير مصرح لك" });
    }

    // Admin can inspect any rider via ?riderId=...
    const targetRiderId =
      caller.role === "admin" && req.query.riderId ? req.query.riderId : callerId;

    const rider = await User.findById(targetRiderId)
      .select("_id name username phone role driverStatus currentOrderId returnedAt")
      .populate({
        path: "currentOrderId",
        populate: [
          { path: "products.productId" },
          { path: "userId", select: "name username phone" },
          { path: "shippingAddress" },
        ],
      });

    if (!rider) {
      return res.status(404).json({ success: false, message: "السائق غير موجود" });
    }

    let currentOrder = rider.currentOrderId;

    // Self-healing: if rider has no currentOrderId or it wasn't populated, find active order for this driver
    if (!currentOrder || !currentOrder._id) {
      currentOrder = await Order.findOne({
        assignedRiderId: rider._id,
        status: { $in: ["ReadyForPickup", "Shipped"] },
      })
        .populate("products.productId")
        .populate("userId", "name username phone")
        .populate("shippingAddress");

      if (currentOrder) {
        rider.currentOrderId = currentOrder._id;
        if (rider.driverStatus === "available" || rider.driverStatus === "returning") {
          rider.driverStatus =
            currentOrder.status === "Shipped" ? "on_delivery" : "assigned";
          await rider.save();
        }
      } else {
        // No active ongoing order found
        // If rider was on_delivery, transition to returning
        if (rider.driverStatus === "on_delivery") {
          rider.driverStatus = "returning";
          rider.currentOrderId = null;
          await rider.save();
        }
      }
    } else if (["Delivered", "Submitted", "Canceled", "Cancelled"].includes(currentOrder.status)) {
      // Clean up finished order
      const wasDelivered = ["Delivered", "Submitted"].includes(currentOrder.status);
      rider.currentOrderId = null;
      // If order was delivered/submitted, driver transitions to/stays "returning" until QR check-in!
      rider.driverStatus = wasDelivered ? "returning" : "available";
      await rider.save();
      currentOrder = null;
    }

    return res.status(200).json({
      success: true,
      rider,
      currentOrder: currentOrder || null,
    });
  } catch (error) {
    console.error("Error in getMyDriverStatus:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. GET /api/delivery/driver-stats
 * Returns driver performance KPIs and delivered order history with medians
 * Accessible by: admin, employee, cashier
 */
exports.getDriverAnalytics = async (req, res) => {
  try {
    const { period, driverId } = req.query;

    // 1. Fetch drivers (role: "rider")
    const driversQuery = { role: "rider" };
    if (driverId) {
      driversQuery._id = driverId;
    }
    const drivers = await User.find(driversQuery)
      .select("_id name username phone driverStatus returnedAt createdAt")
      .lean();

    const driverIds = drivers.map((d) => d._id);

    // 2. Build date filter for orders (excluding external ishbek orders)
    const orderFilter = {
      assignedRiderId: { $in: driverIds },
      status: { $in: ["Delivered", "Submitted", "delivered", "submitted"] },
      source: { $ne: "ishbek" },
    };

    if (period && period !== "all") {
      const now = new Date();
      let startDate;
      if (period === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      if (startDate) {
        orderFilter.createdAt = { $gte: startDate };
      }
    }

    // 3. Fetch delivered orders for these drivers
    const orders = await Order.find(orderFilter)
      .populate("userId", "name username phone apartment")
      .populate("shippingAddress")
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    // Helper: calculate average of an array of numbers
    const calcAverage = (arr) => {
      if (!arr || arr.length === 0) return 0;
      const sum = arr.reduce((acc, val) => acc + val, 0);
      return Math.round((sum / arr.length) * 10) / 10;
    };

    // 4. Group orders and calculate durations per driver
    const driverStatsMap = {};

    drivers.forEach((d) => {
      driverStatsMap[String(d._id)] = {
        driver: {
          _id: d._id,
          name: d.name || d.username,
          username: d.username,
          phone: d.phone,
          driverStatus: d.driverStatus,
          returnedAt: d.returnedAt,
        },
        totalOrders: 0,
        pickupDurations: [],
        deliveryDurations: [],
        returnDurations: [],
        orders: [],
      };
    });

    orders.forEach((ord) => {
      const rId = String(ord.assignedRiderId);
      if (!driverStatsMap[rId]) return;

      const stats = driverStatsMap[rId];
      stats.totalOrders += 1;

      // Pickup Duration: from assignedAt / ready / createdAt to shippedAt
      const startPickupTime = ord.assignedAt || ord.readyForPickupAt || ord.createdAt;
      let pickupMinutes = null;
      if (ord.shippedAt && startPickupTime) {
        const diffMs = new Date(ord.shippedAt) - new Date(startPickupTime);
        if (diffMs > 0) {
          pickupMinutes = Math.round((diffMs / 60000) * 10) / 10;
          stats.pickupDurations.push(pickupMinutes);
        }
      }

      // Delivery Duration: from shippedAt to submittedAt
      let deliveryMinutes = null;
      if (ord.submittedAt && ord.shippedAt) {
        const diffMs = new Date(ord.submittedAt) - new Date(ord.shippedAt);
        if (diffMs > 0) {
          deliveryMinutes = Math.round((diffMs / 60000) * 10) / 10;
          stats.deliveryDurations.push(deliveryMinutes);
        }
      }

      // Return to branch duration: from submittedAt to returnedAt
      let returnMinutes = null;
      const returnTime =
        ord.returnedAt ||
        (stats.driver.returnedAt && stats.driver.returnedAt > ord.submittedAt
          ? stats.driver.returnedAt
          : null);
      if (returnTime && ord.submittedAt) {
        const diffMs = new Date(returnTime) - new Date(ord.submittedAt);
        if (diffMs > 0) {
          returnMinutes = Math.round((diffMs / 60000) * 10) / 10;
          stats.returnDurations.push(returnMinutes);
        }
      }

      stats.orders.push({
        _id: ord._id,
        sequenceNumber: ord.sequenceNumber || String(ord._id).slice(-6),
        totalPrice: ord.totalPrice,
        createdAt: ord.createdAt,
        assignedAt: ord.assignedAt,
        shippedAt: ord.shippedAt,
        submittedAt: ord.submittedAt,
        returnedAt: ord.returnedAt || returnTime,
        pickupMinutes,
        deliveryMinutes,
        returnMinutes,
        customerName: ord.userDetails?.name || ord.userId?.name || "زبون",
        customerPhone: ord.userDetails?.phone || ord.userId?.phone || "-",
        address: (() => {
          const areaName =
            ord.shippingAddress?.name ||
            ord.shippingAddress?.area ||
            "";
          const detailInfo =
            ord.userDetails?.apartment ||
            ord.shippingAddress?.details ||
            ord.userId?.apartment ||
            "";

          if (areaName && detailInfo) {
            return `${areaName} - ${detailInfo}`;
          }
          if (areaName) return areaName;
          if (detailInfo) return detailInfo;
          if (typeof ord.shippingAddress === "string" && ord.shippingAddress.trim()) {
            return ord.shippingAddress;
          }
          if (ord.orderType === "pickup") {
            return "استلام من الفرع";
          }
          return "لا توجد تفاصيل للعنوان";
        })(),
        itemCount: ord.products?.length || 0,
      });
    });

    // 5. Finalize summaries with averages
    const result = Object.values(driverStatsMap).map((item) => {
      const avgPickup = calcAverage(item.pickupDurations);
      const avgDelivery = calcAverage(item.deliveryDurations);
      const avgReturn = calcAverage(item.returnDurations);

      return {
        ...item,
        averagePickupMinutes: avgPickup,
        averageDeliveryMinutes: avgDelivery,
        averageReturnMinutes: avgReturn,
        // Kept for backward compatibility
        medianPickupMinutes: avgPickup,
        medianDeliveryMinutes: avgDelivery,
        medianReturnMinutes: avgReturn,
      };
    });

    // Overall fleet averages
    const allDeliveryMins = result.flatMap((r) => r.deliveryDurations);
    const allPickupMins = result.flatMap((r) => r.pickupDurations);
    const allReturnMins = result.flatMap((r) => r.returnDurations);
    const totalFleetOrders = result.reduce((acc, r) => acc + r.totalOrders, 0);

    const fleetAvgDelivery = calcAverage(allDeliveryMins);
    const fleetAvgPickup = calcAverage(allPickupMins);
    const fleetAvgReturn = calcAverage(allReturnMins);

    return res.status(200).json({
      success: true,
      drivers: result,
      fleetSummary: {
        totalDrivers: drivers.length,
        totalDeliveredOrders: totalFleetOrders,
        fleetAverageDeliveryMinutes: fleetAvgDelivery,
        fleetAveragePickupMinutes: fleetAvgPickup,
        fleetAverageReturnMinutes: fleetAvgReturn,
        // Kept for backward compatibility
        fleetMedianDeliveryMinutes: fleetAvgDelivery,
        fleetMedianPickupMinutes: fleetAvgPickup,
        fleetMedianReturnMinutes: fleetAvgReturn,
      },
    });
  } catch (error) {
    console.error("Error in getDriverAnalytics:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

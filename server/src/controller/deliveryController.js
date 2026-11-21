const Order = require("../models/orders");
const User = require("../models/user");
const DeliverySetting = require("../models/deliverySetting");
const DriverPayout = require("../models/driverPayout");
const Location = require("../models/locations");
require("../models/products");
const { BRANCH_QR_CODE } = require("../constants");
const { sendToUser } = require("../utils/pushService");

// Helper: fetch configured delivery settings (maxOrdersPerRider & driverSharePercentage)
const getGlobalDeliverySettings = async () => {
  try {
    let setting = await DeliverySetting.findOne({ key: "global" });
    if (!setting) {
      setting = await DeliverySetting.create({
        key: "global",
        maxOrdersPerRider: 3,
        driverSharePercentage: 75,
      });
    }
    const maxOrdersPerRider = Math.min(Math.max(setting.maxOrdersPerRider || 3, 1), 5);
    const driverSharePercentage =
      typeof setting.driverSharePercentage === "number" && !isNaN(setting.driverSharePercentage)
        ? Math.min(Math.max(setting.driverSharePercentage, 0), 100)
        : 75;
    return {
      maxOrdersPerRider,
      driverSharePercentage,
      restaurantSharePercentage: Number((100 - driverSharePercentage).toFixed(2)),
    };
  } catch (err) {
    console.error("Error fetching delivery settings:", err);
    return {
      maxOrdersPerRider: 3,
      driverSharePercentage: 75,
      restaurantSharePercentage: 25,
    };
  }
};

// Helper: fetch configured maxOrdersPerRider (capped at 5, min 1)
const getMaxOrdersPerRider = async () => {
  const { maxOrdersPerRider } = await getGlobalDeliverySettings();
  return maxOrdersPerRider;
};

// Helper: stamp immutable financial snapshot on order completion
const stampOrderFinancialSnapshot = async (order) => {
  try {
    if (!order) return;
    // 1. Resolve fee
    let fee = 0;
    if (order.shippingAddress) {
      if (typeof order.shippingAddress === "object" && order.shippingAddress.deliveryCost !== undefined) {
        fee = Number(order.shippingAddress.deliveryCost) || 0;
      } else {
        const loc = await Location.findById(order.shippingAddress).lean();
        if (loc && loc.deliveryCost !== undefined) {
          fee = Number(loc.deliveryCost) || 0;
        }
      }
    }
    if (!fee && order.deliveryFee !== undefined) {
      fee = Number(order.deliveryFee) || 0;
    }

    // 2. Read global driverSharePercentage
    const { driverSharePercentage } = await getGlobalDeliverySettings();

    // 3. Zero-drift 2-decimal rounding
    const driverShareAmount = Number(((fee * driverSharePercentage) / 100).toFixed(2));
    const ownerShareAmount = Number((fee - driverShareAmount).toFixed(2));

    // 4. Stamp onto order document
    order.deliveryFeeSnapshot = fee;
    order.driverSharePercentageSnapshot = driverSharePercentage;
    order.driverShareAmount = driverShareAmount;
    order.ownerShareAmount = ownerShareAmount;
    if (!order.payoutStatus) {
      order.payoutStatus = "UNPAID";
    }
    if (order.payoutId === undefined) {
      order.payoutId = null;
    }
  } catch (err) {
    console.error("Error stamping order financial snapshot:", err);
  }
};
exports.stampOrderFinancialSnapshot = stampOrderFinancialSnapshot;

// 4:00 AM Operational Business Day Cutoff
// Shifts timestamp back by 4 hours to map [YYYY-MM-DD 04:00:00 -> (next day) 03:59:59.999] into YYYY-MM-DD
const getBusinessDateKey = (date) => {
  if (!date) return "unknown";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "unknown";
  const shifted = new Date(d.getTime() - 4 * 60 * 60 * 1000);
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, "0");
  const day = String(shifted.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getBusinessDayRange = (period = "all", customFrom = null, customTo = null) => {
  if (!period || period === "all") {
    return { start: null, end: null };
  }

  const now = new Date();
  const todayShifted = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const todayBusinessStart = new Date(
    todayShifted.getFullYear(),
    todayShifted.getMonth(),
    todayShifted.getDate(),
    4,
    0,
    0,
    0
  );
  const todayBusinessEnd = new Date(todayBusinessStart.getTime() + 24 * 60 * 60 * 1000 - 1);

  if (period === "today") {
    return { start: todayBusinessStart, end: todayBusinessEnd };
  }

  if (period === "yesterday") {
    const start = new Date(todayBusinessStart.getTime() - 24 * 60 * 60 * 1000);
    const end = new Date(todayBusinessStart.getTime() - 1);
    return { start, end };
  }

  if (period === "week") {
    const start = new Date(todayBusinessStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    return { start, end: todayBusinessEnd };
  }

  if (period === "month") {
    const start = new Date(todayBusinessStart.getTime() - 29 * 24 * 60 * 60 * 1000);
    return { start, end: todayBusinessEnd };
  }

  if (period === "custom" && customFrom) {
    const [fYear, fMonth, fDay] = customFrom.split("-").map(Number);
    const start = new Date(fYear, fMonth - 1, fDay, 4, 0, 0, 0);
    let end;
    if (customTo) {
      const [tYear, tMonth, tDay] = customTo.split("-").map(Number);
      end = new Date(new Date(tYear, tMonth - 1, tDay, 4, 0, 0, 0).getTime() + 24 * 60 * 60 * 1000 - 1);
    } else {
      end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    }
    return { start, end };
  }

  return { start: null, end: null };
};

/**
 * 0. GET /api/delivery/settings
 * Fetches delivery configurations (maxOrdersPerRider, driverSharePercentage, restaurantSharePercentage)
 * Accessible by: admin, employee, cashier, rider
 */
exports.getDeliverySettings = async (req, res) => {
  try {
    const settings = await getGlobalDeliverySettings();
    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error in getDeliverySettings:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 0.1 PUT /api/delivery/settings
 * Updates delivery configurations (ADMIN ONLY)
 * Body: { maxOrdersPerRider, driverSharePercentage }
 * Accessible by: admin only
 */
exports.updateDeliverySettings = async (req, res) => {
  try {
    const callerId = req.user._id || req.user.id;
    const caller = await User.findById(callerId);

    if (!caller || caller.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتعديل إعدادات التوصيل (مسموح للمدراء فقط)",
      });
    }

    let setting = await DeliverySetting.findOne({ key: "global" });
    if (!setting) {
      setting = new DeliverySetting({
        key: "global",
        maxOrdersPerRider: 3,
        driverSharePercentage: 75,
      });
    }

    // Optional update maxOrdersPerRider
    if (req.body.maxOrdersPerRider !== undefined) {
      const parsedMax = parseInt(req.body.maxOrdersPerRider, 10);
      if (isNaN(parsedMax) || parsedMax < 1 || parsedMax > 5) {
        return res.status(400).json({
          success: false,
          message:
            "الحد الأقصى لعدد الطلبات لكل سائق يجب أن يكون رقماً صحيحاً بين 1 و 5 فقط",
        });
      }
      setting.maxOrdersPerRider = parsedMax;
    }

    // Optional update driverSharePercentage
    if (req.body.driverSharePercentage !== undefined) {
      const parsedPct = parseFloat(req.body.driverSharePercentage);
      if (isNaN(parsedPct) || parsedPct < 0 || parsedPct > 100) {
        return res.status(400).json({
          success: false,
          message: "نسبة عمولة السائق يجب أن تكون رقماً بين 0 و 100",
        });
      }
      setting.driverSharePercentage = Number(parsedPct.toFixed(2));
    }

    await setting.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("deliverySettingsUpdated", {
        maxOrdersPerRider: setting.maxOrdersPerRider,
        driverSharePercentage: setting.driverSharePercentage,
        restaurantSharePercentage: Number((100 - setting.driverSharePercentage).toFixed(2)),
      });
    }

    return res.status(200).json({
      success: true,
      message: "تم تحديث إعدادات التوصيل بنجاح",
      settings: {
        maxOrdersPerRider: setting.maxOrdersPerRider,
        driverSharePercentage: setting.driverSharePercentage,
        restaurantSharePercentage: Number((100 - setting.driverSharePercentage).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error in updateDeliverySettings:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 1. GET /api/delivery/queue
 * Returns ReadyForPickup delivery orders + available drivers in FIFO order (by returnedAt)
 * Accessible by: admin, employee, cashier
 */
exports.getDeliveryQueue = async (req, res) => {
  try {
    const maxOrdersPerRider = await getMaxOrdersPerRider();

    // 1. Fetch active queue orders (Confirmed, ReadyForPickup) sorted FIFO (createdAt: 1)
    const activeOrders = await Order.find({
      status: { $in: ["Confirmed", "ReadyForPickup"] },
    })
      .populate(
        "products.productId",
        "name image basePrice category additions prices discount",
      )
      .populate("userId", "name username phone")
      .populate("shippingAddress")
      .populate("assignedRiderId", "_id name username phone driverStatus")
      .sort({ createdAt: 1 })
      .lean();

    // 1.1 Fetch other lifecycle orders (Shipped, OutForDelivery, Delivered, Submitted)
    const otherOrders = await Order.find({
      status: { $in: ["Shipped", "OutForDelivery", "Delivered", "Submitted"] },
    })
      .populate(
        "products.productId",
        "name image basePrice category additions prices discount",
      )
      .populate("userId", "name username phone")
      .populate("shippingAddress")
      .populate("assignedRiderId", "_id name username phone driverStatus")
      .sort({ submittedAt: -1, updatedAt: -1, createdAt: -1 })
      .limit(200)
      .lean();

    const allQueueOrders = [...activeOrders, ...otherOrders];

    // 2. Fetch active assigned orders per rider with full zone details
    const activeAssignedOrders = await Order.find({
      assignedRiderId: { $ne: null },
      status: { $in: ["Processing", "Confirmed", "ReadyForPickup", "Shipped"] },
    })
      .populate("shippingAddress", "name area details")
      .lean();

    const activeMap = {};
    activeAssignedOrders.forEach((ord) => {
      const rId = String(ord.assignedRiderId);
      if (!activeMap[rId]) {
        activeMap[rId] = { count: 0, orders: [] };
      }
      const zoneName =
        ord.shippingAddress?.name ||
        ord.shippingAddress?.area ||
        ord.shippingAddress?.details?.split("-")[0]?.trim() ||
        "المنطقة";

      activeMap[rId].count += 1;
      activeMap[rId].orders.push({
        _id: ord._id,
        sequenceNumber: ord.sequenceNumber,
        status: ord.status,
        totalPrice: ord.totalPrice,
        zone: zoneName,
        assignedAt: ord.assignedAt,
        shippedAt: ord.shippedAt,
        createdAt: ord.createdAt,
      });
    });

    // 3. Fetch all riders for staff monitoring
    const rawRiders = await User.find({ role: "rider" })
      .select("_id name username phone driverStatus currentOrderId returnedAt")
      .sort({ returnedAt: 1 })
      .lean();

    // Find latest delivered timestamp for returning drivers
    const returningRiderIds = rawRiders
      .filter((d) => d.driverStatus === "returning")
      .map((d) => d._id);

    const lastDeliveredOrders = await Order.find({
      assignedRiderId: { $in: returningRiderIds },
      status: { $in: ["Delivered", "Submitted"] },
    })
      .sort({ submittedAt: -1 })
      .select("assignedRiderId submittedAt")
      .lean();

    const returningMap = {};
    lastDeliveredOrders.forEach((o) => {
      const rId = String(o.assignedRiderId);
      if (!returningMap[rId]) {
        returningMap[rId] = o.submittedAt;
      }
    });

    const allDrivers = rawRiders.map((d) => {
      const activeData = activeMap[String(d._id)] || { count: 0, orders: [] };
      // Strict order batching: Drivers who are on_delivery, returning, or unavailable are locked out of new assignments
      const canAcceptMore =
        (d.driverStatus === "available" || d.driverStatus === "assigned") &&
        activeData.count < maxOrdersPerRider;

      return {
        ...d,
        activeOrdersCount: activeData.count,
        activeOrders: activeData.orders,
        maxOrdersPerRider,
        canAcceptMoreOrders: canAcceptMore,
        returningSince: returningMap[String(d._id)] || null,
        shippedAt:
          activeData.orders.find((o) => o.status === "Shipped")?.shippedAt ||
          null,
      };
    });

    // 4. Available drivers in FIFO order:
    // Drivers who are at branch (not unavailable, not returning) and currently under max capacity
    const availableDrivers = allDrivers
      .filter((d) => d.canAcceptMoreOrders)
      .sort((a, b) => {
        // Drivers with 0 orders first, then by returnedAt
        if (a.activeOrdersCount !== b.activeOrdersCount) {
          return a.activeOrdersCount - b.activeOrdersCount;
        }
        return new Date(a.returnedAt || 0) - new Date(b.returnedAt || 0);
      });

    return res.status(200).json({
      success: true,
      orders: allQueueOrders,
      completedOrders: otherOrders,
      availableDrivers,
      allDrivers,
      settings: {
        maxOrdersPerRider,
      },
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
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    if (order.source === "ishbek") {
      return res.status(400).json({
        success: false,
        message:
          "طلبات إشبك (طلبات خارجية مثل طلبات) لا يتم تعيينها لسائقي الفرع",
      });
    }

    if (order.orderType !== "delivery") {
      return res.status(400).json({
        success: false,
        message: "هذا الطلب ليس طلب توصيل",
      });
    }

    const allowedStatuses = ["Processing", "Confirmed", "ReadyForPickup"];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن تعيين السائق لهذا الطلب (الحالة الحالية: ${order.status})`,
      });
    }

    // Find driver
    const rider = await User.findById(riderId);
    if (!rider || !["rider", "admin"].includes(rider.role)) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    if (rider.driverStatus === "unavailable") {
      return res.status(400).json({
        success: false,
        message:
          "السائق غير متاح حالياً (مسجل خروج، يجب مسح باركود الفرع أولاً)",
      });
    }

    if (rider.driverStatus === "returning") {
      return res.status(400).json({
        success: false,
        message: "السائق في طريق العودة للفرع ولم يسجل وصوله بعد",
      });
    }

    // Strict batching: Once on the road (on_delivery), locked out of mid-route assignments
    if (rider.driverStatus === "on_delivery") {
      return res.status(400).json({
        success: false,
        message:
          "السائق في طريق التوصيل حالياً. لا يمكن تعيين طلبات إضافية أثناء الرحلة (يجب حسم جميع الطلبات قبل الخروج من الفرع).",
      });
    }

    const maxOrdersPerRider = await getMaxOrdersPerRider();
    const currentActiveCount = await Order.countDocuments({
      assignedRiderId: rider._id,
      status: { $in: ["ReadyForPickup", "Shipped"] },
    });

    if (currentActiveCount >= maxOrdersPerRider) {
      return res.status(400).json({
        success: false,
        message: `لقد وصل هذا السائق إلى الحد الأقصى المسموح به (${maxOrdersPerRider} طلبات). لا يمكن تعيين طلب إضافي له حالياً.`,
      });
    }

    // Update driver state to assigned
    rider.driverStatus = "assigned";
    rider.currentOrderId = order._id;
    await rider.save();

    // Update order state: status becomes ReadyForPickup ("بانتظار السائق" / waiting for driver)
    order.status = "ReadyForPickup";
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
      `تم تعيين الطلب #${order.sequenceNumber} لك (${currentActiveCount + 1}/${maxOrdersPerRider} طلبات)، يرجى استلامه من المطعم`,
      { orderId: String(order._id) },
    );

    // Socket emission
    const io = req.app.get("io");
    if (io) {
      io.emit("driverAssigned", {
        orderId: order._id,
        riderId: rider._id,
        order: populatedOrder,
        activeOrdersCount: currentActiveCount + 1,
        maxOrdersPerRider,
        rider: {
          _id: rider._id,
          name: rider.name || rider.username,
          phone: rider.phone,
          driverStatus: rider.driverStatus,
          currentOrderId: rider.currentOrderId,
          activeOrdersCount: currentActiveCount + 1,
        },
      });
      io.emit("updatedOrder", populatedOrder);
      io.emit("orderUpdated", populatedOrder);
      io.emit("driverStatusChanged", {
        riderId: rider._id,
        driverStatus: rider.driverStatus,
        currentOrderId: order._id,
        activeOrdersCount: currentActiveCount + 1,
      });
    }

    return res.status(200).json({
      success: true,
      message: `تم تعيين السائق للطلب بنجاح (الحمولة الحالية: ${currentActiveCount + 1}/${maxOrdersPerRider})`,
      order: populatedOrder,
      activeOrdersCount: currentActiveCount + 1,
      maxOrdersPerRider,
      rider: {
        _id: rider._id,
        name: rider.name || rider.username,
        driverStatus: rider.driverStatus,
        currentOrderId: rider.currentOrderId,
        activeOrdersCount: currentActiveCount + 1,
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
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    // Support bulk confirm pickup (confirm all ready orders for rider)
    const confirmAll = Boolean(req.body.all);
    let targetOrders = [];

    if (confirmAll) {
      targetOrders = await Order.find({
        assignedRiderId: rider._id,
        status: "ReadyForPickup",
      });
    } else {
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

      const singleOrder = await Order.findById(orderId);
      if (!singleOrder) {
        return res
          .status(404)
          .json({ success: false, message: "الطلب غير موجود" });
      }
      targetOrders = [singleOrder];
    }

    if (targetOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لا توجد طلبات جاهزة للاستلام قيد الانتظار",
      });
    }

    const io = req.app.get("io");
    const updatedOrders = [];

    for (const ord of targetOrders) {
      const deliveryOtp = Math.floor(100 + Math.random() * 900).toString();
      ord.status = "Shipped";
      ord.shippedAt = new Date();
      ord.deliveryOtp = deliveryOtp;
      ord.assignedRiderId = rider._id;
      await ord.save();

      const populated = await Order.findById(ord._id)
        .populate("products.productId")
        .populate("userId")
        .populate("shippingAddress")
        .populate("assignedRiderId", "_id name username phone driverStatus");

      updatedOrders.push(populated);

      // Push notification to customer
      sendToUser(
        populated,
        "طلبك في الطريق إليك 🚗",
        `طلب #${ord.sequenceNumber} بالطريق إلك! رمز التسليم عند الاستلام: ${deliveryOtp}`,
        { orderId: String(ord._id), deliveryOtp, status: "Shipped" },
      );

      if (io) {
        io.emit("updatedOrder", populated);
        io.emit("orderUpdated", populated);
      }
    }

    // Update rider state
    rider.driverStatus = "on_delivery";
    rider.currentOrderId = targetOrders[0]._id;
    await rider.save();

    if (io) {
      io.emit("driverStatusChanged", {
        riderId: rider._id,
        driverStatus: "on_delivery",
        currentOrderId: rider.currentOrderId,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        targetOrders.length > 1
          ? `تم تأكيد استلام ${targetOrders.length} طلبات وبدء رحلة التوصيل 🚗`
          : "تم تأكيد استلام الطلب وبدء رحلة التوصيل 🚗",
      order: updatedOrders[0],
      orders: updatedOrders,
      confirmedCount: targetOrders.length,
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

    const { orderId, otp, forceSubmit, overrideReason } = req.body;

    if (!otp && !forceSubmit) {
      return res.status(400).json({
        success: false,
        message: "رمز التحقق (OTP) مطلوب، أو تفعيل خيار التسليم الاضطراري",
      });
    }

    const targetRiderId =
      caller.role === "admin" && req.body.riderId ? req.body.riderId : callerId;
    const rider = await User.findById(targetRiderId);
    if (!rider) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
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
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    // Verify OTP match if not force submitted
    if (!forceSubmit) {
      if (
        !order.deliveryOtp ||
        String(order.deliveryOtp).trim() !== String(otp).trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "رمز التحقق غير صحيح، يرجى التأكد من الرمز وإعادة المحاولة",
        });
      }
    } else {
      order.deliveredViaOverride = true;
      order.overrideReason = overrideReason || "customer_unreachable";
    }

    // Mark order as Delivered (terminal status in the system) and record submittedAt timestamp
    order.status = "Delivered";
    order.submittedAt = new Date();
    order.deliveryOtp = null;
    await stampOrderFinancialSnapshot(order);
    await order.save();

    // Check remaining active orders for this rider
    const remainingActiveOrders = await Order.find({
      assignedRiderId: rider._id,
      status: { $in: ["ReadyForPickup", "Shipped"] },
      _id: { $ne: order._id },
    }).sort({ createdAt: 1 });

    const allDelivered = remainingActiveOrders.length === 0;

    if (allDelivered) {
      rider.driverStatus = "returning";
      rider.currentOrderId = null;
    } else {
      const hasShipped = remainingActiveOrders.some(
        (o) => o.status === "Shipped",
      );
      rider.driverStatus = hasShipped ? "on_delivery" : "assigned";
      rider.currentOrderId = remainingActiveOrders[0]._id;
    }
    await rider.save();

    // If order has an assigned rider different from caller/target rider, update them too
    if (
      order.assignedRiderId &&
      String(order.assignedRiderId) !== String(rider._id)
    ) {
      const assignedRider = await User.findById(order.assignedRiderId);
      if (assignedRider && assignedRider.role === "rider") {
        const otherRemaining = await Order.find({
          assignedRiderId: assignedRider._id,
          status: { $in: ["ReadyForPickup", "Shipped"] },
          _id: { $ne: order._id },
        });
        if (otherRemaining.length === 0) {
          assignedRider.driverStatus = "returning";
          assignedRider.currentOrderId = null;
        } else {
          assignedRider.currentOrderId = otherRemaining[0]._id;
        }
        await assignedRider.save();
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress")
      .populate("assignedRiderId", "_id name username phone driverStatus");

    // Push notification to customer
    sendToUser(
      populatedOrder,
      "تم تسليم طلبك، بالهنا والشفا 🍽️",
      `تم تسليم طلبك #${order.sequenceNumber} بنجاح. شكراً لطلبك من شاورما شيش!`,
      { orderId: String(order._id), status: "Delivered" },
    );

    // Socket emission
    const io = req.app.get("io");
    if (io) {
      io.emit("updatedOrder", populatedOrder);
      io.emit("orderUpdated", populatedOrder);
      io.emit("driverStatusChanged", {
        riderId: rider._id,
        driverStatus: rider.driverStatus,
        currentOrderId: rider.currentOrderId,
        remainingOrdersCount: remainingActiveOrders.length,
      });
      if (
        order.assignedRiderId &&
        String(order.assignedRiderId) !== String(rider._id)
      ) {
        io.emit("driverStatusChanged", {
          riderId: order.assignedRiderId,
          driverStatus: rider.driverStatus,
          currentOrderId: rider.currentOrderId,
          remainingOrdersCount: remainingActiveOrders.length,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: allDelivered
        ? "تم تسليم جميع الطلبات بنجاح! أنت الآن في طريق العودة إلى الفرع 🛵"
        : `تم تسليم الطلب #${order.sequenceNumber} بنجاح! متبقي لديك ${remainingActiveOrders.length} طلبات للتسليم`,
      order: populatedOrder,
      allDelivered,
      remainingOrdersCount: remainingActiveOrders.length,
      rider: {
        _id: rider._id,
        name: rider.name || rider.username,
        driverStatus: rider.driverStatus,
        currentOrderId: rider.currentOrderId,
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
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
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
        {
          assignedRiderId: rider._id,
          status: { $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"] },
        },
        ...(prevOrderId
          ? [
              {
                _id: prevOrderId,
                status: {
                  $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"],
                },
              },
            ]
          : []),
      ],
    };

    const activeOrders = await Order.find(orderQuery);
    const io = req.app.get("io");

    for (const ord of activeOrders) {
      ord.assignedRiderId = null;
      ord.assignedAt = null;
      ord.shippedAt = null;
      ord.deliveryOtp = null;
      ord.status = "Confirmed";
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
      { sort: { submittedAt: -1 } },
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
 * 5.1 POST /api/delivery/rider-logout
 * Driver logs out -> status becomes 'unavailable' and any active assigned order is reverted to queue
 * Accessible by: rider, admin
 */
exports.riderLogout = async (req, res) => {
  try {
    const callerId = req.user._id || req.user.id;
    const caller = await User.findById(callerId);

    if (!caller || !["rider", "admin"].includes(caller.role)) {
      return res.status(403).json({ success: false, message: "غير مصرح لك" });
    }

    const targetRiderId =
      caller.role === "admin" && req.body.riderId ? req.body.riderId : callerId;
    const rider = await User.findById(targetRiderId);
    if (!rider) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    const prevOrderId = rider.currentOrderId;

    // Set status to unavailable and clear current order
    rider.driverStatus = "unavailable";
    rider.currentOrderId = null;
    await rider.save();

    // Revert any active assigned order(s) for this driver back to ReadyForPickup
    const orderQuery = {
      $or: [
        {
          assignedRiderId: rider._id,
          status: { $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"] },
        },
        ...(prevOrderId
          ? [
              {
                _id: prevOrderId,
                status: {
                  $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"],
                },
              },
            ]
          : []),
      ],
    };

    const activeOrders = await Order.find(orderQuery);
    const io = req.app.get("io");

    for (const ord of activeOrders) {
      ord.assignedRiderId = null;
      ord.assignedAt = null;
      ord.shippedAt = null;
      ord.deliveryOtp = null;
      ord.status = "Confirmed";
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

    // Socket emission: notify staff dispatch queue that driver is now unavailable
    if (io) {
      io.emit("driverStatusChanged", {
        riderId: rider._id,
        driverStatus: "unavailable",
        currentOrderId: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "تم تسجيل خروج السائق وأصبحت الحالة غير متاح 🔴",
      revertedOrdersCount: activeOrders.length,
      rider: {
        _id: rider._id,
        name: rider.name || rider.username,
        driverStatus: "unavailable",
        currentOrderId: null,
      },
    });
  } catch (error) {
    console.error("Error in riderLogout:", error);
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
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    const prevOrderId = rider.currentOrderId;

    rider.driverStatus = "available";
    rider.returnedAt = new Date();
    rider.currentOrderId = null;
    await rider.save();

    // 1. Revert any active assigned order(s) for this driver back to the unassigned queue
    const orderQuery = {
      $or: [
        {
          assignedRiderId: rider._id,
          status: { $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"] },
        },
        ...(prevOrderId
          ? [
              {
                _id: prevOrderId,
                status: {
                  $nin: ["Delivered", "Submitted", "Canceled", "Cancelled"],
                },
              },
            ]
          : []),
      ],
    };

    const activeOrders = await Order.find(orderQuery);
    const io = req.app.get("io");

    for (const ord of activeOrders) {
      ord.assignedRiderId = null;
      ord.assignedAt = null;
      ord.shippedAt = null;
      ord.deliveryOtp = null;
      ord.status = "Confirmed";
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
      { sort: { submittedAt: -1 } },
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
      message:
        activeOrders.length > 0
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
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    const prevRiderId = order.assignedRiderId;

    order.assignedRiderId = null;
    order.assignedAt = null;
    order.shippedAt = null;
    order.deliveryOtp = null;
    order.status = "Confirmed";
    await order.save();

    if (prevRiderId) {
      const rider = await User.findById(prevRiderId);
      if (rider && rider.role === "rider") {
        const remainingActiveOrders = await Order.find({
          assignedRiderId: rider._id,
          status: { $in: ["ReadyForPickup", "Shipped"] },
          _id: { $ne: order._id },
        });

        if (remainingActiveOrders.length === 0) {
          rider.currentOrderId = null;
          rider.driverStatus = "available";
          rider.returnedAt = new Date();
        } else {
          rider.currentOrderId = remainingActiveOrders[0]._id;
          const hasShipped = remainingActiveOrders.some(
            (o) => o.status === "Shipped",
          );
          rider.driverStatus = hasShipped ? "on_delivery" : "assigned";
        }
        await rider.save();

        const io = req.app.get("io");
        if (io) {
          if (remainingActiveOrders.length === 0) {
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
          }
          io.emit("driverStatusChanged", {
            riderId: rider._id,
            driverStatus: rider.driverStatus,
            currentOrderId: rider.currentOrderId,
            activeOrdersCount: remainingActiveOrders.length,
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
 * 2.2 POST /api/delivery/complete-pickup/:orderId
 * Direct counter handover for branch pickup orders (no PIN / OTP required)
 * Accessible by: admin, employee, cashier
 */
exports.completePickupOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    order.status = "Delivered";
    order.submittedAt = new Date();
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress");

    const io = req.app.get("io");
    if (io) {
      io.emit("updatedOrder", populatedOrder);
      io.emit("orderUpdated", populatedOrder);
    }

    // Push notification to customer
    if (order.source !== "ishbek")
      sendToUser(
        populatedOrder,
        "تم استلام طلبك 🍽️",
        `تم استلام طلبك #${order.sequenceNumber} بنجاح من الفرع. بالهنا والشفا!`,
        { orderId: String(order._id), status: "Delivered" },
      );

    return res.status(200).json({
      success: true,
      message: "تم تسليم الطلب للعميل بنجاح ✅",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error in completePickupOrder:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. GET /api/delivery/my-status
 * Driver fetches their own status and current assigned order details (all active orders)
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
      caller.role === "admin" && req.query.riderId
        ? req.query.riderId
        : callerId;

    const rider = await User.findById(targetRiderId).select(
      "_id name username phone role driverStatus currentOrderId returnedAt",
    );

    if (!rider) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    // Fetch all active orders for this driver
    const activeOrders = await Order.find({
      assignedRiderId: rider._id,
      status: { $in: ["ReadyForPickup", "Shipped"] },
    })
      .populate("products.productId")
      .populate("userId", "name username phone")
      .populate("shippingAddress")
      .sort({ createdAt: 1 });

    if (activeOrders.length > 0) {
      rider.currentOrderId = activeOrders[0]._id;
      const hasShipped = activeOrders.some((o) => o.status === "Shipped");
      const targetStatus = hasShipped ? "on_delivery" : "assigned";
      rider.driverStatus = targetStatus;
      await rider.save();
    } else {
      // If no active orders found and driver was on_delivery or assigned, transition to returning
      if (
        rider.driverStatus === "on_delivery" ||
        rider.driverStatus === "assigned"
      ) {
        rider.driverStatus = "returning";
        rider.currentOrderId = null;
        await rider.save();
      }
    }

    const maxOrdersPerRider = await getMaxOrdersPerRider();

    // Calculate live FIFO queue position among available drivers
    const availableRiders = await User.find({
      role: "rider",
      driverStatus: "available",
    })
      .select("_id returnedAt")
      .sort({ returnedAt: 1 })
      .lean();

    const riderIdx = availableRiders.findIndex(
      (r) => String(r._id) === String(rider._id),
    );
    const queuePosition = riderIdx >= 0 ? riderIdx + 1 : null;
    const totalAvailableDrivers = availableRiders.length;

    return res.status(200).json({
      success: true,
      rider,
      queuePosition,
      totalAvailableDrivers,
      currentOrder: activeOrders[0] || null,
      activeOrders: activeOrders || [],
      totalActiveOrders: activeOrders.length,
      maxOrdersPerRider,
    });
  } catch (error) {
    console.error("Error in getMyDriverStatus:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. GET /api/delivery/driver-stats
 * Returns driver performance KPIs, delivered order history with averages,
 * and delivery fees owed to each driver (from locations.deliveryCost)
 * Accessible by: admin, employee, cashier
 */
exports.getDriverAnalytics = async (req, res) => {
  try {
    const { period = "all", driverId, from, to, settlementStatus } = req.query;

    // 1. Fetch drivers (role: "rider")
    const driversQuery = { role: "rider" };
    if (driverId) {
      driversQuery._id = driverId;
    }
    const drivers = await User.find(driversQuery)
      .select("_id name username phone driverStatus returnedAt createdAt")
      .lean();

    const driverIds = drivers.map((d) => d._id);

    // 2. Build 4:00 AM cutoff range
    const { start: startDate, end: endDate } = getBusinessDayRange(period, from, to);

    // Order filter for active period (excluding pickup orders and ishbek aggregator orders)
    const orderFilter = {
      assignedRiderId: { $in: driverIds },
      status: { $in: ["Delivered", "Submitted", "delivered", "submitted"] },
      orderType: { $ne: "pickup" },
      source: { $ne: "ishbek" },
    };

    if (startDate && endDate) {
      orderFilter.$or = [
        { submittedAt: { $gte: startDate, $lte: endDate } },
        { submittedAt: null, createdAt: { $gte: startDate, $lte: endDate } },
      ];
    } else if (startDate) {
      orderFilter.$or = [
        { submittedAt: { $gte: startDate } },
        { submittedAt: null, createdAt: { $gte: startDate } },
      ];
    }

    // 3. Fetch delivered orders for the active period
    const orders = await Order.find(orderFilter)
      .populate("userId", "name username phone apartment")
      .populate("shippingAddress")
      .populate("payoutId", "payoutCode paymentMethod paidAt status")
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    // 4. Fetch prior unpaid orders for these drivers (if startDate exists)
    // Orders whose completion falls BEFORE the active period start, and are still UNPAID
    let priorUnpaidOrders = [];
    if (startDate) {
      priorUnpaidOrders = await Order.find({
        assignedRiderId: { $in: driverIds },
        status: { $in: ["Delivered", "Submitted", "delivered", "submitted"] },
        orderType: { $ne: "pickup" },
        source: { $ne: "ishbek" },
        payoutStatus: { $ne: "PAID" },
        $or: [
          { submittedAt: { $lt: startDate } },
          { submittedAt: null, createdAt: { $lt: startDate } },
        ],
      })
        .populate("shippingAddress")
        .lean();
    }

    // 5. Fetch most recent COMPLETED payout per driver for lastPaidAt
    const recentPayouts = await DriverPayout.find({
      driverId: { $in: driverIds },
      status: "COMPLETED",
    })
      .sort({ paidAt: -1 })
      .lean();

    const driverLastPaidMap = {};
    recentPayouts.forEach((p) => {
      const dKey = String(p.driverId);
      if (!driverLastPaidMap[dKey]) {
        driverLastPaidMap[dKey] = p.paidAt;
      }
    });

    // Helper: calculate average of an array of numbers
    const calcAverage = (arr) => {
      if (!arr || arr.length === 0) return 0;
      const sum = arr.reduce((acc, val) => acc + val, 0);
      return Math.round((sum / arr.length) * 10) / 10;
    };

    // 6. Initialize stats map per driver
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
        totalDeliveryFees: 0,
        totalDriverShare: 0,
        totalRestaurantShare: 0,
        paidDriverShare: 0,
        unpaidDriverShare: 0,
        unpaidOrderCount: 0,
        priorUnpaidAmount: 0,
        priorUnpaidOrderCount: 0,
        lastPaidAt: driverLastPaidMap[String(d._id)] || null,
        dailyEarnings: {}, // { [dateKey]: { totalFee, driverShare, restaurantShare, orderCount, paidAmount, unpaidAmount } }
        pickupDurations: [],
        deliveryDurations: [],
        returnDurations: [],
        orders: [],
      };
    });

    // Aggregate prior unpaid balances onto drivers
    priorUnpaidOrders.forEach((pOrd) => {
      const rId = String(pOrd.assignedRiderId);
      if (!driverStatsMap[rId]) return;

      const fee =
        pOrd.deliveryFeeSnapshot !== null && pOrd.deliveryFeeSnapshot !== undefined
          ? Number(pOrd.deliveryFeeSnapshot)
          : Number(pOrd.shippingAddress?.deliveryCost) || Number(pOrd.deliveryFee) || 0;

      let dShare = 0;
      if (pOrd.driverShareAmount !== null && pOrd.driverShareAmount !== undefined) {
        dShare = Number(pOrd.driverShareAmount);
      } else {
        dShare = Number(((fee * 75) / 100).toFixed(2));
      }

      driverStatsMap[rId].priorUnpaidAmount =
        Number((driverStatsMap[rId].priorUnpaidAmount + dShare).toFixed(2));
      driverStatsMap[rId].priorUnpaidOrderCount += 1;
    });

    // Process orders in active period
    orders.forEach((ord) => {
      const rId = String(ord.assignedRiderId);
      if (!driverStatsMap[rId]) return;

      const stats = driverStatsMap[rId];
      stats.totalOrders += 1;

      const zoneName =
        ord.shippingAddress?.name ||
        ord.shippingAddress?.area ||
        "منطقة غير محددة";

      // Resolve delivery fee (snapshot first, fallback location.deliveryCost, then order.deliveryFee)
      const deliveryFee =
        ord.deliveryFeeSnapshot !== null && ord.deliveryFeeSnapshot !== undefined
          ? Number(ord.deliveryFeeSnapshot)
          : Number(ord.shippingAddress?.deliveryCost) || Number(ord.deliveryFee) || 0;

      // Resolve driver & restaurant share (snapshot first, fallback 75%/25%)
      let driverShare = 0;
      let restaurantShare = 0;
      let pctSnapshot = 75;

      if (
        ord.driverShareAmount !== null &&
        ord.driverShareAmount !== undefined &&
        ord.ownerShareAmount !== null &&
        ord.ownerShareAmount !== undefined
      ) {
        driverShare = Number(ord.driverShareAmount);
        restaurantShare = Number(ord.ownerShareAmount);
        pctSnapshot = ord.driverSharePercentageSnapshot || 75;
      } else {
        driverShare = Number(((deliveryFee * 75) / 100).toFixed(2));
        restaurantShare = Number((deliveryFee - driverShare).toFixed(2));
      }

      const payoutStatus = ord.payoutStatus === "PAID" ? "PAID" : "UNPAID";
      const isPaid = payoutStatus === "PAID";

      stats.totalDeliveryFees = Number((stats.totalDeliveryFees + deliveryFee).toFixed(2));
      stats.totalDriverShare = Number((stats.totalDriverShare + driverShare).toFixed(2));
      stats.totalRestaurantShare = Number((stats.totalRestaurantShare + restaurantShare).toFixed(2));

      if (isPaid) {
        stats.paidDriverShare = Number((stats.paidDriverShare + driverShare).toFixed(2));
      } else {
        stats.unpaidDriverShare = Number((stats.unpaidDriverShare + driverShare).toFixed(2));
        stats.unpaidOrderCount += 1;
      }

      // Group by 4:00 AM cutoff business day key
      const dayKey = getBusinessDateKey(ord.submittedAt || ord.createdAt);
      if (!stats.dailyEarnings[dayKey]) {
        stats.dailyEarnings[dayKey] = {
          totalFee: 0,
          driverShare: 0,
          restaurantShare: 0,
          orderCount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
        };
      }
      const dayStat = stats.dailyEarnings[dayKey];
      dayStat.totalFee = Number((dayStat.totalFee + deliveryFee).toFixed(2));
      dayStat.driverShare = Number((dayStat.driverShare + driverShare).toFixed(2));
      dayStat.restaurantShare = Number((dayStat.restaurantShare + restaurantShare).toFixed(2));
      dayStat.orderCount += 1;
      if (isPaid) {
        dayStat.paidAmount = Number((dayStat.paidAmount + driverShare).toFixed(2));
      } else {
        dayStat.unpaidAmount = Number((dayStat.unpaidAmount + driverShare).toFixed(2));
      }

      // Pickup Duration: from assignedAt / ready / createdAt to shippedAt
      const startPickupTime =
        ord.assignedAt || ord.readyForPickupAt || ord.createdAt;
      let pickupMinutes = null;
      if (ord.shippedAt && startPickupTime) {
        const diffMs = new Date(ord.shippedAt) - new Date(startPickupTime);
        if (diffMs > 0 && diffMs < 240 * 60000) {
          pickupMinutes = Math.round((diffMs / 60000) * 10) / 10;
          stats.pickupDurations.push(pickupMinutes);
        }
      }

      // Delivery Duration: from shippedAt to submittedAt
      let deliveryMinutes = null;
      if (ord.submittedAt && ord.shippedAt) {
        const diffMs = new Date(ord.submittedAt) - new Date(ord.shippedAt);
        if (diffMs > 0 && diffMs < 300 * 60000) {
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
        if (diffMs > 0 && diffMs < 300 * 60000) {
          returnMinutes = Math.round((diffMs / 60000) * 10) / 10;
          stats.returnDurations.push(returnMinutes);
        }
      }

      stats.orders.push({
        _id: ord._id,
        sequenceNumber: ord.sequenceNumber || String(ord._id).slice(-6),
        totalPrice: ord.totalPrice,
        zone: zoneName,
        deliveryFee,
        driverShare,
        restaurantShare,
        driverShareAmount: driverShare,
        ownerShareAmount: restaurantShare,
        driverSharePercentageSnapshot: pctSnapshot,
        payoutStatus,
        payoutCode: ord.payoutId?.payoutCode || null,
        payoutId: ord.payoutId?._id || ord.payoutId || null,
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
            ord.shippingAddress?.name || ord.shippingAddress?.area || "";
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
          if (
            typeof ord.shippingAddress === "string" &&
            ord.shippingAddress.trim()
          ) {
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

    // 7. Finalize summaries with averages and settlement states
    let result = Object.values(driverStatsMap).map((item) => {
      const avgPickup = calcAverage(item.pickupDurations);
      const avgDelivery = calcAverage(item.deliveryDurations);
      const avgReturn = calcAverage(item.returnDurations);

      let settlementState = "NONE";
      if (item.totalOrders > 0) {
        if (item.unpaidDriverShare === 0) {
          settlementState = "SETTLED";
        } else if (item.paidDriverShare > 0) {
          settlementState = "PARTIAL";
        } else {
          settlementState = "UNPAID";
        }
      }

      const dailyEarningsList = Object.entries(item.dailyEarnings)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, vals]) => {
          let daySettlementState = "NONE";
          if (vals.orderCount > 0) {
            if (vals.unpaidAmount === 0) daySettlementState = "SETTLED";
            else if (vals.paidAmount > 0) daySettlementState = "PARTIAL";
            else daySettlementState = "UNPAID";
          }
          return {
            date,
            ...vals,
            daySettlementState,
          };
        });

      return {
        ...item,
        settlementState,
        dailyEarnings: dailyEarningsList,
        averagePickupMinutes: avgPickup,
        averageDeliveryMinutes: avgDelivery,
        averageReturnMinutes: avgReturn,
        // Kept for backward compatibility
        medianPickupMinutes: avgPickup,
        medianDeliveryMinutes: avgDelivery,
        medianReturnMinutes: avgReturn,
      };
    });

    // Optional settlementStatus filtering
    if (settlementStatus === "unpaid") {
      result = result.filter(
        (r) => r.unpaidDriverShare > 0 || r.priorUnpaidAmount > 0
      );
    } else if (settlementStatus === "settled") {
      result = result.filter((r) => r.settlementState === "SETTLED");
    }

    // Overall fleet averages and financial totals
    const allDeliveryMins = result.flatMap((r) => r.deliveryDurations);
    const allPickupMins = result.flatMap((r) => r.pickupDurations);
    const allReturnMins = result.flatMap((r) => r.returnDurations);
    const totalFleetOrders = result.reduce((acc, r) => acc + r.totalOrders, 0);

    const fleetAvgDelivery = calcAverage(allDeliveryMins);
    const fleetAvgPickup = calcAverage(allPickupMins);
    const fleetAvgReturn = calcAverage(allReturnMins);

    const totalDeliveryFees =
      Number(result.reduce((acc, r) => acc + r.totalDeliveryFees, 0).toFixed(2));
    const totalDriverShare =
      Number(result.reduce((acc, r) => acc + r.totalDriverShare, 0).toFixed(2));
    const totalRestaurantShare =
      Number(result.reduce((acc, r) => acc + r.totalRestaurantShare, 0).toFixed(2));
    const totalPaidDriverShare =
      Number(result.reduce((acc, r) => acc + r.paidDriverShare, 0).toFixed(2));
    const totalUnpaidDriverShare =
      Number(result.reduce((acc, r) => acc + r.unpaidDriverShare, 0).toFixed(2));

    return res.status(200).json({
      success: true,
      drivers: result,
      fleetSummary: {
        totalDrivers: drivers.length,
        totalDeliveredOrders: totalFleetOrders,
        totalDeliveryFees,
        totalDriverShare,
        totalRestaurantShare,
        totalPaidDriverShare,
        totalUnpaidDriverShare,
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

/**
 * 9. POST /api/delivery/driver-payouts
 * Creates a settlement payout record for a driver and marks matched orders as PAID.
 * Body: { driverId, scope: "period" | "all_unpaid", from, to, paymentMethod, note }
 * Accessible by: admin, employee, cashier
 */
exports.createDriverPayout = async (req, res) => {
  try {
    const { driverId, scope = "all_unpaid", from, to, paymentMethod = "CASH", note = "" } = req.body;

    if (!driverId) {
      return res.status(400).json({ success: false, message: "معرف السائق مطلوب" });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "rider") {
      return res.status(404).json({ success: false, message: "السائق غير موجود" });
    }

    // Build order query for UNPAID delivered orders
    const query = {
      assignedRiderId: driverId,
      status: { $in: ["Delivered", "Submitted", "delivered", "submitted"] },
      orderType: { $ne: "pickup" },
      source: { $ne: "ishbek" },
      payoutStatus: { $ne: "PAID" },
    };

    if (scope === "period" && from) {
      const { start, end } = getBusinessDayRange("custom", from, to);
      if (start && end) {
        query.$or = [
          { submittedAt: { $gte: start, $lte: end } },
          { submittedAt: null, createdAt: { $gte: start, $lte: end } },
        ];
      }
    }

    const ordersToPay = await Order.find(query).populate("shippingAddress");

    if (!ordersToPay || ordersToPay.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لا توجد طلبات معلقة مستحقة للصرف لهذا السائق ضمن النطاق المحدد",
      });
    }

    // Calculate sum of driverShareAmount (snapshot first, fallback fee * 0.75)
    let totalAmount = 0;
    const orderIds = [];

    for (const ord of ordersToPay) {
      orderIds.push(ord._id);
      let dShare = 0;
      if (ord.driverShareAmount !== null && ord.driverShareAmount !== undefined) {
        dShare = Number(ord.driverShareAmount);
      } else {
        const fee =
          ord.deliveryFeeSnapshot !== null && ord.deliveryFeeSnapshot !== undefined
            ? Number(ord.deliveryFeeSnapshot)
            : Number(ord.shippingAddress?.deliveryCost) || Number(ord.deliveryFee) || 0;
        dShare = Number(((fee * 75) / 100).toFixed(2));
        ord.driverShareAmount = dShare;
        ord.ownerShareAmount = Number((fee - dShare).toFixed(2));
        await ord.save();
      }
      totalAmount = Number((totalAmount + dShare).toFixed(2));
    }

    // Generate unique payoutCode: PAY-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const payoutCode = `PAY-${dateStr}-${randomSuffix}`;

    const callerId = req.user._id || req.user.id;

    // Create payout record
    const payout = await DriverPayout.create({
      payoutCode,
      driverId: driver._id,
      orderIds,
      orderCount: ordersToPay.length,
      totalAmount,
      paymentMethod: ["CASH", "CLIQ"].includes(paymentMethod) ? paymentMethod : "CASH",
      note: note ? String(note).trim() : "",
      paidBy: callerId,
      paidAt: new Date(),
      status: "COMPLETED",
    });

    // Mark matched orders as PAID
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { payoutStatus: "PAID", payoutId: payout._id } }
    );

    const populatedPayout = await DriverPayout.findById(payout._id)
      .populate("paidBy", "name username phone")
      .populate("orderIds", "sequenceNumber totalPrice driverShareAmount submittedAt");

    return res.status(200).json({
      success: true,
      message: `تم صرف مستحقات السائق بنجاح بمبلغ ${totalAmount.toFixed(2)} JOD (سند رقم: ${payoutCode})`,
      payout: populatedPayout,
    });
  } catch (error) {
    console.error("Error in createDriverPayout:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 10. GET /api/delivery/driver-payouts/:driverId
 * Returns settlement history receipts for a given driver
 * Accessible by: admin, employee, cashier
 */
exports.getDriverPayouts = async (req, res) => {
  try {
    const { driverId } = req.params;
    const payouts = await DriverPayout.find({ driverId })
      .populate("paidBy", "name username phone")
      .populate("voidedBy", "name username phone")
      .populate("orderIds", "sequenceNumber totalPrice driverShareAmount submittedAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      payouts,
    });
  } catch (error) {
    console.error("Error in getDriverPayouts:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 11. POST /api/delivery/driver-payouts/:payoutId/void
 * Voids a payout and reverts all associated orders to UNPAID
 * Accessible by: ADMIN ONLY
 */
exports.voidDriverPayout = async (req, res) => {
  try {
    const callerId = req.user._id || req.user.id;
    const caller = await User.findById(callerId);
    if (!caller || caller.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإلغاء سندات الصرف (مسموح للمدراء فقط)",
      });
    }

    const { payoutId } = req.params;
    const { voidReason } = req.body;

    if (!voidReason || !String(voidReason).trim()) {
      return res.status(400).json({
        success: false,
        message: "سبب إلغاء سند الصرف إجباري",
      });
    }

    const payout = await DriverPayout.findById(payoutId);
    if (!payout) {
      return res.status(404).json({ success: false, message: "سند الصرف غير موجود" });
    }

    if (payout.status === "VOIDED") {
      return res.status(400).json({
        success: false,
        message: "سند الصرف ملغي مسبقاً",
      });
    }

    payout.status = "VOIDED";
    payout.voidReason = String(voidReason).trim();
    payout.voidedBy = caller._id;
    payout.voidedAt = new Date();
    await payout.save();

    // Revert orders to UNPAID and clear payoutId
    await Order.updateMany(
      { _id: { $in: payout.orderIds } },
      { $set: { payoutStatus: "UNPAID", payoutId: null } }
    );

    const populatedPayout = await DriverPayout.findById(payout._id)
      .populate("paidBy", "name username phone")
      .populate("voidedBy", "name username phone");

    return res.status(200).json({
      success: true,
      message: `تم إلغاء سند الصرف ${payout.payoutCode} بنجاح وإعادة الطلبات إلى غير مدفوعة`,
      payout: populatedPayout,
    });
  } catch (error) {
    console.error("Error in voidDriverPayout:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 12. GET /api/delivery/my-earnings
 * Read-only rider earnings for the current 4:00 AM business day
 * Accessible by: rider, admin
 */
exports.getMyEarnings = async (req, res) => {
  try {
    const callerId = req.user?._id || req.user?.id;
    const caller = req.user || (callerId ? await User.findById(callerId) : null);

    if (!caller || !["rider", "admin"].includes(caller.role)) {
      return res.status(403).json({ success: false, message: "غير مصرح لك" });
    }

    const targetRiderId =
      caller.role === "admin" && req.query.riderId
        ? req.query.riderId
        : (caller._id || callerId);

    const rider = await User.findById(targetRiderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: "السائق غير موجود" });
    }

    // 4:00 AM business day boundary for today
    const { start: todayStart, end: todayEnd } = getBusinessDayRange("today");

    // 1. Fetch today's completed orders
    const todayOrders = await Order.find({
      assignedRiderId: { $in: [rider._id, String(rider._id)] },
      status: { $in: ["Delivered", "Submitted", "delivered", "submitted"] },
      orderType: { $ne: "pickup" },
      source: { $ne: "ishbek" },
      $or: [
        { submittedAt: { $gte: todayStart, $lte: todayEnd } },
        { submittedAt: null, createdAt: { $gte: todayStart, $lte: todayEnd } },
        { submittedAt: { $exists: false }, createdAt: { $gte: todayStart, $lte: todayEnd } },
      ],
    })
      .populate("shippingAddress")
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    // 2. Fetch prior unpaid orders (submitted before todayStart)
    const priorUnpaidOrders = await Order.find({
      assignedRiderId: { $in: [rider._id, String(rider._id)] },
      status: { $in: ["Delivered", "Submitted", "delivered", "submitted"] },
      orderType: { $ne: "pickup" },
      source: { $ne: "ishbek" },
      payoutStatus: { $ne: "PAID" },
      $or: [
        { submittedAt: { $lt: todayStart } },
        { submittedAt: null, createdAt: { $lt: todayStart } },
        { submittedAt: { $exists: false }, createdAt: { $lt: todayStart } },
      ],
    })
      .populate("shippingAddress")
      .lean();

    let priorUnpaidAmount = 0;
    priorUnpaidOrders.forEach((ord) => {
      let dShare = 0;
      if (ord.driverShareAmount !== null && ord.driverShareAmount !== undefined) {
        dShare = Number(ord.driverShareAmount);
      } else {
        const fee =
          ord.deliveryFeeSnapshot !== null && ord.deliveryFeeSnapshot !== undefined
            ? Number(ord.deliveryFeeSnapshot)
            : Number(ord.shippingAddress?.deliveryCost) || Number(ord.deliveryFee) || 0;
        dShare = Number(((fee * 75) / 100).toFixed(2));
      }
      priorUnpaidAmount = Number((priorUnpaidAmount + dShare).toFixed(2));
    });

    // Compute today's earnings
    let totalEarnedToday = 0;
    let paidToday = 0;
    let unpaidToday = 0;

    const formattedTodayOrders = todayOrders.map((ord) => {
      const fee =
        ord.deliveryFeeSnapshot !== null && ord.deliveryFeeSnapshot !== undefined
          ? Number(ord.deliveryFeeSnapshot)
          : Number(ord.shippingAddress?.deliveryCost) || Number(ord.deliveryFee) || 0;

      let dShare = 0;
      if (ord.driverShareAmount !== null && ord.driverShareAmount !== undefined) {
        dShare = Number(ord.driverShareAmount);
      } else {
        dShare = Number(((fee * 75) / 100).toFixed(2));
      }

      totalEarnedToday = Number((totalEarnedToday + dShare).toFixed(2));
      const payoutStatus = ord.payoutStatus === "PAID" ? "PAID" : "UNPAID";
      if (payoutStatus === "PAID") {
        paidToday = Number((paidToday + dShare).toFixed(2));
      } else {
        unpaidToday = Number((unpaidToday + dShare).toFixed(2));
      }

      return {
        _id: ord._id,
        orderNumber: ord.sequenceNumber || String(ord._id).slice(-6),
        submittedAt: ord.submittedAt || ord.createdAt,
        deliveryFee: fee,
        driverShareAmount: dShare,
        payoutStatus,
      };
    });

    let settlementState = "NONE";
    if (todayOrders.length > 0) {
      if (unpaidToday === 0) {
        settlementState = "SETTLED";
      } else if (paidToday > 0) {
        settlementState = "PARTIAL";
      } else {
        settlementState = "UNPAID";
      }
    }

    const earningsPayload = {
      rider: {
        _id: rider._id,
        name: rider.name || rider.username,
        driverStatus: rider.driverStatus,
      },
      completedOrderCount: todayOrders.length,
      totalEarnedToday,
      paidToday,
      unpaidToday,
      settlementState,
      priorUnpaidAmount,
      priorUnpaidOrderCount: priorUnpaidOrders.length,
      todayOrders: formattedTodayOrders,
    };

    return res.status(200).json({
      success: true,
      ...earningsPayload,
      earnings: earningsPayload,
    });
  } catch (error) {
    console.error("Error in getMyEarnings:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

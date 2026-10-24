const express = require("express");
const router = express.Router();
const validateJWT = require("../middlewares/validateJWT");
const requireRole = require("../middlewares/requireRole");

const {
  getDeliverySettings,
  updateDeliverySettings,
  getDeliveryQueue,
  assignOrderToDriver,
  unassignOrder,
  confirmPickup,
  verifyDeliveryOtp,
  qrCheckIn,
  manualCheckIn,
  getMyDriverStatus,
  getDriverAnalytics,
  riderLogout,
} = require("../controller/deliveryController");

// ==========================================
// Delivery Settings Routes
// (Read: authenticated staff/riders; Write: ADMIN ONLY)
// ==========================================
router.get("/settings", validateJWT, getDeliverySettings);
router.put(
  "/settings",
  validateJWT,
  requireRole("admin"),
  updateDeliverySettings
);

// ==========================================
// Staff Delivery & Dispatch Routes
// (admin, employee, cashier)
// ==========================================

// 1. Get ready-for-pickup delivery orders & available drivers (FIFO)
router.get(
  "/queue",
  validateJWT,
  requireRole("admin", "employee", "cashier"),
  getDeliveryQueue
);

// 2. Assign order to an available driver
router.post(
  "/assign",
  validateJWT,
  requireRole("admin", "employee", "cashier"),
  assignOrderToDriver
);

// 2.1 Unassign order from driver and revert to ready
router.post(
  "/unassign/:orderId",
  validateJWT,
  requireRole("admin", "employee", "cashier"),
  unassignOrder
);

// 6. Manual check-in override for a driver
router.post(
  "/manual-checkin/:riderId",
  validateJWT,
  requireRole("admin", "employee", "cashier"),
  manualCheckIn
);

// 8. Driver Analytics & KPI statistics
router.get(
  "/driver-stats",
  validateJWT,
  requireRole("admin", "employee", "cashier"),
  getDriverAnalytics
);

// ==========================================
// Rider / Driver Mobile Workflow Routes
// (rider, admin)
// ==========================================

// 7. Get rider's own status and current assigned order
router.get(
  "/my-status",
  validateJWT,
  requireRole("rider", "admin"),
  getMyDriverStatus
);

// 3. Confirm physical pickup from branch (Order -> Shipped, Driver -> on_delivery, generates OTP)
router.post(
  "/confirm-pickup",
  validateJWT,
  requireRole("rider", "admin"),
  confirmPickup
);

// 4. Verify customer delivery OTP (Order -> Delivered/Submitted, Driver -> returning)
router.post(
  "/verify-otp",
  validateJWT,
  requireRole("rider", "admin"),
  verifyDeliveryOtp
);

// 5. Scan branch QR code upon return (Driver -> available, records returnedAt)
router.post(
  "/qr-checkin",
  validateJWT,
  requireRole("rider", "admin"),
  qrCheckIn
);

// 5.1 Rider Logout (Driver -> unavailable, reverts assigned order to queue)
router.post(
  "/rider-logout",
  validateJWT,
  requireRole("rider", "admin"),
  riderLogout
);

module.exports = router;

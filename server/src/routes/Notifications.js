const express = require("express");
const router = express.Router();

const validateJWT = require("../middlewares/validateJWT");
const requireRole = require("../middlewares/requireRole");

const {
  savePushToken,
  removePushToken,
  broadcastNotification,
} = require("../controller/Notificationcontroller");

router.post("/users/push-token", validateJWT, savePushToken);
router.delete("/users/push-token", validateJWT, removePushToken);

router.post(
  "/admin/notifications/broadcast",
  validateJWT,
  requireRole("admin"),
  broadcastNotification,
);

module.exports = router;
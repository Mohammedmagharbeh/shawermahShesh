const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrder,
} = require("../controller/orderController.js");

dotenv.config();

const router = express.Router();

router.get("/get", getAllOrders);
router.get("/user/:userId", getOrdersByUserId);
router.get("/:id", getOrderById);
router.post("/post", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;

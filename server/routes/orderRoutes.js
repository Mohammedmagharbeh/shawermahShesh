const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const orders = require("../controller/orderController.js");
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
router.get("/:id", getOrderById);
router.get("/user/:userId", getOrdersByUserId);
router.post("/post", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router; 

const express = require("express");
const validateJWT = require("../middlewares/validateJWT.js");

const {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrder,
} = require("../controller/orderController.js");

const router = express.Router();

router.get("/get", validateJWT, getAllOrders);
router.get("/user/:userId", validateJWT, getOrdersByUserId); // must come BEFORE /:id
router.get("/:id", validateJWT, getOrderById);
router.post("/post", validateJWT, createOrder);
router.put("/:id", validateJWT, updateOrder);
router.delete("/:id", validateJWT, deleteOrder);

module.exports = router;

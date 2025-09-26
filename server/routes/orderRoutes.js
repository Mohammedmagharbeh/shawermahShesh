import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrder,
} from "../controller/orderController";

const router = express.Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.get("/user/:userId", getOrdersByUserId);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

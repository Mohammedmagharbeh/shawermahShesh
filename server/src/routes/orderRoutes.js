  const express = require("express");
  const validateJWT = require("../middlewares/validateJWT.js");

  const {
    createOrder,
    deleteOrder,
    getAllOrders,
    getOrdersStats,
    getTodayOrders,
    getOrderById,
    getOrdersByUserId,
    getMyActiveOrder,
    updateOrder,
  } = require("../controller/orderController.js");

  const router = express.Router();

  router.get("/get",   validateJWT, getAllOrders);              // paginated — Orders.jsx
  router.get("/stats", validateJWT, getOrdersStats);            // aggregated — Statistics.jsx
  router.get("/today", validateJWT, getTodayOrders);            // date-scoped — AdminDashboard
  router.get("/active/current", validateJWT, getMyActiveOrder); // active order for logged-in user
  router.get("/user/:userId", validateJWT, getOrdersByUserId);  // must come BEFORE /:id
  router.get("/:id", validateJWT, getOrderById);
  router.post("/post", validateJWT, createOrder);
  // router.put("/:id", validateJWT, updateOrder);
  router.put("/:id", updateOrder);
  router.delete("/:id", validateJWT, deleteOrder);

  module.exports = router;

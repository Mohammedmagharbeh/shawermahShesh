const express = require("express");
const cors = require("cors");
const routes = express.Router();
require("dotenv").config();

const {
  removeFromCart,
  updateCart,
  clearCart,
  getCart,
  addToCart,
} = require("../controller/cartcontroller");
const validateJWT = require("../middlewares/validateJWT");

routes.get("/:userId", validateJWT, getCart);
routes.post("/add/:userId", validateJWT, addToCart);
routes.put("/update/:id", validateJWT, updateCart);
routes.delete("/remove", validateJWT, removeFromCart);
routes.delete("/clear/:userId", validateJWT, clearCart);

module.exports = routes;

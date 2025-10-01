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

routes.get("/:userId", getCart);
routes.post("/add/:userId", addToCart);
routes.put("/update/:id", updateCart);
routes.delete("/remove", removeFromCart);
routes.delete("/clear/:userId", clearCart);

module.exports = routes;

const express = require("express");
const cors = require("cors");
const routes = express.Router();
require("dotenv").config();

const {
  removeFromCart,
  updatecart,
  clearCart,
  getCart,
  addToCart,
} = require("../controller/cartcontroller");

routes.get("/:userId", getCart);
routes.post("/:userId/add", addToCart);
routes.put("/updatecart/:id", updatecart);
routes.delete("/deletecart", removeFromCart);
routes.delete("/clearcart/:userId", clearCart);

module.exports = routes;

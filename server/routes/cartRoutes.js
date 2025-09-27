const express = require("express");
const { getCart, addToCart } = require("../controller/cartcontroller");

const express = require("express");
const cors = require("cors");
const routes = express.Router();
require("dotenv").config();


const{removeFromCart,updatecart,clearCart}=require("../controller/cartcontroller")


routes.put("/updatecart/:id", updatecart);
routes.delete("/deletecart", removeFromCart);
routes.delete("/clearcart/:userId", clearCart);
require("dotenv").config();

routes.get("/:userId", getCart);
routes.post("/:userId/add", addToCart);

module.exports = routes;

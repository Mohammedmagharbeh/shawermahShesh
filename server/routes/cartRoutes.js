
const express = require("express");
const cors = require("cors");
const routes = express.Router();
require("dotenv").config();


const{removeFromCart,updatecart,clearCart}=require("../controller/cartcontroller")


routes.put("/updatecart/:id", updatecart);
routes.delete("/deletecart", removeFromCart);
routes.delete("/clearcart/:userId", clearCart);

module.exports = routes;

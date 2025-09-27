const express = require("express");
const { getCart, addToCart } = require("../controller/cartcontroller");

const routes = express.Router();
require("dotenv").config();

routes.get("/:userId", getCart);
routes.post("/:userId/add", addToCart);

module.exports = routes;

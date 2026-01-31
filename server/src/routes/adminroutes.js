const express = require("express");
const routes = express.Router();
require("dotenv").config();

const {
  postEat,
  updatedfood,
  deletefood,
  reorderProducts,
  updateUserRole,
  addUser,
} = require("../controller/admincontroller");
const validateJWT = require("../middlewares/validateJWT");
const requireRole = require("../middlewares/requireRole");

routes.post("/postfood", validateJWT, requireRole("admin"), postEat);
routes.put("/updatefood/:id", validateJWT, requireRole("admin"), updatedfood);
routes.delete("/deletefood/:id", validateJWT, requireRole("admin"), deletefood);
routes.put("/reorder", validateJWT, requireRole("admin"), reorderProducts);

// user management
routes.put("/user/:id", validateJWT, requireRole("admin"), updateUserRole);

routes.post("/user/add", validateJWT, requireRole("admin"), addUser);

module.exports = routes;

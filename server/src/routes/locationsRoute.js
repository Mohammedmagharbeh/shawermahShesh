const express = require("express");
const {
  getLocationById,
  getLocations,
  addLocation,
} = require("../controller/locationsController");
const routes = express.Router();
const validateJWT = require("../middlewares/validateJWT");

routes.get("/get", validateJWT, getLocations);

routes.get("/:id", validateJWT, getLocationById);

routes.post("/", validateJWT, addLocation);

module.exports = routes;

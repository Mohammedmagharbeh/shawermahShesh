const express = require("express");
const {
  getLocationById,
  getLocations,
  addLocation,
} = require("../controller/locationsController");
const routes = express.Router();

routes.get("/get", getLocations);

routes.get("/:id", getLocationById);

routes.post("/", addLocation);

module.exports = routes;

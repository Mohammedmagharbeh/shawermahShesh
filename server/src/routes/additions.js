const express = require("express");
const routes = express.Router();

const {
  getAdditions,
  addAddition,
  deleteAddition,
  updateAddition,
  getAdditionsByCategory,
} = require("../controller/additions");

routes.get("/", getAdditions);
routes.get("/category/:category", getAdditionsByCategory);
routes.post("/", addAddition);
routes.delete("/:id", deleteAddition);
routes.put("/:id", updateAddition);

module.exports = routes;

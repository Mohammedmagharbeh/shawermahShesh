const express = require("express");
const routes = express.Router();

const {
  getAdditions,
  addAddition,
  deleteAddition,
  updateAddition,
} = require("../controller/additions");

routes.get("/", getAdditions);
routes.post("/", addAddition);
routes.delete("/:id", deleteAddition);
routes.put("/:id", updateAddition);

module.exports = routes;
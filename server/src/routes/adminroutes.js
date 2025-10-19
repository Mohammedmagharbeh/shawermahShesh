const express = require("express");
const cors = require("cors");
const routes = express.Router();
require("dotenv").config();
const userModel = require("../models/user");

const {
  postEat,
  updatedfood,
  deletefood,
} = require("../controller/admincontroller");
const { USER_ROLES } = require("../constants");

routes.post("/postfood", postEat);
routes.put("/updatefood/:id", updatedfood);
routes.delete("/deletefood/:id", deletefood);

// user management
routes.put("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!id || !role) {
      return res.status(400).json({ message: "User ID and role are required" });
    }
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await userModel.findByIdAndUpdate(
      id,
      { role: role },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = routes;

const express = require("express");
const bodyParse = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const orderRoutes = require("./routes/orderRoutes");
const userroutes = require("./routes/userroutes");
const adminroutes = require("./routes/adminroutes");
const cartRoutes = require("./routes/cartRoutes");
const locationsRoute = require("./routes/locationsRoute");

dotenv.config();
const app = express();
connectDB();

app.use(bodyParse.json());
app.use(bodyParse.urlencoded({ extended: true }));
app.use(cors());
app.use("/api", userroutes);
app.use("/api/admin", adminroutes);
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/locations", locationsRoute);

module.exports = app;

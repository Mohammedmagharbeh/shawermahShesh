const express = require("express");
const bodyParse = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const orderRoutes = require("./routes/orderRoutes");
const userroutes = require("./routes/userroutes");
const adminroutes = require("./routes/adminroutes");

dotenv.config();
const app = express();
connectDB();

app.use(bodyParse.json());
app.use(cors());
app.use("/api", userroutes);
app.use("/api/admin", adminroutes);

app.use("/api/order",orderRoutes)


module.exports = app;

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

// Routes
const orderRoutes = require("./routes/orderRoutes");
const userroutes = require("./routes/userroutes");
const adminroutes = require("./routes/adminroutes");
const cartRoutes = require("./routes/cartRoutes");
const locationsRoute = require("./routes/locationsRoute");
const myfatoorah = require("./routes/myfatoorah");
const additions = require("./routes/additions");
const slideRoutes = require("./routes/slideRoutes");

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

app.set("io", io);

// Register routes
app.use("/api", userroutes);
app.use("/api/admin", adminroutes);
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/locations", locationsRoute);
app.use("/api/myfatoorah", myfatoorah);
app.use("/api/additions", additions);
app.use("/api/slides", slideRoutes);

module.exports = server;

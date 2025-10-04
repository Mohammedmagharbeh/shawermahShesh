const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http"); // required for socket.io
const { Server } = require("socket.io");

// Routes
const orderRoutes = require("./routes/orderRoutes");
const userroutes = require("./routes/userroutes");
const adminroutes = require("./routes/adminroutes");
const cartRoutes = require("./routes/cartRoutes");
const locationsRoute = require("./routes/locationsRoute");
const myfatoorah = require("./routes/myfatoorah");

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB connection
connectDB();

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // put frontend URL here later
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible to routes/controllers
app.set("io", io);

// Register routes
app.use("/api", userroutes);
app.use("/api/admin", adminroutes);
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/locations", locationsRoute);
app.use("/api/myfatoorah", myfatoorah);

module.exports = server; // export server instead of app

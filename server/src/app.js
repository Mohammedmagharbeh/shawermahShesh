const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

// Routes Imports
const orderRoutes = require("./routes/orderRoutes");
const userroutes = require("./routes/userroutes");
const adminroutes = require("./routes/adminroutes");
const cartRoutes = require("./routes/cartRoutes");
const locationsRoute = require("./routes/locationsRoute");
const montypay = require("./routes/montypay");
const additions = require("./routes/additions");
const slideRoutes = require("./routes/slideRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

dotenv.config();
const app = express();

// Middleware
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

// ----------------------------------------------------
// 🟢 THE FIX: Create a Router for all API endpoints
// ----------------------------------------------------
const apiRouter = express.Router();

// Register your routes to this 'apiRouter' instead of 'app'
apiRouter.use("/", userroutes); // This handles /api/login, /api/signup etc.
apiRouter.use("/admin", adminroutes);
apiRouter.use("/order", orderRoutes);
apiRouter.use("/cart", cartRoutes);
apiRouter.use("/locations", locationsRoute);
apiRouter.use("/montypay", montypay);
apiRouter.use("/additions", additions);
apiRouter.use("/slides", slideRoutes);
apiRouter.use("/categories", categoryRoutes);
apiRouter.use("/jobs", jobRoutes);
apiRouter.use("/apply", applicationRoutes);

// ----------------------------------------------------
// 🟢 APPLY THE ROUTER
// Tell Express: "If the link starts with /api, use the routes above"
// ----------------------------------------------------
app.use("/api", apiRouter);

// Optional: Simple check to see if server is running at root
app.get("/", (req, res) => {
  res.send("Shawarma Sheesh Server is Running!");
});

module.exports = server;

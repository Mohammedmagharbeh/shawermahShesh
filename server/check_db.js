require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("./src/models/orders");
const SavedCard = require("./src/models/savedCard");

async function check() {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/shawarma");
  console.log("Connected to MongoDB.");

  const cards = await SavedCard.find({}).sort({ createdAt: -1 }).limit(5);
  console.log("\n--- Latest SavedCards ---");
  console.log(JSON.stringify(cards, null, 2));

  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(2);
  console.log("\n--- Latest Order ---");
  console.log(JSON.stringify(orders, null, 2));
  
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});

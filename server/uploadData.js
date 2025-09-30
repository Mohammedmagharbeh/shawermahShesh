const mongoose = require("mongoose");
const XLSX = require("xlsx");
const Product = require("./models/products");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Path to your Excel file
const filePath = "C:\\Users\\Ahmad Jamil\\Downloads\\menu.xlsx";

// Read the Excel file
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert sheet to JSON
let data = XLSX.utils.sheet_to_json(worksheet);

// Clean and prepare data
data = data
  .filter((item) => item.name && item.price) // skip rows without name or price
  .map((item) => {
    // Convert price to number by stripping non-numeric characters
    const numericPrice = parseFloat(
      item.price.toString().replace(/[^\d.]/g, "")
    );
    return {
      ...item,
      price: isNaN(numericPrice) ? 0 : numericPrice, // fallback to 0 if invalid
    };
  });

// Insert into MongoDB
Product.insertMany(data)
  .then(() => {
    console.log("Data inserted successfully!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error inserting data:", err);
    mongoose.connection.close();
  });

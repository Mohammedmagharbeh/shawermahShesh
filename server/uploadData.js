// uploadData.js
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");
require("dotenv").config();

const Product = require("../server/src/models/products");

// ----------------------
// 1️⃣ Connect to MongoDB
// ----------------------
mongoose
  .connect(
    "mongodb+srv://ahmadjkff1_db_user:wYjIsvs7s8IN58cZ@cluster0.7ehidmw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ----------------------
// 2️⃣ Load Excel File
// ----------------------
const filePath = path.join(
  "C:",
  "Users",
  "Ahmad Jamil",
  "Desktop",
  "Menu_full.xls" // ensure correct extension
);

const workbook = XLSX.readFile(filePath);
console.log("📄 Sheets found:", workbook.SheetNames);

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert sheet to JSON
let data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

// ----------------------
// 3️⃣ Clean and Transform Data
// ----------------------
if (data.length === 0) {
  console.error(
    "⚠️ No data found in Excel file! Check your headers or sheet name."
  );
  mongoose.connection.close();
  process.exit(1);
}

console.log(`📊 Loaded ${data.length} rows from Excel.`);
console.log("🔍 Preview first 3 rows:", data.slice(0, 3));

data = data
  .filter((item) => item.enName && item.price)
  .map((item) => {
    const numericPrice = parseFloat(
      item.price.toString().replace(/[^\d.]/g, "")
    );

    return {
      category: item.category || "",
      name: {
        en: item.enName || "",
        ar: item.arName || "",
      },
      description: {
        en: item.enDescription || "",
        ar: item.arDdescription || item.arDescription || "",
      },
      type: item.type || "",
      price: isNaN(numericPrice) ? 0 : numericPrice,
      image: "", // 👈 Add a default value or generate one if needed
    };

    return {
      category: item.category || "",
      name_en: item.enName || "", // match Excel field
      name_ar: item.arName || "",
      type: item.type || "",
      description_en: item.enDescription || "",
      description_ar: item.arDdescription || "",
      price: isNaN(numericPrice) ? 0 : numericPrice,
    };
  });

console.log(`✅ Prepared ${data.length} valid products for insertion.`);

// ----------------------
// 4️⃣ Upload to MongoDB
// ----------------------
(async () => {
  try {
    await Product.deleteMany({}); // optional — clears existing data first
    console.log("🗑️ Old products cleared.");

    const inserted = await Product.insertMany(data);
    console.log(`🎉 Successfully inserted ${inserted.length} products!`);
  } catch (err) {
    console.error("❌ Error inserting data:", err);
  } finally {
    mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
})();

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
    "mongodb+srv://website_db_user:6FUMrfa3CJtY1fHF@cluster0.3vvebnn.mongodb.net/?appName=Cluster0"
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
  "Menu.xlsx"
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

// console.log(`📊 Loaded ${data.length} rows from Excel.`);
// console.log("🔍 Preview first 3 rows:", data.slice(0, 3));

data = data
  .filter((item) => item.enName)
  .map((item) => {
    const base =
      parseFloat(item.basePrice) ||
      parseFloat(item.chickenPrice) ||
      parseFloat(item.meatPrice) ||
      0;

    if (item.hasTypeChoices && item.hasProteinChoices) {
      item.prices = {
        chicken: {
          sandwich: item.chickenSandwichPrice,
          meal: item.chickenMealPrice,
        },
        meat: {
          sandwich: item.meatSandwichPrice,
          meal: item.meatMealPrice,
        },
      };
    }
    if (item.hasTypeChoices) {
      item.prices = {
        sandwich: item.sandwichPrice,
        meal: item.mealPrice,
      };
    }
    if (item.hasProteinChoices) {
      item.prices = {
        chicken: item.chickenPrice,
        meat: item.meatPrice,
      };
    }

    return {
      name: {
        en: item.enName || "",
        ar: item.arName || "",
      },
      description: {
        en: item.enDescription || "",
        ar: item.arDescription || "",
      },
      basePrice: base,
      discount: item.discount || 0,
      image: "",
      category: item.category || "",
      isSpicy: item.isSpicy || false,
      hasTypeChoices: item.hasTypeChoices || false,
      hasProteinChoices: item.hasProteinChoices || false,
      prices: item.prices,
    };
  });

console.log(`✅ Prepared ${data.length} valid products for insertion.`);

// console.log("data:", data);

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

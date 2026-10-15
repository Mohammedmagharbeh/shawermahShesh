require("dotenv").config();
const mongoose = require("mongoose");

const uri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.DB_URL ||
  process.env.DATABASE_URL ||
  process.env.DB_URI;

if (!uri) {
  console.log("ما لقيت رابط الداتابيس بملف .env. الأسماء الموجودة:");
  console.log(Object.keys(process.env).filter((k) => /mongo|db|database/i.test(k)));
  process.exit(1);
}

const Product = require("./src/models/products");
const Category = require("./src/models/Category");

async function main() {
  await mongoose.connect(uri);
  console.log("✅ اتصلت بالداتابيس.\n");

  const categories = await Category.find().sort({ position: 1 }).lean();
  console.log("--- التصنيفات ---");
  console.log(JSON.stringify(categories, null, 2));
  console.log("\nعدد الأصناف:", await Product.countDocuments());

  const queries = [
    ["صنف فيه خيار ساندويش/وجبة", { hasTypeChoices: true }],
    ["صنف فيه خيار دجاج/لحمة", { hasProteinChoices: true }],
    ["صنف فيه additionCategories", { "additionCategories.0": { $exists: true } }],
    ["صنف فيه additions", { "additions.0": { $exists: true } }],
    ["صنف عادي", { hasTypeChoices: false, hasProteinChoices: false }],
  ];

  for (const [label, filter] of queries) {
    const p = await Product.findOne(filter).lean();
    console.log("\n--- " + label + " ---");
    console.log(p ? JSON.stringify(p, null, 2) : "(ما في صنف مطابق)");
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.log("خطأ:", e.message);
  process.exit(1);
});
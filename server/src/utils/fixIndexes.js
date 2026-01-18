const mongoose = require("mongoose");

async function fixUserIndexes() {
  try {
    const db = mongoose.connection;
    const collection = db.collection("users");

    // Drop all existing indexes on phone and username
    try {
      await collection.dropIndex("phone_1");
      console.log("✅ Dropped old phone index");
    } catch (err) {
      console.log("⚠️ phone_1 index doesn't exist (or already dropped)");
    }

    try {
      await collection.dropIndex("username_1");
      console.log("✅ Dropped old username index");
    } catch (err) {
      console.log("⚠️ username_1 index doesn't exist (or already dropped)");
    }

    // Create new sparse unique indexes
    await collection.createIndex({ phone: 1 }, { sparse: true, unique: true });
    console.log("✅ Created new sparse unique index for phone");

    await collection.createIndex(
      { username: 1 },
      { sparse: true, unique: true }
    );
    console.log("✅ Created new sparse unique index for username");

    console.log("✅ Database indexes fixed successfully!");
  } catch (error) {
    console.error("❌ Error fixing indexes:", error.message);
  }
}

module.exports = fixUserIndexes;

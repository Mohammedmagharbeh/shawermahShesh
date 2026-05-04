const mongoose = require("mongoose");
const blacklistSchema = new mongoose.Schema({ email: String }, { timestamps: true });
module.exports = mongoose.model("Blacklist", blacklistSchema);
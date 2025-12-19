// const mongoose = require("mongoose");

// const JobSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   type: { type: String, required: true },
//   // quantity: { type: Number, required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Job", JobSchema);
const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true }
  },
  type: {
    ar: { type: String, required: true },
    en: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", JobSchema);

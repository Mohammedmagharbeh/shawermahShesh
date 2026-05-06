
// const mongoose = require("mongoose");

// const JobSchema = new mongoose.Schema({
//   title: {
//     ar: { type: String, required: true },
//     en: { type: String, required: true }
//   },
//   type: {
//     ar: { type: String, required: true },
//     en: { type: String, required: true }
//   },
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

  gender: {
  ar: { type: String },
  en: { type: String }
},
  isActive: { type: Boolean, default: true }, // حقل جديد لإخفاء/إظهار الوظيفة
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", JobSchema);
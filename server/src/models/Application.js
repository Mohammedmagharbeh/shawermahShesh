


// // const mongoose = require("mongoose");

// // const applicationSchema = new mongoose.Schema({
// //   applicantName: String,
// //   applicantEmail: String,
// //   phone: String,
// //   nationality: String,    // ✅ مضاف
// //   education: String,      // ✅ مضاف
// //   age: String,
// //   startDate: Date,
// //   resume: String,
// //   experienceCertificate: String,
// //   workedBefore: String,
// //   previousJobs: String,
// //   previousTitle: String,
// //   jobId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: "Job",
// //   },
// // });

// // module.exports = mongoose.model("Application", applicationSchema);


// const mongoose = require("mongoose");

// const applicationSchema = new mongoose.Schema({
//   applicantName: String,
//   applicantEmail: String,
//   phone: String,
//   nationality: String,
//   education: String,
//   age: String,
//   startDate: Date,
//   resume: String,
//   experienceCertificate: String,
//   workedBefore: String,
//   previousJobs: String,
//   previousTitle: String,
//   jobId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Job",
//   },
//   // --- الحقول الجديدة ---
//   status: { type: String, default: "pending" }, // pending, accepted, rejected
//   isBlacklisted: { type: Boolean, default: false }, // إذا true، لن يستطيع التقديم مستقبلاً
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Application", applicationSchema);غ
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  applicantName: String,
  applicantEmail: String,
  phone: String,
  nationality: String,
  education: String,
  age: String,
  startDate: Date,
  resume: String,
  experienceCertificate: String,
  workedBefore: String,
  previousJobs: String,
  previousTitle: String,
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  status: { type: String, default: "pending" }, 
  isBlacklisted: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Application", applicationSchema);
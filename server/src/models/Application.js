


const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  applicantName: String,
  applicantEmail: String,
  phone: String,
  nationality: String,    // ✅ مضاف
  education: String,      // ✅ مضاف
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
});

module.exports = mongoose.model("Application", applicationSchema);

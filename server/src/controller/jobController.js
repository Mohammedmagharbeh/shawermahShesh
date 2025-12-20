const Job = require("../models/Job");
const Application = require("../models/Application");

// exports.createJob = async (req, res) => {
//   try {
//     const job = new Job(req.body);
//     await job.save();
//     res.json(job);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.createJob = async (req, res) => {
  try {
    const { titleAr, titleEn, typeAr, typeEn } = req.body;

    const job = new Job({
      title: { ar: titleAr, en: titleEn },
      type: { ar: typeAr, en: typeEn },
    });

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getApplicationsForJob = async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // حذف الوظيفة
    await Job.findByIdAndDelete(jobId);

    // حذف جميع المتقدمين المرتبطين بهذه الوظيفة
    await Application.deleteMany({ jobId });

    res.json({ message: "تم حذف الوظيفة والمتقدمين المرتبطين بها" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

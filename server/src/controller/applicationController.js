const Application = require("../models/Application");

exports.applyJob = async (req, res) => {
  try {
    const {
      applicantName,
      applicantEmail,
      phone,
       nationality,   // ✅ جديد
      education,     // ✅ جديد
      age,
      startDate,
      workedBefore,
      previousJobs,
      previousTitle,
      jobId
    } = req.body;

    const resume = req.files?.resume ? req.files.resume[0].path : "";
    const experienceCertificate = req.files?.experienceCertificate ? req.files.experienceCertificate[0].path : "";

    const application = new Application({
      applicantName,
      applicantEmail,
      phone,
      nationality,   // ✅ أضفهم هنا
  education, 
      age,
      startDate,
      resume,
      experienceCertificate,
      workedBefore,
      previousJobs,
      previousTitle,
      jobId
    });

    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

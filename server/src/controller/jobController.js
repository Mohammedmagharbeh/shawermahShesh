const Job = require("../models/Job");
const Application = require("../models/Application");
const Blacklist = require("../models/Blacklist");

// 1. جلب الوظائف (أدمن + يوزر)
exports.getJobs = async (req, res) => {
  try {
    const { admin } = req.query;
    const query = admin === "true" ? {} : { isActive: true };
    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();

    if (admin === "true") {
      for (let job of jobs) {
        job.applicationCount = await Application.countDocuments({
          jobId: job._id,
        });
      }
    }
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. جلب المتقدمين لكل وظيفة مع فحص حالة الحظر
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId })
      .sort({ createdAt: -1 })
      .lean();

    const updatedApplications = await Promise.all(
      applications.map(async (app) => {
        const isBlacklisted = await Blacklist.findOne({
          email: app.applicantEmail,
        });
        return { ...app, isBlacklisted: !!isBlacklisted };
      }),
    );

    res.status(200).json(updatedApplications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. إضافة وظيفة جديدة
// exports.createJob = async (req, res) => {
//     try {
//         const { titleAr, titleEn, typeAr, typeEn } = req.body;
//         const newJob = new Job({
//             title: { ar: titleAr, en: titleEn },
//             type: { ar: typeAr, en: typeEn },

//             isActive: true
//         });
//         await newJob.save();
//         res.status(201).json(newJob);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// mm
// 3. إضافة وظيفة جديدة
exports.createJob = async (req, res) => {
  // 👇 سطر الطباعة هاد رح يفرجينا شو واصل من الفرونت بالملي
  console.log("==========================================");
  console.log(
    "🚀 DATA RECEIVED FROM FRONTEND:",
    JSON.stringify(req.body, null, 2),
  );
  console.log("==========================================");

  try {
    const { titleAr, titleEn, typeAr, typeEn, genderAr, genderEn } = req.body;

    // التحقق من وصول البيانات قبل الحفظ (إجباري للتيست)
    if (!genderAr || !genderEn) {
      console.log("⚠️ WARNING: Gender data is missing in req.body!");
    }

    const newJob = new Job({
      title: { ar: titleAr, en: titleEn },
      type: { ar: typeAr, en: typeEn },
      gender: {
        ar: genderAr || "غير محدد",
        en: genderEn || "Not Specified",
      },
      isActive: true,
    });

    await newJob.save();

    console.log("✅ JOB SAVED SUCCESSFULLY:", newJob);
    res.status(201).json(newJob);
  } catch (err) {
    console.error("❌ ERROR IN CREATE JOB:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 4. إخفاء / إظهار الوظيفة
exports.toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.isActive = !job.isActive;
    await job.save();

    res.status(200).json({
      message: job.isActive ? "تم إظهار الوظيفة" : "تم إخفاء الوظيفة",
      isActive: job.isActive,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. حظر / فك حظر إيميل (تأكد من اسم الدالة بالظبط)
exports.toggleBlacklist = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "الإيميل مطلوب" });

    const existing = await Blacklist.findOne({ email });

    if (existing) {
      await Blacklist.deleteOne({ email });
      return res
        .status(200)
        .json({ message: "تم فك الحظر", isBlacklisted: false });
    } else {
      const newBlacklist = new Blacklist({ email });
      await newBlacklist.save();
      return res
        .status(200)
        .json({ message: "تم الحظر بنجاح", isBlacklisted: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. حذف وظيفة نهائياً
exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ jobId: req.params.id });
    res.status(200).json({ message: "تم حذف الوظيفة نهائياً" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

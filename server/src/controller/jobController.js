// // // // // const Job = require("../models/Job");
// // // // // const Application = require("../models/Application");


// // // // // exports.createJob = async (req, res) => {
// // // // //   try {
// // // // //     const { titleAr, titleEn, typeAr, typeEn } = req.body;

// // // // //     const job = new Job({
// // // // //       title: { ar: titleAr, en: titleEn },
// // // // //       type: { ar: typeAr, en: typeEn },
// // // // //     });

// // // // //     await job.save();
// // // // //     res.json(job);
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ error: err.message });
// // // // //   }
// // // // // };

// // // // // exports.getJobs = async (req, res) => {
// // // // //   try {
// // // // //     const jobs = await Job.find();
// // // // //     res.json(jobs);
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ error: err.message });
// // // // //   }
// // // // // };

// // // // // exports.getApplicationsForJob = async (req, res) => {
// // // // //   try {
// // // // //     const applications = await Application.find({ jobId: req.params.jobId });
// // // // //     res.json(applications);
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ error: err.message });
// // // // //   }
// // // // // };

// // // // // exports.deleteJob = async (req, res) => {
// // // // //   try {
// // // // //     const jobId = req.params.jobId;

// // // // //     // حذف الوظيفة
// // // // //     await Job.findByIdAndDelete(jobId);

// // // // //     // حذف جميع المتقدمين المرتبطين بهذه الوظيفة
// // // // //     await Application.deleteMany({ jobId });

// // // // //     res.json({ message: "تم حذف الوظيفة والمتقدمين المرتبطين بها" });
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ error: err.message });
// // // // //   }
// // // // // };

// // // // const Job = require("../models/Job");
// // // // const Application = require("../models/Application");

// // // // // جلب كل الوظائف للأدمن
// // // // exports.getAllJobsAdmin = async (req, res) => {
// // // //     try {
// // // //         const jobs = await Job.find().sort({ createdAt: -1 });
// // // //         res.json(jobs);
// // // //     } catch (err) {
// // // //         res.status(500).json({ message: err.message });
// // // //     }
// // // // };

// // // // // جلب الوظائف النشطة فقط للمستخدم
// // // // exports.getJobs = async (req, res) => {
// // // //     try {
// // // //         const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
// // // //         res.json(jobs);
// // // //     } catch (err) {
// // // //         res.status(500).json({ message: err.message });
// // // //     }
// // // // };

// // // // // إخفاء الوظيفة
// // // // exports.deleteJob = async (req, res) => {
// // // //     try {
// // // //         await Job.findByIdAndUpdate(req.params.id, { isActive: false });
// // // //         res.json({ message: "Job hidden" });
// // // //     } catch (err) {
// // // //         res.status(500).json({ message: err.message });
// // // //     }
// // // // };

// // // // // تفعيل الوظيفة
// // // // exports.activateJob = async (req, res) => {
// // // //     try {
// // // //         await Job.findByIdAndUpdate(req.params.id, { isActive: true });
// // // //         res.json({ message: "Job activated" });
// // // //     } catch (err) {
// // // //         res.status(500).json({ message: err.message });
// // // //     }
// // // // };

// // // // // التقديم (مع فحص الحظر)
// // // // exports.applyJob = async (req, res) => {
// // // //     try {
// // // //         const { applicantEmail } = req.body;
// // // //         const isBlocked = await Application.findOne({ applicantEmail, isBlacklisted: true });
        
// // // //         if (isBlocked) return res.status(403).json({ message: "Blocked" });

// // // //         const newApp = new Application({
// // // //             ...req.body,
// // // //             resume: req.files['resume'] ? req.files['resume'][0].path : null,
// // // //             experienceCertificate: req.files['experienceCertificate'] ? req.files['experienceCertificate'][0].path : null
// // // //         });
// // // //         await newApp.save();
// // // //         res.status(201).json({ message: "Success" });
// // // //     } catch (err) {
// // // //         res.status(400).json({ message: err.message });
// // // //     }
// // // // };

// // // // // إضافة وظيفة
// // // // exports.createJob = async (req, res) => {
// // // //     try {
// // // //         const { titleAr, titleEn, typeAr, typeEn } = req.body;
// // // //         const newJob = new Job({
// // // //             title: { ar: titleAr, en: titleEn },
// // // //             type: { ar: typeAr, en: typeEn },
// // // //             isActive: true
// // // //         });
// // // //         await newJob.save();
// // // //         res.status(201).json(newJob);
// // // //     } catch (err) {
// // // //         res.status(400).json({ message: err.message });
// // // //     }
// // // // };

// // // const Job = require("../models/Job"); // تأكد أن مسار الموديل صحيح
// // // const Application = require("../models/Application");

// // // // 1. جلب الوظائف النشطة (للمستخدمين)
// // // exports.getJobs = async (req, res) => {
// // //     try {
// // //         const jobs = await Job.find({ isActive: true });
// // //         res.json(jobs);
// // //     } catch (err) {
// // //         res.status(500).json({ message: "Error fetching jobs", error: err.message });
// // //     }
// // // };

// // // // 2. جلب كل الوظائف (للأدمن)
// // // exports.getAllJobsAdmin = async (req, res) => {
// // //     try {
// // //         const jobs = await Job.find({});
// // //         res.json(jobs);
// // //     } catch (err) {
// // //         res.status(500).json({ message: "Error fetching admin jobs", error: err.message });
// // //     }
// // // };

// // // // 3. إضافة وظيفة جديدة
// // // exports.createJob = async (req, res) => {
// // //     try {
// // //         const { titleAr, titleEn, typeAr, typeEn } = req.body;
// // //         const newJob = new Job({
// // //             title: { ar: titleAr, en: titleEn },
// // //             type: { ar: typeAr, en: typeEn },
// // //             isActive: true
// // //         });
// // //         await newJob.save();
// // //         res.status(201).json(newJob);
// // //     } catch (err) {
// // //         res.status(500).json({ message: "Error creating job", error: err.message });
// // //     }
// // // };

// // // // 4. حذف وظيفة
// // // exports.deleteJob = async (req, res) => {
// // //     try {
// // //         await Job.findByIdAndDelete(req.params.id);
// // //         res.json({ message: "Job deleted successfully" });
// // //     } catch (err) {
// // //         res.status(500).json({ message: "Error deleting job", error: err.message });
// // //     }
// // // };

// // // // 5. إعادة تفعيل وظيفة
// // // exports.activateJob = async (req, res) => {
// // //     try {
// // //         await Job.findByIdAndUpdate(req.params.id, { isActive: true });
// // //         res.json({ message: "Job activated successfully" });
// // //     } catch (err) {
// // //         res.status(500).json({ message: "Error activating job", error: err.message });
// // //     }
// // // };

// // // // 6. تقديم طلب توظيف
// // // exports.applyJob = async (req, res) => {
// // //     try {
// // //         const { jobId, applicantName, applicantEmail, phone, nationality, education, age, startDate, workedBefore, previousJobs, previousTitle } = req.body;

// // //         // استخراج روابط الملفات من multer
// // //         const resume = req.files['resume'] ? `${req.protocol}://${req.get('host')}/uploads/${req.files['resume'][0].filename}` : null;
// // //         const experienceCertificate = req.files['experienceCertificate'] ? `${req.protocol}://${req.get('host')}/uploads/${req.files['experienceCertificate'][0].filename}` : null;

// // //         const newApplication = new Application({
// // //             jobId,
// // //             applicantName,
// // //             applicantEmail,
// // //             phone,
// // //             nationality,
// // //             education,
// // //             age,
// // //             startDate,
// // //             workedBefore,
// // //             previousJobs,
// // //             previousTitle,
// // //             resume,
// // //             experienceCertificate
// // //         });

// // //         await newApplication.save();
// // //         res.status(201).json({ message: "Application submitted successfully" });
// // //     } catch (err) {
// // //         res.status(500).json({ message: "Error submitting application", error: err.message });
// // //     }
// // // };

// // const Job = require("../models/Job");
// // const Application = require("../models/Application");

// // // 1. جلب الوظائف
// // exports.getJobs = async (req, res) => {
// //     try {
// //         const jobs = await Job.find();
// //         res.status(200).json(jobs);
// //     } catch (err) {
// //         res.status(500).json({ error: err.message });
// //     }
// // };

// // // 2. تقديم طلب توظيف مع فحص الحظر (بدون مودل مستقل)
// // exports.applyJob = async (req, res) => {
// //     try {
// //         const { applicantEmail } = req.body;

// //         // فحص إذا كان الإيميل قد تم حظره مسبقاً في جدول الطلبات
// //         const blockedUser = await Application.findOne({ applicantEmail, isBlocked: true });
// //         if (blockedUser) {
// //             return res.status(403).json({ message: "هذا البريد الإلكتروني محظور من التقديم." });
// //         }

// //         const resume = req.files['resume'] ? `/uploads/${req.files['resume'][0].filename}` : null;
// //         const experienceCertificate = req.files['experienceCertificate'] ? `/uploads/${req.files['experienceCertificate'][0].filename}` : null;

// //         const newApplication = new Application({
// //             ...req.body,
// //             resume,
// //             experienceCertificate,
// //             isBlocked: false // القيمة الافتراضية
// //         });

// //         await newApplication.save();
// //         res.status(201).json({ message: "تم تقديم الطلب بنجاح" });
// //     } catch (err) {
// //         res.status(500).json({ error: err.message });
// //     }
// // };

// // // 3. حظر إيميل (تحديث كل طلبات هذا الإيميل لتصبح محظورة)
// // exports.addToBlacklist = async (req, res) => {
// //     try {
// //         const { email } = req.body;
// //         if (!email) return res.status(400).json({ message: "Email is required" });

// //         // تحديث كل الطلبات التي تحمل هذا الإيميل وجعلها محظورة
// //         await Application.updateMany({ applicantEmail: email }, { isBlocked: true });
        
// //         res.status(200).json({ message: "تم حظر الإيميل بنجاح في جميع الطلبات" });
// //     } catch (err) {
// //         res.status(500).json({ error: err.message });
// //     }
// // };

// // // 4. جلب المتقدمين
// // exports.getApplicationsByJob = async (req, res) => {
// //     try {
// //         const applications = await Application.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });
// //         res.status(200).json(applications);
// //     } catch (err) {
// //         res.status(500).json({ error: err.message });
// //     }
// // };

// // // 5. حذف وظيفة
// // exports.deleteJob = async (req, res) => {
// //     try {
// //         await Job.findByIdAndDelete(req.params.id);
// //         res.status(200).json({ message: "تم حذف الوظيفة" });
// //     } catch (err) {
// //         res.status(500).json({ error: err.message });
// //     }
// // };


// const Job = require("../models/Job");
// const Application = require("../models/Application");

// // جلب كل الوظائف
// exports.getJobs = async (req, res) => {
//     try {
//         const jobs = await Job.find(); // نأخذ كل الوظائف
//         res.status(200).json(jobs);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // جلب المتقدمين لوظيفة معينة (هنا الربط المهم)
// exports.getApplicationsByJob = async (req, res) => {
//     try {
//         const { jobId } = req.params;
//         // بنجيب المتقدمين وبنرتبهم من الأحدث للأقدم
//         const applications = await Application.find({ jobId }).sort({ createdAt: -1 });
        
//         // تأكد إن الروابط (resume, experienceCertificate) بتضل زي ما هي (URL كلاوديناري)
//         res.status(200).json(applications);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // إضافة وظيفة جديدة
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

// // حذف وظيفة
// exports.deleteJob = async (req, res) => {
//     try {
//         await Job.findByIdAndDelete(req.params.id);
//         res.status(200).json({ message: "Job deleted" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// const Job = require("../models/Job");
// const Application = require("../models/Application");

// // 1. جلب الوظائف (الأدمن يشوف الكل، واليوزر يشوف بس الـ isActive: true)
// exports.getJobs = async (req, res) => {
//     try {
//         const { admin } = req.query; // بنبعث من الفرونت إند ?admin=true للأدمن
//         const query = admin === 'true' ? {} : { isActive: true };
//         const jobs = await Job.find(query).sort({ createdAt: -1 });
//         res.status(200).json(jobs);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // 2. جلب المتقدمين لوظيفة معينة (الروابط بتضل URLs من كلاوديناري)
// exports.getApplicationsByJob = async (req, res) => {
//     try {
//         const { jobId } = req.params;
//         // بنجيب المتقدمين وبنرتبهم من الأحدث للأقدم
//         const applications = await Application.find({ jobId }).sort({ createdAt: -1 });
//         res.status(200).json(applications);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // 3. إضافة وظيفة جديدة (تأكد إن isActive بتبدأ true)
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

// // 4. إخفاء / إظهار الوظيفة (بدل الحذف النهائي عشان المتقدمين ما يروحوا)
// exports.toggleJobStatus = async (req, res) => {
//     try {
//         const job = await Job.findById(req.params.id);
//         if (!job) return res.status(404).json({ message: "Job not found" });
        
//         job.isActive = !job.isActive; // عكس الحالة الحالية
//         await job.save();
        
//         res.status(200).json({ 
//             message: job.isActive ? "تم إظهار الوظيفة" : "تم إخفاء الوظيفة", 
//             isActive: job.isActive 
//         });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // 5. حذف وظيفة نهائياً (فقط للحالات الضرورية)
// exports.deleteJob = async (req, res) => {
//     try {
//         await Job.findByIdAndDelete(req.params.id);
//         res.status(200).json({ message: "تم حذف الوظيفة نهائياً" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };


  const Job = require("../models/Job");
  const Application = require("../models/Application");
  const Blacklist = require("../models/Blacklist");

  // 1. جلب الوظائف (أدمن + يوزر)
  exports.getJobs = async (req, res) => {
      try {
          const { admin } = req.query; 
          const query = admin === 'true' ? {} : { isActive: true };
          const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();
          
          if (admin === 'true') {
              for (let job of jobs) {
                  job.applicationCount = await Application.countDocuments({ jobId: job._id });
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
          const applications = await Application.find({ jobId }).sort({ createdAt: -1 }).lean();

          const updatedApplications = await Promise.all(applications.map(async (app) => {
              const isBlacklisted = await Blacklist.findOne({ email: app.applicantEmail });
              return { ...app, isBlacklisted: !!isBlacklisted };
          }));

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
    console.log("🚀 DATA RECEIVED FROM FRONTEND:", JSON.stringify(req.body, null, 2));
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
                en: genderEn || "Not Specified" 
            },
            isActive: true
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
              isActive: job.isActive 
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
              return res.status(200).json({ message: "تم فك الحظر", isBlacklisted: false });
          } else {
              const newBlacklist = new Blacklist({ email });
              await newBlacklist.save();
              return res.status(200).json({ message: "تم الحظر بنجاح", isBlacklisted: true });
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
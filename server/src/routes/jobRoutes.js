// // // // // // const express = require("express");
// // // // // // const router = express.Router();
// // // // // // const jobController = require("../controller/jobController");

// // // // // // router.post("/", jobController.createJob);
// // // // // // router.get("/", jobController.getJobs);
// // // // // // router.get("/applications/:jobId", jobController.getApplicationsForJob);
// // // // // // router.delete("/:jobId", jobController.deleteJob);

// // // // // // module.exports = router;

// // // // // // const express = require("express");
// // // // // // const router = express.Router();
// // // // // // const multer = require("multer");
// // // // // // const jobController = require("../controller/jobController");
// // // // // // const Application = require("../models/Application");

// // // // // // // إعداد التخزين السريع للملفات هون مباشرة
// // // // // // const storage = multer.diskStorage({
// // // // // //     destination: (req, file, cb) => cb(null, "uploads/"),
// // // // // //     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
// // // // // // });
// // // // // // const upload = multer({ storage });

// // // // // // // --- 1. روابط الأدمن (Admin) ---
// // // // // // // جلب الكل
// // // // // // router.get("/admin/all", jobController.getAllJobsAdmin);

// // // // // // // إعادة تفعيل وظيفة
// // // // // // router.put("/activate/:id", jobController.activateJob);

// // // // // // // جلب المتقدمين
// // // // // // router.get("/applications/:jobId", async (req, res) => {
// // // // // //     try {
// // // // // //         const apps = await Application.find({ jobId: req.params.jobId });
// // // // // //         res.json(apps);
// // // // // //     } catch (err) { res.status(500).json(err); }
// // // // // // });

// // // // // // // حظر مستخدم
// // // // // // router.put("/applications/:id/status", async (req, res) => {
// // // // // //     try {
// // // // // //         await Application.findByIdAndUpdate(req.params.id, { isBlacklisted: req.body.isBlacklisted });
// // // // // //         res.json({ message: "updated" });
// // // // // //     } catch (err) { res.status(500).json(err); }
// // // // // // });

// // // // // // // --- 2. روابط المستخدم (Public) ---
// // // // // // router.get("/", jobController.getJobs);
// // // // // // router.post("/", jobController.createJob);
// // // // // // router.delete("/:id", jobController.deleteJob);

// // // // // // // التقديم مع رفع الملفات
// // // // // // router.post("/apply", upload.fields([
// // // // // //     { name: 'resume', maxCount: 1 },
// // // // // //     { name: 'experienceCertificate', maxCount: 1 }
// // // // // // ]), jobController.applyJob);


// // // // // // module.exports = router;

// // // // // const express = require("express");
// // // // // const router = express.Router();
// // // // // const multer = require("multer");
// // // // // const mongoose = require("mongoose");
// // // // // const jobController = require("../controller/jobController");
// // // // // const Application = require("../models/Application");

// // // // // // --- 1. تعريف موديل القائمة السوداء (Blacklist Model) ---
// // // // // const Blacklist = mongoose.models.Blacklist || mongoose.model('Blacklist', new mongoose.Schema({
// // // // //     email: { type: String, required: true, unique: true },
// // // // //     createdAt: { type: Date, default: Date.now }
// // // // // }));

// // // // // // --- 2. إعداد التخزين للملفات (Multer) ---
// // // // // const storage = multer.diskStorage({
// // // // //     destination: (req, file, cb) => cb(null, "uploads/"),
// // // // //     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
// // // // // });
// // // // // const upload = multer({ storage });

// // // // // // --- 3. روابط الأدمن (Admin) ---

// // // // // // راوت إضافة إيميل للقائمة السوداء (الذي كان يعطيك Cannot POST)
// // // // // router.post("/blacklist", async (req, res) => {
// // // // //     try {
// // // // //         const { email } = req.body;
// // // // //         if (!email) return res.status(400).json({ message: "الإيميل مطلوب" });

// // // // //         const exists = await Blacklist.findOne({ email });
// // // // //         if (!exists) {
// // // // //             await Blacklist.create({ email });
// // // // //         }
// // // // //         res.json({ message: "تم إضافة الإيميل للقائمة السوداء بنجاح" });
// // // // //     } catch (err) {
// // // // //         res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
// // // // //     }
// // // // // });

// // // // // // جلب الكل للأدمن
// // // // // // تأكد أن هذه الدالة موجودة في الكنترولر باسم getAllJobsAdmin
// // // // // router.get("/admin/all", jobController.getAllJobsAdmin || ((req, res) => res.status(500).send("Function getAllJobsAdmin missing in Controller")));

// // // // // // إعادة تفعيل وظيفة
// // // // // router.put("/activate/:id", jobController.activateJob || ((req, res) => res.status(500).send("Function activateJob missing in Controller")));

// // // // // // جلب المتقدمين لوظيفة
// // // // // router.get("/applications/:jobId", async (req, res) => {
// // // // //     try {
// // // // //         const apps = await Application.find({ jobId: req.params.jobId });
// // // // //         res.json(apps);
// // // // //     } catch (err) { 
// // // // //         res.status(500).json({ error: err.message }); 
// // // // //     }
// // // // // });

// // // // // router.post("/blacklist", async (req, res) => {
// // // // //     try {
// // // // //         const { email } = req.body;
// // // // //         if (!email) return res.status(400).json({ message: "Email is required" });

// // // // //         const exists = await Blacklist.findOne({ email });
// // // // //         if (!exists) {
// // // // //             await Blacklist.create({ email });
// // // // //         }
// // // // //         res.status(200).json({ message: "Success" });
// // // // //     } catch (err) {
// // // // //         res.status(500).json({ error: err.message });
// // // // //     }
// // // // // });

// // // // // // تحديث حالة الحظر في الطلب نفسه
// // // // // router.put("/applications/:id/status", async (req, res) => {
// // // // //     try {
// // // // //         const updatedApp = await Application.findByIdAndUpdate(
// // // // //             req.params.id, 
// // // // //             { isBlacklisted: req.body.isBlacklisted },
// // // // //             { new: true }
// // // // //         );
// // // // //         res.json({ message: "updated", data: updatedApp });
// // // // //     } catch (err) { 
// // // // //         res.status(500).json({ error: err.message }); 
// // // // //     }
// // // // // });

// // // // // // --- 4. روابط المستخدم (Public) ---

// // // // // // جلب الوظائف النشطة
// // // // // router.get("/", jobController.getJobs || ((req, res) => res.status(500).send("Function getJobs missing in Controller")));

// // // // // // إضافة وظيفة جديدة
// // // // // router.post("/", jobController.createJob || ((req, res) => res.status(500).send("Function createJob missing in Controller")));

// // // // // // حذف وظيفة
// // // // // router.delete("/:id", jobController.deleteJob || ((req, res) => res.status(500).send("Function deleteJob missing in Controller")));

// // // // // // التقديم مع رفع الملفات وفحص البلاك ليست
// // // // // router.post("/apply", upload.fields([
// // // // //     { name: 'resume', maxCount: 1 },
// // // // //     { name: 'experienceCertificate', maxCount: 1 }
// // // // // ]), async (req, res, next) => {
// // // // //     try {
// // // // //         // فحص سريع قبل استدعاء الكنترولر: هل الإيميل محظور؟
// // // // //         const { applicantEmail } = req.body;
// // // // //         const isBlocked = await Blacklist.findOne({ email: applicantEmail });
        
// // // // //         if (isBlocked) {
// // // // //             return res.status(403).json({ message: "عذراً، هذا البريد الإلكتروني محظور من التقديم." });
// // // // //         }
        
// // // // //         // إذا لم يكن محظوراً، نمرر التنفيذ للكنترولر
// // // // //         return jobController.applyJob(req, res, next);
// // // // //     } catch (err) {
// // // // //         res.status(500).json({ error: err.message });
// // // // //     }
// // // // // });

// // // // // module.exports = router;


// // // // const express = require("express");
// // // // const router = express.Router();
// // // // const jobController = require("../controller/jobController");
// // // // // تأكد جداً من مسار الـ applicationController
// // // // const applicationController = require("../controller/applicationController");
// // // // const multer = require("multer");

// // // // // بما أنك شغال Cloudinary
// // // // const storage = multer.memoryStorage();
// // // // const upload = multer({ storage });

// // // // // --- Jobs Routes ---
// // // // router.get("/", jobController.getJobs);
// // // // router.post("/", jobController.createJob); // كانت المشكلة هون غالباً (تأكد الاسم createJob)
// // // // router.delete("/:id", jobController.deleteJob);

// // // // // --- Application Routes ---
// // // // // تأكد إن دالة applyJob موجودة في ملف applicationController
// // // // router.post(
// // // //   "/apply",
// // // //   upload.fields([
// // // //     { name: "resume", maxCount: 1 },
// // // //     { name: "experienceCertificate", maxCount: 1 },
// // // //   ]),
// // // //   applicationController.applyJob || ((req, res) => res.send("دالة applyJob غير معرفة"))
// // // // );

// // // // // جلب المتقدمين
// // // // router.get("/applications/:jobId", jobController.getApplicationsByJob);

// // // // // حظر الإيميل - تأكد إن اسمها addToBlacklist في الكنترولر الثاني
// // // // router.post("/blacklist", applicationController.addToBlacklist || ((req, res) => res.send("دالة addToBlacklist غير معرفة")));

// // // // module.exports = router;

// // // const express = require("express");
// // // const router = express.Router();
// // // const jobController = require("../controller/jobController");
// // // const applicationController = require("../controller/applicationController");
// // // const multer = require("multer");

// // // // إعداد ملتر في الذاكرة لرفع كلاوديناري
// // // const storage = multer.memoryStorage();
// // // const upload = multer({ storage });

// // // // --- روابط الوظائف (Jobs) ---

// // // // جلب الوظائف (الأدمن ببعث ?admin=true عشان يشوف المخفي)
// // // router.get("/", jobController.getJobs);

// // // // إضافة وظيفة جديدة
// // // router.post("/", jobController.createJob);

// // // // تعديل حالة الوظيفة (إخفاء/إظهار) بدل الحذف النهائي
// // // router.patch("/toggle-status/:id", jobController.toggleJobStatus);

// // // // إذا لسا بدك خيار الحذف النهائي موجود للمسح الشامل
// // // router.delete("/:id", jobController.deleteJob);


// // // // --- روابط التقديم (Application) ---

// // // router.post(
// // //   "/apply",
// // //   upload.fields([
// // //     { name: "resume", maxCount: 1 },
// // //     { name: "experienceCertificate", maxCount: 1 },
// // //   ]),
// // //   applicationController.applyJob
// // // );

// // // // جلب المتقدمين لوظيفة معينة
// // // router.get("/applications/:jobId", jobController.getApplicationsByJob);


// // // // --- روابط الحظر (Blacklist) ---

// // // // تبديل حالة الحظر (حظر / فك حظر) بنفس الراوت
// // // router.post("/blacklist-toggle", applicationController.toggleBlacklist);

// // // module.exports = router;

// // const express = require("express");
// // const router = express.Router();
// // const jobController = require("../controller/jobController");
// // const applicationController = require("../controller/applicationController");
// // const multer = require("multer");

// // const upload = multer({ storage: multer.memoryStorage() });

// // // --- Jobs ---
// // router.get("/", jobController.getJobs);
// // router.post("/", jobController.createJob);
// // router.patch("/toggle-status/:id", jobController.toggleJobStatus); // إخفاء وإظهار
// // router.delete("/:id", jobController.deleteJob); // حذف نهائي

// // // --- Application ---
// // router.post("/apply", upload.fields([{ name: "resume" }, { name: "experienceCertificate" }]), applicationController.applyJob);
// // router.get("/applications/:jobId", jobController.getApplicationsByJob);

// // // --- Blacklist ---
// // router.post("/blacklist-toggle", applicationController.toggleBlacklist); // حظر وفك حظر

// // module.exports = router;

// // const express = require("express");
// // const router = express.Router();
// // const jobController = require("../controller/jobController");
// // const applicationController = require("../controller/applicationController");
// // const multer = require("multer");

// // // بما أنك ترفع لكلاوديناري
// // const storage = multer.memoryStorage();
// // const upload = multer({ storage });

// // // --- روابط الوظائف (Jobs) ---

// // // جلب الوظائف
// // router.get("/", jobController.getJobs);

// // // إضافة وظيفة جديدة
// // router.post("/", jobController.createJob);

// // // إخفاء/إظهار الوظيفة (تأكد من وجود الدالة في الكنترولر)
// // router.patch("/toggle-status/:id", jobController.toggleJobStatus || ((req, res) => res.status(500).send("دالة toggleJobStatus غير موجودة")));

// // // الحذف النهائي
// // router.delete("/:id", jobController.deleteJob);

// // // --- روابط التقديم (Application) ---

// // // التقديم (تأكد من اسم الدالة في applicationController)
// // router.post(
// //   "/apply",
// //   upload.fields([
// //     { name: "resume", maxCount: 1 },
// //     { name: "experienceCertificate", maxCount: 1 },
// //   ]),
// //   applicationController.applyJob || ((req, res) => res.status(500).send("دالة applyJob غير موجودة"))
// // );

// // // جلب المتقدمين لكل وظيفة
// // router.get("/applications/:jobId", jobController.getApplicationsByJob);

// // // --- روابط الحظر (Blacklist) ---

// // // حظر وفك حظر (تأكد من اسم الدالة في applicationController)
// // router.post("/blacklist-toggle", applicationController.toggleBlacklist || ((req, res) => res.status(500).send("دالة toggleBlacklist غير موجودة")));

// // module.exports = router;


// const express = require("express");
// const router = express.Router();
// const jobController = require("../controller/jobController");
// const applicationController = require("../controller/applicationController");
// const multer = require("multer");

// // إعداد multer للرفع المؤقت في الذاكرة
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // --- روابط الوظائف (Jobs) ---

// // جلب الوظائف (لليوزر والأدمن)
// router.get("/", jobController.getJobs);

// // إضافة وظيفة جديدة
// router.post("/", jobController.createJob);

// // إخفاء/إظهار الوظيفة
// router.patch("/toggle-status/:id", jobController.toggleJobStatus);

// // الحذف النهائي للوظيفة
// router.delete("/:id", jobController.deleteJob);

// // --- روابط المتقدمين والحظر (كلها من jobController الآن) ---

// // جلب المتقدمين لكل وظيفة
// router.get("/applications/:jobId", jobController.getApplicationsByJob);

// // حظر وفك حظر الإيميل (تأكدنا إنها في jobController)
// router.post("/blacklist-toggle", jobController.toggleBlacklist);

// // --- روابط التقديم (Application) ---

// // التقديم للوظيفة (من قبل المستخدمين)
// router.post(
//   "/apply",
//   upload.fields([
//     { name: "resume", maxCount: 1 },
//     { name: "experienceCertificate", maxCount: 1 },
//   ]),
//   applicationController.applyJob
// );

// // routes/jobRoutes.js

// // تحديث حالة الطلب (مثلاً لـ seen)
// router.patch('/application-status/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     // تحديث الطلب في قاعدة البيانات
//     const updatedApplication = await Application.findByIdAndUpdate(
//       id,
//       { status: status },
//       { new: true }
//     );

//     if (!updatedApplication) {
//       return res.status(404).json({ message: "الطلب غير موجود" });
//     }

//     res.json(updatedApplication);
//   } catch (error) {
//     res.status(500).json({ message: "خطأ في السيرفر", error });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const jobController = require("../controller/jobController");
const applicationController = require("../controller/applicationController");
const multer = require("multer");
// --- مهم جداً: استدعاء موديل الطلبات عشان يشتغل الـ Patch ---
const Application = require("../models/Application"); 

const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- روابط الوظائف (Jobs) ---
router.get("/", jobController.getJobs);
router.post("/", jobController.createJob);  
router.patch("/toggle-status/:id", jobController.toggleJobStatus);
router.delete("/:id", jobController.deleteJob);

// --- روابط المتقدمين والحظر ---
router.get("/applications/:jobId", jobController.getApplicationsByJob);
router.post("/blacklist-toggle", jobController.toggleBlacklist);

// --- ميزة الـ Seen (تغيير حالة الطلب) ---
router.patch('/application-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedApplication = await Application.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ message: "الطلب غير موجود" });
        }

        res.json(updatedApplication);
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
});

// --- روابط التقديم ---
router.post(
  "/apply",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "experienceCertificate", maxCount: 1 },
  ]),
  applicationController.applyJob
);

module.exports = router;
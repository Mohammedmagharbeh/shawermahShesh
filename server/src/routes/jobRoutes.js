

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
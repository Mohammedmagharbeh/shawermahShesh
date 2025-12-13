const express = require("express");
const router = express.Router();
const applicationController = require("../controller/applicationController");
const multer = require("multer");

// إعداد التخزين للملفات
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// فلترة الملفات PDF و Word
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("الملف يجب أن يكون PDF أو Word"));
  }
};

const upload = multer({ storage, fileFilter });

router.post(
  "/",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "experienceCertificate", maxCount: 1 },
  ]),
  applicationController.applyJob
);

module.exports = router;

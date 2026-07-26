// const express = require("express");
// const router = express.Router();
// const applicationController = require("../controller/applicationController");
// const multer = require("multer");

// // فلترة الملفات PDF و Word
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   ];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("الملف يجب أن يكون PDF أو Word"));
//   }
// };

// // تخزين الملفات في الذاكرة (Buffer) بدون حفظها على القرص
// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter,
// });

// // نتوقع حقول ملفات بأسماء resume و experienceCertificate (اختيارية)
// router.post(
//   "/",
//   upload.fields([
//     { name: "resume", maxCount: 1 },
//     { name: "experienceCertificate", maxCount: 1 },
//   ]),
//   applicationController.applyJob
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const applicationController = require("../controller/applicationController");
const multer = require("multer");

// ✅ فلترة الملفات — PDF فقط (شيلنا Word بناءً على الطلب، وما رح نطلب صورة شخصية)
const documentFileFilter = (req, file, cb) => {
  const allowedDocTypes = ["application/pdf"];
  if (allowedDocTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("الملف يجب أن يكون PDF فقط"));
  }
};

// تخزين الملفات في الذاكرة (Buffer) بدون حفظها على القرص
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: documentFileFilter,
});

// نتوقع حقول ملفات بأسماء resume و experienceCertificate
router.post(
  "/",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "experienceCertificate", maxCount: 1 },
  ]),
  applicationController.applyJob
);

module.exports = router;
// const Application = require("../models/Application");
// const { cloudinary } = require("../config/cloudinary");

// exports.applyJob = async (req, res) => {
//   try {
//     const body = req.body;

//     const resumeFile = req.files?.resume ? req.files.resume[0] : null;
//     const experienceFile = req.files?.experienceCertificate
//       ? req.files.experienceCertificate[0]
//       : null;

//     let uploadedResumeUrl = "";
//     let uploadedExperienceCertificateUrl = "";

//     // helper لرفع ملف من buffer إلى Cloudinary بدون تخزينه في مجلد uploads
//     const uploadBufferToCloudinary = (buffer, filename) => {
//       return new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           {
//             folder: "documents",
//             public_id: filename,
//             resource_type: "raw",
//           },
//           (error, result) => {
//             if (error) return reject(error);
//             resolve(result);
//           }
//         );

//         uploadStream.end(buffer);
//       });
//     };

//     // ارفع السيرة الذاتية إذا كانت موجودة
//     if (resumeFile) {
//       const uploadedResume = await uploadBufferToCloudinary(
//         resumeFile.buffer,
//         resumeFile.originalname
//       );
//       uploadedResumeUrl = uploadedResume.secure_url;
//     }

//     // ارفع شهادة الخبرة إذا كانت موجودة
//     if (experienceFile) {
//       const uploadedExperienceCertificate = await uploadBufferToCloudinary(
//         experienceFile.buffer,
//         experienceFile.originalname
//       );
//       uploadedExperienceCertificateUrl =
//         uploadedExperienceCertificate.secure_url;
//     }

//     const application = new Application({
//       resume: uploadedResumeUrl,
//       experienceCertificate: uploadedExperienceCertificateUrl,
//       ...body,
//     });

//     await application.save();
//     res.status(200).json(application);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const Application = require("../models/Application");
const { cloudinary } = require("../config/cloudinary");

// ✅ الحقول النصية المطلوبة من كل متقدم (بغض النظر عن الفرونت — تحقق سيرفر-سايد)
const REQUIRED_TEXT_FIELDS = [
  "applicantName",
  "applicantEmail",
  "phone",
  "nationality",
  "education",
  "age",
  "startDate",
  "jobId",
];

exports.applyJob = async (req, res) => {
  try {
    const body = req.body;

    // ---------- 1) تحقق من الحقول النصية المطلوبة ----------
    const missingField = REQUIRED_TEXT_FIELDS.find((field) => !body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: "الرجاء تعبئة جميع الحقول المطلوبة" });
    }

    // إذا اختار المتقدم إنه اشتغل قبل، صار previousJobs و previousTitle مطلوبين
    if (
      body.workedBefore === "yes" &&
      (!body.previousJobs || !body.previousTitle)
    ) {
      return res
        .status(400)
        .json({ message: "الرجاء تعبئة تفاصيل الخبرة السابقة" });
    }

    const resumeFile = req.files?.resume ? req.files.resume[0] : null;
    const experienceFile = req.files?.experienceCertificate
      ? req.files.experienceCertificate[0]
      : null;

    // ---------- 2) تحقق من وجود الملفات المطلوبة ----------
    if (!resumeFile || !experienceFile) {
      return res.status(400).json({
        message: "الرجاء إرفاق السيرة الذاتية وشهادة الخبرة",
      });
    }

    // ---------- 3) تحقق: هل نفس الإيميل قدّم لنفس الوظيفة من قبل؟ ----------
    // ✅ نطبّع الإيميل (lowercase + trim) عشان "Test@Mail.com" و"test@mail.com "
    // ما يتحسبوا إيميلات مختلفة ويتفلتوا من الفحص
    const normalizedEmail = body.applicantEmail.trim().toLowerCase();
    const existingApplication = await Application.findOne({
      jobId: body.jobId,
      applicantEmail: { $regex: `^${normalizedEmail}$`, $options: "i" },
    });
    if (existingApplication) {
      return res.status(409).json({
        message: "لقد تقدمت لهذه الوظيفة من قبل بنفس البريد الإلكتروني",
      });
    }

    let uploadedResumeUrl = "";
    let uploadedExperienceCertificateUrl = "";

    // helper لرفع ملف من buffer إلى Cloudinary بدون تخزينه في مجلد uploads
    const uploadBufferToCloudinary = (buffer, filename, resourceType = "raw") => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "documents",
            public_id: filename,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        uploadStream.end(buffer);
      });
    };

    // ارفع السيرة الذاتية
    const uploadedResume = await uploadBufferToCloudinary(
      resumeFile.buffer,
      resumeFile.originalname,
      "raw"
    );
    uploadedResumeUrl = uploadedResume.secure_url;

    // ارفع شهادة الخبرة
    const uploadedExperienceCertificate = await uploadBufferToCloudinary(
      experienceFile.buffer,
      experienceFile.originalname,
      "raw"
    );
    uploadedExperienceCertificateUrl = uploadedExperienceCertificate.secure_url;

    const application = new Application({
      ...body,
      applicantEmail: normalizedEmail,
      resume: uploadedResumeUrl,
      experienceCertificate: uploadedExperienceCertificateUrl,
    });

    await application.save();
    res.status(200).json(application);
  } catch (err) {
    console.error("applyJob error:", err);
    res.status(500).json({ error: err.message });
  }
};
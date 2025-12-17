const Application = require("../models/Application");
const { cloudinary } = require("../config/cloudinary");

exports.applyJob = async (req, res) => {
  try {
    const body = req.body;

    const resumeFile = req.files?.resume ? req.files.resume[0] : null;
    const experienceFile = req.files?.experienceCertificate
      ? req.files.experienceCertificate[0]
      : null;

    let uploadedResumeUrl = "";
    let uploadedExperienceCertificateUrl = "";

    // helper لرفع ملف من buffer إلى Cloudinary بدون تخزينه في مجلد uploads
    const uploadBufferToCloudinary = (buffer, filename) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "documents",
            public_id: filename,
            resource_type: "raw",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        uploadStream.end(buffer);
      });
    };

    // ارفع السيرة الذاتية إذا كانت موجودة
    if (resumeFile) {
      const uploadedResume = await uploadBufferToCloudinary(
        resumeFile.buffer,
        resumeFile.originalname
      );
      uploadedResumeUrl = uploadedResume.secure_url;
    }

    // ارفع شهادة الخبرة إذا كانت موجودة
    if (experienceFile) {
      const uploadedExperienceCertificate = await uploadBufferToCloudinary(
        experienceFile.buffer,
        experienceFile.originalname
      );
      uploadedExperienceCertificateUrl =
        uploadedExperienceCertificate.secure_url;
    }

    const application = new Application({
      resume: uploadedResumeUrl,
      experienceCertificate: uploadedExperienceCertificateUrl,
      ...body,
    });

    await application.save();
    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

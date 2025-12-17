const Application = require("../models/Application");
const { cloudinary } = require("../config/cloudinary");

exports.applyJob = async (req, res) => {
  try {
    const body = req.body;

    const resume = req.files?.resume ? req.files.resume[0].path : "";
    const experienceCertificate = req.files?.experienceCertificate
      ? req.files.experienceCertificate[0].path
      : "";

    const uploadedResume = await cloudinary.uploader.upload(resume, {
      folder: "documents",
      resource_type: "raw", // REQUIRED for non-image/video files
    });

    const uploadedExperienceCertificate = await cloudinary.uploader.upload(
      experienceCertificate,
      {
        folder: "documents",
        resource_type: "raw",
      }
    );

    const application = new Application({
      resume: uploadedResume.secure_url,
      experienceCertificate: uploadedExperienceCertificate.secure_url,
      ...body,
    });

    await application.save();
    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

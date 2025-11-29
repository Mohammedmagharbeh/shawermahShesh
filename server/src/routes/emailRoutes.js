
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

// POST /api/email/send-email
router.post("/send-email", async (req, res) => {
  const { from_email, subject, message } = req.body;

  if (!from_email || !subject || !message) {
    return res.status(400).json({ message: "يرجى ملء جميع الحقول." });
  }

  try {
    // إعداد SMTP
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true, // true للبورت 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // إرسال الإيميل
    await transporter.sendMail({
from: "website@shawermasheesh.com.jo",
      to: process.env.EMAIL_USER, // تصل للصفحة أو للادمن
      replyTo: from_email,        // الرد يكون للمستخدم مباشرة
      subject,
      text: message,
    });

    res.status(200).json({ message: "تم الإرسال بنجاح ✅" });
  } catch (err) {
    console.error("SMTP Email error:", err);
    res.status(500).json({ message: "فشل الإرسال ❌", error: err.message });
  }
});

module.exports = router;

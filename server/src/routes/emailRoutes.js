// const express = require("express");
// const router = express.Router();
// require("dotenv").config();
// const { Resend } = require("resend");

// const resend = new Resend(process.env.RESEND_API_KEY);

// router.post("/send-email", async (req, res) => {
//   const { from_email, subject, message } = req.body;

//   try {
//     const response = await resend.emails.send({
//       from: "Website <onboarding@resend.dev>", // ✅ Resend-approved sender
//       to: "ahmadjkff1@gmail.com",
//       reply_to: from_email, // ✅ User email goes here
//       subject: subject,
//       html: `<p>${message}</p>`,
//     });

//     console.log("Resend response:", response);

//     res.status(200).json({ message: "تم الإرسال بنجاح" });
//   } catch (error) {
//     console.error("Resend error:", error);
//     res.status(500).json({ message: "فشل الإرسال", error });
//   }
// });

// module.exports = router;

const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// إعداد Cloudinary
cloudinary.config({
  cloud_name: "dzdz0jtqt",   // ضع هنا اسم الحساب الصحيح
  api_key: "223227917599951",
  api_secret: "JlIV5qtKZvRqsu4G8V54U8vjEHg",
  secure: true
});

// مجلد الصور
const imagesFolder = path.join(__dirname, "images");

// قراءة كل الصور في المجلد ورفعها
fs.readdir(imagesFolder, async (err, files) => {
  if (err) return console.error("خطأ في قراءة المجلد:", err);

  for (const file of files) {
    const filePath = path.join(imagesFolder, file);

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "my_images" // اختياري: اسم مجلد في Cloudinary
      });
      console.log(`تم رفع ${file} بنجاح`);
      console.log("رابط الصورة:", result.secure_url);

      // هنا تحط الكود لحفظ الرابط في MongoDB
      // مثلاً: await MyMongoCollection.insertOne({ name: file, url: result.secure_url });

    } catch (err) {
      console.error(`خطأ في رفع ${file}:`, err);
    }
  }
});   
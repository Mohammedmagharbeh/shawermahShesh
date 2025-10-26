const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dzdz0jtqt",   // الكلاود نيم عندك
  api_key: "223227917599951",
  api_secret: "JlIV5qtKZvRqsu4G8V54U8vjEHg",
  secure: true
});

module.exports = cloudinary;

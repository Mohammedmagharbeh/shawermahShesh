const Slide = require("../models/Slide"); // تأكد من المسار

// إحضار كل السلايدات
const getSlides = async (req, res) => {
  try {
    const relatedTo = req.query.relatedTo;
    const filter = relatedTo ? { relatedTo } : {};
    const slides = await Slide.find(filter).lean();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إنشاء سلايد جديد
const createSlide = async (req, res) => {
  try {
    const { image, title, subtitle, relatedTo } = req.body;

    const newSlide = new Slide({ image, title, subtitle, relatedTo });
    await newSlide.save();
    res.status(201).json(newSlide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تعديل سلايد
const updateSlide = async (req, res) => {
  try {
    const updated = await Slide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف سلايد
const deleteSlide = async (req, res) => {
  try {
    await Slide.findByIdAndDelete(req.params.id);
    res.json({ message: "Slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSlides, createSlide, updateSlide, deleteSlide };

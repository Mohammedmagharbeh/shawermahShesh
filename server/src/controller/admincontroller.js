const { CATEGORIES } = require("../constants");
const products = require("../models/products");

// for post
exports.postEat = async (req, res) => {
  try {
    const { name, price, category, image, description } = req.body;
    if (!name || !price || !category || !image || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const creatfood = await products.create({
      name: name,
      price: price,
      category: category,
      image: image,
      description: description,
    });
    res.status(200).json(creatfood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// for update
exports.updatedfood = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const newfood = await products.findByIdAndUpdate(id, body, { new: true });
    if (!newfood) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(newfood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// for delete
exports.deletefood = async (req, res) => {
  try {
    const id = req.params.id;
    const deletefofo = await products.findByIdAndDelete({ _id: id });
    if (!deletefofo) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(deletefofo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

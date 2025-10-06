const { CATEGORIES } = require("../constants");
const products = require("../models/products");

// for post
exports.postEat = async (req, res) => {
  try {
    const {
      arName,
      enName,
      price,
      category,
      image,
      arDescription,
      enDescription,
    } = req.body;
    if (
      !arName ||
      !enName ||
      !price ||
      !category ||
      !arDescription ||
      !enDescription
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const creatfood = await products.create({
      name: {
        ar: arName,
        en: enName,
      },
      price: price,
      category: category,
      image: image,
      description: {
        ar: arDescription,
        en: enDescription,
      },
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

    const updatedData = {
      name: {
        ar: body.arName,
        en: body.enName,
      },
      description: {
        ar: body.arDescription,
        en: body.enDescription,
      },
      price: body.price,
      discount: body.discount,
      image: body.image,
      category: body.category,
    };

    const newfood = await products.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

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

const { CATEGORIES, AR_CATEGORIES, EN_CATEGORIES } = require("../constants");
const products = require("../models/products");

// for post
exports.postEat = async (req, res) => {
  try {
    const {
      arName,
      enName,
      price,
      category, // only send English category from frontend
      image,
      arDescription,
      enDescription,
      discount,
      isSpicy,
    } = req.body;

    // Validate required fields
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

    // Validate category
    const matchedCategory = CATEGORIES.find((c) => c.en === category);
    if (!matchedCategory) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Create product
    const createdFood = await products.create({
      name: { ar: arName, en: enName },
      price,
      discount: discount || 0,
      image: image || "",
      category: matchedCategory.en, // save only the English version
      description: { ar: arDescription, en: enDescription },
      isSpicy: isSpicy || false,
    });

    res.status(201).json(createdFood);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// for update
exports.updatedfood = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      arName,
      enName,
      arDescription,
      enDescription,
      price,
      discount,
      image,
      category,
      isSpicy,
    } = req.body;

    // Validate required fields
    if (
      !arName ||
      !enName ||
      !arDescription ||
      !enDescription ||
      !price ||
      !category
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Validate category
    const matchedCategory = CATEGORIES.find((c) => c.en === category);
    if (!matchedCategory) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Prepare updated data
    const updatedData = {
      name: { ar: arName, en: enName },
      description: { ar: arDescription, en: enDescription },
      price,
      discount: discount ?? 0,
      image: image || "",
      category: matchedCategory.en, // store only English version
      isSpicy: isSpicy ?? false,
    };

    // Update the product
    const updatedProduct = await products.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
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

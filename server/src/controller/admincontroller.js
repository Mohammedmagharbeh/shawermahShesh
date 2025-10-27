const { default: cloudinary } = require("../config/cloudinary");
const { CATEGORIES } = require("../constants");
const products = require("../models/products");

// for post
exports.postEat = async (req, res) => {
  try {
    const {
      name,
      description,
      basePrice,
      prices,
      category,
      image,
      discount,
      isSpicy,
      hasProteinChoices,
      hasTypeChoices,
    } = req.body;

    // Validate required fields
    if (
      !name?.ar ||
      !name?.en ||
      !description?.ar ||
      !description?.en ||
      !category
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate category
    const matchedCategory = CATEGORIES.find((c) => c.en === category);
    if (!matchedCategory) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Upload image if provided
    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create product
    const createdFood = await products.create({
      name,
      description,
      basePrice: basePrice || 0,
      prices: prices || {},
      discount: discount || 0,
      image: imageUrl,
      category: matchedCategory.en,
      isSpicy: isSpicy || false,
      hasProteinChoices: !!hasProteinChoices,
      hasTypeChoices: !!hasTypeChoices,
    });

    res.status(201).json({
      message: "Product created successfully",
      data: createdFood,
    });
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
      name,
      description,
      basePrice,
      prices,
      discount,
      image,
      category,
      isSpicy,
      hasTypeChoices,
      hasProteinChoices,
    } = req.body;

    // Validate required fields
    if (
      !name.ar ||
      !name.en ||
      !description.ar ||
      !description.en ||
      !basePrice ||
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

    let updateResponse = "";
    if (image)
      updateResponse = (await cloudinary.uploader.upload(image)).secure_url;

    // Prepare updated data
    const updatedData = {
      name,
      description,
      basePrice,
      discount: discount ?? 0,
      image: updateResponse,
      category: matchedCategory.en, // store only English version
      isSpicy: isSpicy ?? false,
      hasProteinChoices,
      hasTypeChoices,
      prices,
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

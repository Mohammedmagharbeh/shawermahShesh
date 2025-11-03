const products = require("../models/products");

const { CATEGORIES } = require("../constants");
const { default: cloudinary } = require("../config/cloudinary");

// ✅ POST: Create Product
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
      isSpicy = false,
      hasProteinChoices = false,
      hasTypeChoices = false,
      additions = [],
    } = req.body;

    // 🔍 Validate required fields
    if (
      !name?.ar ||
      !name?.en ||
      !description?.ar ||
      !description?.en ||
      !category
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔍 Validate category
    const matchedCategory = CATEGORIES.find((c) => c.en === category);
    if (!matchedCategory) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // 📸 Upload image if provided
    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      imageUrl = uploadResponse.secure_url;
    }

    // 🧾 Create product
    const createdProduct = await products.create({
      name,
      description,
      basePrice: Number(basePrice) || 0,
      prices: prices || {},
      discount: Number(discount) || 0,
      image: imageUrl,
      category: matchedCategory.en,
      isSpicy,
      hasProteinChoices,
      hasTypeChoices,
      additions, // Expected as array of { addition: ObjectId, price: Number }
    });

    res.status(201).json({
      message: "✅ Product created successfully",
      data: createdProduct,
    });
  } catch (error) {
    console.error("❌ Error in postEat:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ PUT: Update Product
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
      additions = [],
    } = req.body;

    // 🔍 Validate required fields
    if (
      !name?.ar ||
      !name?.en ||
      !description?.ar ||
      !description?.en ||
      !category
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // 🔍 Validate category
    const matchedCategory = CATEGORIES.find((c) => c.en === category);
    if (!matchedCategory) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // 📸 Only upload new image if it’s different (base64)
    let imageUrl;
    if (image && image.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      imageUrl = uploadResponse.secure_url;
    }

    // 🧾 Prepare update data
    const updatedData = {
      name,
      description,
      basePrice: Number(basePrice) || 0,
      discount: Number(discount) || 0,
      prices: prices || {},
      category: matchedCategory.en,
      isSpicy: !!isSpicy,
      hasProteinChoices: !!hasProteinChoices,
      hasTypeChoices: !!hasTypeChoices,
      additions,
    };

    if (imageUrl) updatedData.image = imageUrl;

    const updatedProduct = await products.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "✅ Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Error in updatedfood:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE: Remove Product
exports.deletefood = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await products.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      message: "🗑️ Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    console.error("❌ Error in deletefood:", error);
    res.status(500).json({ message: error.message });
  }
};

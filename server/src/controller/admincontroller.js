const productsModel = require("../models/products");
const categoryModel = require("../models/Category");
const userModel = require("../models/user");
const { USER_ROLES } = require("../constants");
const { cloudinary } = require("../config/cloudinary");

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
      additionsSelectionType,
      inStock = true,
    } = req.body;

    // ================================
    // ✅ Validate required fields
    // ================================
    if (
      !name?.ar ||
      !name?.en ||
      !description?.ar ||
      !description?.en ||
      !category
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ================================
    // ✅ Validate category
    // ================================
    const categoryInDB = categoryModel.findById(category);
    if (!categoryInDB) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    // ================================
    // ✅ Normalize booleans
    // ================================
    const spicy = Boolean(isSpicy);
    const proteinChoices = Boolean(hasProteinChoices);
    const typeChoices = Boolean(hasTypeChoices);

    // ================================
    // ✅ Parse prices if string
    // ================================
    let parsedPrices = {};
    try {
      parsedPrices =
        typeof prices === "string" ? JSON.parse(prices) : prices || {};
    } catch (err) {
      return res.status(400).json({ message: "Invalid prices format" });
    }

    // ================================
    // ✅ Validate additions array
    // ================================
    if (!Array.isArray(additions)) {
      return res.status(400).json({ message: "Additions must be an array" });
    }

    for (const add of additions) {
      if (!add?.name?.ar || !add?.name?.en || add.price == null) {
        return res.status(400).json({
          message: "Each addition must have { name: {ar,en}, price }",
        });
      }
    }

    // ================================
    // ✅ Upload image if base64
    // ================================
    let imageUrl = "";
    if (image) {
      if (image.startsWith("data:image")) {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "products",
        });
        imageUrl = uploadResponse.secure_url;
      } else {
        // If it's already a URL, keep it
        imageUrl = image;
      }
    }

    // ================================
    // ✅ Save product
    // ================================
    const createdProduct = await productsModel.create({
      name,
      description,
      basePrice: Number(basePrice) || 0,
      prices: parsedPrices,
      discount: Number(discount) || 0,
      image: imageUrl,
      category,
      isSpicy: spicy,
      hasProteinChoices: proteinChoices,
      hasTypeChoices: typeChoices,
      additions, // embedded additions
      additionsSelectionType,
      inStock: Boolean(inStock),
    });

    return res.status(201).json({
      message: "✅ Product created successfully",
      data: createdProduct,
    });
  } catch (error) {
    console.error("❌ Error in postEat:", error);
    return res.status(500).json({ message: error.message });
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
      additionsSelectionType,
      inStock = true,
    } = req.body;

    // ================================
    // ✅ Validate category
    // ================================
    if (category) {
      const categoryInDB = categoryModel.findById(category);
      if (!categoryInDB) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    // ================================
    // ✅ Parse prices if needed
    // ================================
    // ✅ Parse prices (supports A + B)
    let parsedPrices;
    if (typeof prices === "string") {
      try {
        parsedPrices = JSON.parse(prices);
      } catch (err) {
        return res.status(400).json({ message: "Invalid prices JSON" });
      }
    } else if (typeof prices === "object" && prices !== null) {
      parsedPrices = prices;
    } else {
      parsedPrices = {};
    }

    // ================================
    // ✅ Validate additions array
    // ================================
    if (!Array.isArray(additions)) {
      return res.status(400).json({ message: "Additions must be an array" });
    }

    for (const add of additions) {
      if (!add?.name?.ar || !add?.name?.en || add.price == null) {
        return res.status(400).json({
          message: "Each addition must have { name: {ar,en}, price }",
        });
      }
    }

    // ================================
    // ✅ Upload new image if base64
    // ================================
    let imageUrl = undefined;
    if (image && image.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      imageUrl = uploadResponse.secure_url;
    }

    // ================================
    // ✅ Build update object
    // ================================

    const updatedData = {
      name,
      description,
      basePrice: Number(basePrice) || 0,
      discount: Number(discount) || 0,
      prices: parsedPrices,
      category,
      isSpicy: Boolean(isSpicy),
      hasProteinChoices: Boolean(hasProteinChoices),
      hasTypeChoices: Boolean(hasTypeChoices),
      additions,
      additionsSelectionType,
      inStock: Boolean(inStock),
    };

    if (imageUrl) updatedData.image = imageUrl;

    // ================================
    // ✅ Update DB
    // ================================

    const updatedProduct = await productsModel.findByIdAndUpdate(
      id,
      { $set: updatedData },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Emit real-time stock update to all connected clients
    const io = req.app.get("io");
    if (io) {
      io.emit("product:stockUpdated", {
        productId: updatedProduct._id,
        inStock: updatedProduct.inStock,
      });
    }

    return res.status(200).json({
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

    const deletedProduct = await productsModel.findByIdAndDelete(id);

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

exports.reorderProducts = async (req, res) => {
  try {
    const { orderedIds, categoryId } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderedIds" });
    }

    // Update position for each product
    const updates = orderedIds.map((id, index) =>
      productsModel.findByIdAndUpdate(id, { position: index }, { new: true }),
    );

    await Promise.all(updates);

    res.json({ success: true, message: "Products reordered successfully" });
  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!id || !role) {
      return res.status(400).json({ message: "User ID and role are required" });
    }
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await userModel.findByIdAndUpdate(
      id,
      { role: role },
      { new: true },
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { phone, role } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "phone number is required" });
    }

    const user = await userModel.findOne({ phone: phone });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (role && !USER_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const newUser = new userModel({
      phone,
      role: role || "user",
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

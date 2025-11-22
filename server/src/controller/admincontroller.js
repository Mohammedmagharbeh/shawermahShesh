const products = require("../models/products");

const { CATEGORIES } = require("../constants");
const { default: cloudinary } = require("../config/cloudinary");
const { parse } = require("dotenv");

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
    const matchedCategory = CATEGORIES.find((c) => c.en === category);
    if (!matchedCategory) {
      return res.status(400).json({ message: "Invalid category" });
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

    console.log("additionsSelectionType", additionsSelectionType);

    // ================================
    // ✅ Save product
    // ================================
    const createdProduct = await products.create({
      name,
      description,
      basePrice: Number(basePrice) || 0,
      prices: parsedPrices,
      discount: Number(discount) || 0,
      image: imageUrl,
      category: matchedCategory.en,
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
      const matchedCategory = CATEGORIES.find((c) => c.en === category);
      if (!matchedCategory) {
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

    // ✅ Validate flat format: { sandwich, meal }
    // if (
    //   parsedPrices.sandwich !== undefined ||
    //   parsedPrices.meal !== undefined
    // ) {
    //   parsedPrices = {
    //     ...(parsedPrices.sandwich !== undefined && {
    //       sandwich: Number(parsedPrices.sandwich),
    //     }),
    //     ...(parsedPrices.meal !== undefined && {
    //       meal: Number(parsedPrices.meal),
    //     }),
    //   };
    // }

    // ✅ Validate nested format: { chicken: {...}, meat: {...} }
    // else {
    //   Object.keys(parsedPrices).forEach((type) => {
    //     const entry = parsedPrices[type];
    //     parsedPrices[type] = {
    //       ...(entry.chicken !== undefined && {
    //         chicken: Number(entry.chicken),
    //       }),
    //       ...(entry?.meat !== undefined && { meat: Number(entry.meat) }),
    //     };
    //   });
    // }
    // console.log(Object.keys(parsedPrices));
    // console.log(parsedPrices["chicken"]);

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
    console.log(additionsSelectionType);

    const updatedData = {
      name,
      description,
      basePrice: Number(basePrice) || 0,
      discount: Number(discount) || 0,
      prices: parsedPrices,
      category: category,
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

    const updatedProduct = await products.findByIdAndUpdate(
      id,
      { $set: updatedData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
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

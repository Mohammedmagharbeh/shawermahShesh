const cart = require("../models/cart");
const productsModel = require("../models/products");
const userModel = require("../models/user");

// ✅ Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { productId, quantity, additions = [], isSpicy, notes } = req.body;

    if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Invalid productId or quantity" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await productsModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let userCart = await cart.findOne({ userId });
    if (!userCart) {
      userCart = await cart.create({ userId, products: [] });
    }

    // ✅ Compare additions by their IDs (sorted)
    const normalizeIds = (ids) => ids.map(String).sort();

    const existingProductIndex = userCart.products.findIndex((item) => {
      const sameProduct = item.productId.toString() === productId;
      const sameSpicy = item.isSpicy === isSpicy;
      const sameNotes = (item.notes || "") === (notes || "");
      const sameAdditions =
        JSON.stringify(normalizeIds(item.additions || [])) ===
        JSON.stringify(normalizeIds(additions || []));
      return sameProduct && sameAdditions && sameSpicy && sameNotes;
    });

    if (existingProductIndex > -1) {
      // ✅ If exact same item (same additions, spicy, notes), increase quantity
      userCart.products[existingProductIndex].quantity += quantity;
    } else {
      // ✅ Otherwise, add as new item
      userCart.products.push({
        productId,
        quantity,
        additions,
        isSpicy,
        notes,
      });
    }

    await userCart.save();

    // ✅ Populate before sending
    await userCart.populate([
      { path: "products.productId" },
      { path: "products.additions" },
    ]);

    return res.status(200).json({
      message: "Cart updated successfully",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Cart Item Quantity
exports.updateCart = async (req, res) => {
  const cartId = req.params.id;
  const { productId, additions = [], isSpicy, notes, quantity } = req.body;

  try {
    if (!productId || quantity == null || isNaN(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "productId and quantity are required" });
    }

    const userCart = await cart.findById(cartId);
    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    const normalizeIds = (ids) => ids.map(String).sort();

    const productIndex = userCart.products.findIndex((p) => {
      const sameProduct = p.productId.toString() === productId;
      const sameSpicy = p.isSpicy === isSpicy;
      const sameNotes = (p.notes || "") === (notes || "");
      const sameAdditions =
        JSON.stringify(normalizeIds(p.additions || [])) ===
        JSON.stringify(normalizeIds(additions || []));
      return sameProduct && sameAdditions && sameSpicy && sameNotes;
    });

    if (productIndex === -1)
      return res.status(404).json({ message: "Product not found in cart" });

    // ✅ Update quantity only for the exact item
    userCart.products[productIndex].quantity = quantity;

    await userCart.save();

    await userCart.populate([
      { path: "products.productId" },
      { path: "products.additions" },
    ]);

    return res.status(200).json({
      message: "Cart updated successfully",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error in updateCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Remove Specific Item from Cart
exports.removeFromCart = async (req, res) => {
  const { userId, productId, additions } = req.body; // include additions

  try {
    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "userId and productId are required" });
    }

    const userCart = await cart.findOne({ userId });
    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    // Find product that matches both productId and additions
    const productIndex = userCart.products.findIndex((p) => {
      const sameProduct = p.productId.toString() === productId;

      // Compare additions as sets (to ensure same selections)
      const sameAdditions =
        (!additions && (!p.additions || p.additions.length === 0)) ||
        (Array.isArray(additions) &&
          Array.isArray(p.additions) &&
          additions.length === p.additions.length &&
          additions.every((a) =>
            p.additions.map(String).includes(a.toString())
          ));

      return sameProduct && sameAdditions;
    });

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // remove the matched product
    userCart.products.splice(productIndex, 1);
    await userCart.save();

    // repopulate after save
    await userCart.populate([
      { path: "products.productId" },
      { path: "products.additions" },
    ]);

    return res.status(200).json({
      message: "Product removed from cart",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Clear Cart
exports.clearCart = async (req, res) => {
  const userId = req.params.userId;

  try {
    const userCart = await cart.findOne({ userId });
    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    userCart.products = [];
    await userCart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Cart
exports.getCart = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userCart = await cart
      .findOne({ userId })
      .populate("products.productId")
      .populate("products.additions");

    if (!userCart) {
      return res
        .status(200)
        .json({ message: "Cart is empty", cart: { products: [] } });
    }

    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json(userCart);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

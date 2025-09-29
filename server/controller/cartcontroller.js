const cart = require("../models/cart");
const productsModel = require("../models/products");
const userModel = require("../models/user");

// ✅ Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Invalid productId or quantity" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await productsModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.stock && product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    let updatedCart = await cart.findOneAndUpdate(
      { userId, "products.productId": productId },
      { $inc: { "products.$.quantity": quantity } },
      { new: true }
    );

    if (!updatedCart) {
      updatedCart = await cart
        .findOneAndUpdate(
          { userId },
          { $push: { products: { productId, quantity } } },
          { upsert: true, new: true }
        )
        .populate("products.productId");
    }

    return res.status(200).json({
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Cart Item Quantity
exports.updateCart = async (req, res) => {
  const cartId = req.params.id;
  const { productId, quantity } = req.body;

  try {
    if (!productId || quantity == null || isNaN(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "productId and quantity are required" });
    }

    const userCart = await cart.findById(cartId);
    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = userCart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIndex === -1)
      return res.status(404).json({ message: "Product not found in cart" });

    userCart.products[productIndex].quantity = quantity;

    await userCart.save();

    // populate productId before sending
    await userCart.populate("products.productId");

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
  const { userId, productId } = req.body;

  try {
    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "userId and productId are required" });
    }

    const userCart = await cart.findOne({ userId });
    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = userCart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // remove the product
    userCart.products.splice(productIndex, 1);
    await userCart.save();

    // populate productId before sending
    await userCart.populate("products.productId");

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
      .populate("products.productId");

    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json(userCart);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

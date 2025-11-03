const Cart = require("../models/cart");
const Product = require("../models/products");
const User = require("../models/user");

// ✅ Safe comparison for additions
const sameAdditions = (a1 = [], a2 = []) => {
  if (!Array.isArray(a1) || !Array.isArray(a2)) return false;
  if (a1.length !== a2.length) return false;
  if (a1.length === 0 && a2.length === 0) return true;

  const getId = (a) => (a?._id ? a._id.toString() : a.toString());
  const sortedA1 = a1.map(getId).sort();
  const sortedA2 = a2.map(getId).sort();

  return JSON.stringify(sortedA1) === JSON.stringify(sortedA2);
};

// ✅ Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      productId,
      quantity,
      additions = [],
      isSpicy,
      notes,
      selectedProtein,
      selectedType,
    } = req.body;

    if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Invalid productId or quantity" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let userCart = await Cart.findOne({ userId });
    if (!userCart) userCart = await Cart.create({ userId, products: [] });

    const existingProductIndex = userCart.products.findIndex((item) => {
      return (
        item.productId.toString() === productId &&
        item.isSpicy === isSpicy &&
        (item.notes || "") === (notes || "") &&
        item.selectedType === selectedType &&
        item.selectedProtein === selectedProtein &&
        sameAdditions(item.additions, additions)
      );
    });

    if (existingProductIndex > -1) {
      userCart.products[existingProductIndex].quantity += quantity;
    } else {
      userCart.products.push({
        productId,
        quantity,
        additions,
        isSpicy,
        notes,
        selectedProtein,
        selectedType,
      });
    }

    await userCart.save();
    await userCart.populate("products.productId");

    return res.status(200).json({
      message: "Cart updated successfully",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Quantity
exports.updateCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    const {
      productId,
      additions = [],
      isSpicy,
      notes,
      quantity,
      selectedProtein,
      selectedType,
    } = req.body;

    if (!productId || quantity == null || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Invalid productId or quantity" });
    }

    const userCart = await Cart.findById(cartId);
    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = userCart.products.findIndex((p) => {
      return (
        p.productId.toString() === productId &&
        p.isSpicy === isSpicy &&
        (p.notes || "") === (notes || "") &&
        p.selectedType === selectedType &&
        p.selectedProtein === selectedProtein &&
        sameAdditions(p.additions, additions)
      );
    });

    if (productIndex === -1)
      return res.status(404).json({ message: "Product not found in cart" });

    userCart.products[productIndex].quantity = quantity;
    await userCart.save();
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

// ✅ Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const {
      userId,
      productId,
      additions = [],
      selectedProtein,
      selectedType,
    } = req.body;

    if (!userId || !productId)
      return res
        .status(400)
        .json({ message: "userId and productId are required" });

    const userCart = await Cart.findOne({ userId });
    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    const index = userCart.products.findIndex((p) => {
      return (
        p.productId.toString() === productId &&
        p.selectedType === selectedType &&
        p.selectedProtein === selectedProtein &&
        sameAdditions(p.additions, additions)
      );
    });

    if (index === -1)
      return res.status(404).json({ message: "Product not found in cart" });

    userCart.products.splice(index, 1);
    await userCart.save();
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
  try {
    const userId = req.params.userId;
    const userCart = await Cart.findOne({ userId });
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
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userCart = await Cart.findOne({ userId })
      .populate("products.productId")
      .lean();

    if (!userCart)
      return res
        .status(200)
        .json({ message: "Cart is empty", cart: { products: [] } });

    return res.status(200).json(userCart);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

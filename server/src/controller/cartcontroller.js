const Cart = require("../models/cart");
const Product = require("../models/products");
const User = require("../models/user");

// ✅ Compare additions safely
const sameAdditions = (a1 = [], a2 = []) => {
  if (a1.length !== a2.length) return false;
  return (
    JSON.stringify(a1.map((a) => a?._id?.toString() || a.toString()).sort()) ===
    JSON.stringify(a2.map((a) => a?._id?.toString() || a.toString()).sort())
  );
};

// ✅ Match product entry in cart
const isSameCartItem = (item, payload) => {
  return (
    item.productId.toString() === payload.productId &&
    item.isSpicy === payload.isSpicy &&
    (item.notes || "") === (payload.notes || "") &&
    item.selectedType === payload.selectedType &&
    item.selectedProtein === payload.selectedProtein &&
    sameAdditions(item.additions, payload.additions)
  );
};

// ✅ Helpers
const findUser = async (userId) => User.findById(userId);
const findProduct = async (productId) => Product.findById(productId);
const findOrCreateCart = async (userId) =>
  (await Cart.findOne({ userId })) || Cart.create({ userId, products: [] });

const validateRequest = ({ productId, quantity }) => {
  if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
    return "Invalid productId or quantity";
  }
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

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid productId or quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Map addition _id from request to actual addition object
    const fullAdditions = (additions || [])
      .map((add) => {
        const found = product.additions.find(
          (a) => a._id.toString() === add._id
        );
        return found ? { ...found.toObject() } : null;
      })
      .filter(Boolean);

    let userCart = await Cart.findOne({ userId });
    if (!userCart) userCart = await Cart.create({ userId, products: [] });

    const existingProductIndex = userCart.products.findIndex((item) => {
      const sameAdditions =
        JSON.stringify(item.additions) === JSON.stringify(fullAdditions);
      return (
        item.productId.toString() === productId &&
        item.isSpicy === isSpicy &&
        (item.notes || "") === (notes || "") &&
        item.selectedType === selectedType &&
        item.selectedProtein === selectedProtein &&
        sameAdditions
      );
    });

    if (existingProductIndex > -1) {
      userCart.products[existingProductIndex].quantity += quantity;
    } else {
      userCart.products.push({
        productId,
        quantity,
        additions: fullAdditions,
        isSpicy,
        notes,
        selectedProtein,
        selectedType,
      });
    }

    await userCart.save();
    await userCart.populate("products.productId");

    res.status(200).json({
      message: "Cart updated successfully",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Cart
exports.updateCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    const payload = {
      productId: req.body.productId,
      quantity: req.body.quantity,
      additions: req.body.additions || [],
      isSpicy: req.body.isSpicy,
      notes: req.body.notes,
      selectedProtein: req.body.selectedProtein,
      selectedType: req.body.selectedType,
    };

    const error = validateRequest(payload);
    if (error) return res.status(400).json({ message: error });

    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.products.findIndex((item) =>
      isSameCartItem(item, payload)
    );
    if (index === -1)
      return res.status(404).json({ message: "Product not found in cart" });

    cart.products[index].quantity = payload.quantity;
    await cart.save();
    await cart.populate("products.productId");

    res.status(200).json({ message: "Cart updated", cart });
  } catch (err) {
    console.error("updateCart error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Remove Item
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
      return res.status(400).json({ message: "userId & productId required" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.products.findIndex((item) =>
      isSameCartItem(item, {
        productId,
        additions,
        selectedProtein,
        selectedType,
      })
    );

    if (index === -1)
      return res.status(404).json({ message: "Item not found in cart" });

    cart.products.splice(index, 1);
    await cart.save();
    await cart.populate("products.productId");

    res.status(200).json({ message: "Removed", cart });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Clear Cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (err) {
    console.error("clearCart error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await findUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart) return res.status(200).json({ cart: { products: [] } });

    cart.products = cart.products.filter((item) => item.productId);
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

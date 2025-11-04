const Order = require("../models/orders");
const User = require("../models/user");
const Product = require("../models/products");
const Location = require("../models/locations");
const counterModel = require("../models/counter");
const mongoose = require("mongoose");

// --------------------- HELPERS --------------------- //

// Validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Fetch user
const findUser = async (userId) => User.findById(userId);

// Fetch products from DB
const fetchProductsByIds = async (ids) => Product.find({ _id: { $in: ids } });

// Fetch location
const findLocation = async (locationId) => Location.findById(locationId);

// Generate daily sequence
async function getNextDailySequence() {
  const todayStr = new Date().toISOString().split("T")[0];
  const counter = await counterModel.findOneAndUpdate(
    { date: todayStr },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence;
}

// Enrich products with price, additions, etc.
const enrichProducts = (productsInput, dbProducts, orderType, userDetails) => {
  return productsInput.map((p) => {
    const productId = p.productId._id || p.productId;
    const matchedProduct = dbProducts.find(
      (dp) => dp._id.toString() === productId.toString()
    );

    const selectedAdditions = (p.additions || [])
      .map((add) =>
        matchedProduct.additions.find(
          (a) => a._id.toString() === add._id.toString()
        )
      )
      .filter(Boolean)
      .map((a) => ({
        _id: a._id,
        name: a.name,
        price: a.price, // Make sure the price is included
      }));

    // Base price
    let basePrice = matchedProduct.basePrice;
    if (matchedProduct.hasTypeChoices || matchedProduct.hasProteinChoices) {
      const protein = p.selectedProtein || "chicken";
      const type = p.selectedType || "sandwich";
      basePrice = matchedProduct.prices?.[protein]?.[type] || basePrice;
    }

    const discountedPrice =
      matchedProduct.discount > 0
        ? basePrice - (matchedProduct.discount * basePrice) / 100
        : basePrice;

    return {
      productId,
      quantity: p.quantity,
      additions: selectedAdditions,
      priceAtPurchase: discountedPrice,
      isSpicy: p.isSpicy || false,
      notes: p.notes || "",
      orderType,
      userDetails,
      selectedProtein: p.selectedProtein || null,
      selectedType: p.selectedType || null,
    };
  });
};

// Calculate total price
const calculateTotalPrice = (products, deliveryCost = 0) => {
  return (
    products.reduce((total, product) => {
      const additionsTotal = (product.additions || []).reduce(
        (sum, add) => sum + add.price,
        0
      );
      const productTotal =
        (product.priceAtPurchase + additionsTotal) * product.quantity;
      return total + productTotal;
    }, 0) + deliveryCost
  );
};

// --------------------- CONTROLLERS --------------------- //

// GET order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidId(id))
      return res
        .status(400)
        .json({ success: false, message: "Valid Order ID is required" });

    const order = await Order.findById(id)
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress")
      .lean();

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET all orders (optional status filter)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
      .populate("products.productId")
      .populate("userId", "phone name")
      .populate("shippingAddress")
      .lean()
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    console.error("getAllOrders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET orders by user ID
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !isValidId(userId))
      return res
        .status(400)
        .json({ success: false, message: "Valid User ID is required" });

    const user = await findUser(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const orders = await Order.find({ userId })
      .populate("products.productId")
      .populate("shippingAddress")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("getOrdersByUserId error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// CREATE order
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      products,
      status,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      transactionId,
      paidAt,
      orderType,
      userDetails,
    } = req.body;

    if (
      !userId ||
      !products?.length ||
      !shippingAddress ||
      !paymentMethod ||
      !orderType ||
      !userDetails?.name
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const foundUser = await User.findById(userId);
    if (!foundUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const location = await Location.findById(shippingAddress);
    if (!location)
      return res
        .status(400)
        .json({ success: false, message: "Invalid shipping address" });

    const productIds = products.map((p) => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    // Enrich products
    const enrichedProducts = products.map((p) => {
      const matchedProduct = dbProducts.find(
        (dp) => dp._id.toString() === p.productId
      );

      let basePrice = matchedProduct.basePrice;
      if (matchedProduct.hasTypeChoices || matchedProduct.hasProteinChoices) {
        const protein = p.selectedProtein || "chicken";
        const type = p.selectedType || "sandwich";
        basePrice =
          matchedProduct.prices?.[protein]?.[type] || matchedProduct.basePrice;
      }

      const discountedPrice = matchedProduct.discount
        ? basePrice - (basePrice * matchedProduct.discount) / 100
        : basePrice;

      // Use full addition objects from cart
      const additions = p.additions || [];

      return {
        productId: p.productId,
        quantity: p.quantity,
        additions,
        priceAtPurchase: discountedPrice,
        isSpicy: p.isSpicy || false,
        notes: p.notes || "",
        selectedProtein: p.selectedProtein || null,
        selectedType: p.selectedType || null,
      };
    });

    // Calculate total price
    const totalPrice =
      enrichedProducts.reduce((sum, p) => {
        const additionsTotal = (p.additions || []).reduce(
          (aSum, a) => aSum + a.price,
          0
        );
        return sum + (p.priceAtPurchase + additionsTotal) * p.quantity;
      }, 0) + location.deliveryCost;

    // Create order
    const newOrder = await Order.create({
      userId,
      products: enrichedProducts,
      totalPrice,
      status: status || "Processing",
      shippingAddress,
      payment: {
        method: paymentMethod,
        status: paymentStatus || "unpaid",
        transactionId: transactionId || null,
        paidAt: paidAt || null,
      },
      orderType,
      userDetails,
      sequenceNumber: await getNextDailySequence(),
    });

    const populatedOrder = await newOrder.populate([
      { path: "products.productId" },
      { path: "userId" },
      { path: "shippingAddress" },
    ]);

    // Notify admins via socket.io
    const io = req.app.get("io");
    if (io) io.emit("newOrder", populatedOrder);

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// UPDATE order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const allowedUpdates = [
      "status",
      "shippingAddress",
      "payment",
      "products",
      "totalPrice",
    ];
    const updates = {};

    allowedUpdates.forEach(
      (f) => body[f] !== undefined && (updates[f] = body[f])
    );
    if (!Object.keys(updates).length)
      return res.status(400).json({ message: "No valid fields to update" });

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress");

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    // Send OTP if status confirmed
    if (updates.status === "Confirmed") {
      const { sendOrderConfirm } = require("../utils/otp");
      await sendOrderConfirm(updatedOrder.userId.phone);
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("updateOrder error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder)
      return res.status(404).json({ message: "Order not found" });
    res.status(200).json(deletedOrder);
  } catch (err) {
    console.error("deleteOrder error:", err);
    res.status(500).json({ message: err.message });
  }
};

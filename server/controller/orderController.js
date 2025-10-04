const Order = require("../models/orders");
const User = require("../models/user");
const productsModel = require("../models/products");
const locationsModel = require("../models/locations");
const locations = require("../models/locations");
const { default: mongoose } = require("mongoose");

// get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress");

    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get order by id
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findById(id)
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Error in getOrderById:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get orders by user id
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userOrders = await Order.find({ userId })
      .populate("products.productId")
      .populate("shippingAddress");

    if (!userOrders.length) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found for this user" });
    }

    res.status(200).json({ success: true, data: userOrders });
  } catch (error) {
    console.error("Error in getOrdersByUserId:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// create new order
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
    } = req.body;

    if (!userId || !products?.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // validate shipping address & get delivery fee
    const location = await locationsModel.findById(shippingAddress);
    if (!location) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid shipping address" });
    }

    // validate user
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // validate products
    const dbProducts = await productsModel.find({
      _id: { $in: products.map((p) => p.productId) },
    });
    if (dbProducts.length !== products.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products not found",
      });
    }

    // enrich products with price at purchase
    const enrichedProducts = products.map((p) => {
      const matched = dbProducts.find(
        (dp) => dp._id.toString() === p.productId
      );
      return {
        productId: p.productId,
        quantity: p.quantity,
        priceAtPurchase: matched.price,
      };
    });

    // calculate total price (products + delivery fee)
    const productsTotal = enrichedProducts.reduce(
      (sum, p) => sum + p.quantity * p.priceAtPurchase,
      0
    );
    const totalPrice = productsTotal + location.deliveryCost;

    // create order
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
    });

    // populate related fields
    const populatedOrder = await newOrder.populate([
      { path: "products.productId" },
      { path: "userId" },
      { path: "shippingAddress" },
    ]);

    // Emit event to admins
    const io = req.app.get("io");
    io.emit("newOrder", newOrder); // 🔥 broadcast order to all connected admins
    console.log("Emitted newOrder event:", newOrder._id);

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const allowedUpdates = ["status", "shippingAddress", "payment", "products"];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) updates[field] = body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .populate("products.productId")
      .populate("userId")
      .populate("shippingAddress");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(deletedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

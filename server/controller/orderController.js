const orders = require("../models/orders");

// get all orders
exports.getAllOrders = async (req, res) => {
  try {
     const allOrders = await orders.find();
     res.status(200).json(allOrders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get order by id
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orders.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get orders by user id
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const userOrders = await orders.find({ userId });
    if (!userOrders) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json(userOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create new order
exports.createOrder = async (req, res) => {
  try {
    const { userId, products, totalPrice, status, shippingAddress, paymentMethod, paymentStatus } = req.body;

    if (!userId || !products || !totalPrice || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newOrder = await orders.create({
      userId,
      products,
      totalPrice,
      status: status || "pending",
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || "unpaid",
    });

    res.status(200).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updatedOrder = await orders.findByIdAndUpdate(id, body, { new: true });

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
    const deletedOrder = await orders.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(deletedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Order = require("../models/orders");
const User = require("../models/user");
const productsModel = require("../models/products");

// get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get order by id
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get orders by user id
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userOrders = await Order.find({ userId });
    if (!userOrders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(userOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function calculateTotalPrice(products) {
  const productIds = products.map((p) => p.productId);

  const dbProducts = await productsModel.find({ _id: { $in: productIds } });

  const priceMap = {};
  dbProducts.forEach((p) => {
    priceMap[p._id] = p.price;
  });

  const totalPrice = products.reduce((total, product) => {
    const price = priceMap[product.productId] || 0;
    return total + price * product.quantity;
  }, 0);

  return totalPrice;
}

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
    } = req.body;

    if (!userId || !products || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Products must be a non-empty array" });
    }

    if (!products.every((p) => p.productId && p.quantity && p.quantity > 0)) {
      return res.status(400).json({
        message:
          "Each product must have a valid productId and quantity greater than 0",
      });
    }

    products.forEach((p) => {
      const product = productsModel.findById(p.productId);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Product with ID ${p.productId} not found` });
      }
    });

    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalPrice = await calculateTotalPrice(products);

    if (totalPrice <= 0) {
      return res.status(400).json({ message: "Invalid product prices" });
    }

    const newOrder = await Order.create({
      userId,
      products,
      totalPrice,
      status: status || "pending",
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || "unpaid",
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(id, body, { new: true });

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

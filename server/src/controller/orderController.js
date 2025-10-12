const Order = require("../models/orders");
const User = require("../models/user");
const productsModel = require("../models/products");
const locationsModel = require("../models/locations");
const additionsModel = require("../models/additions");
const { default: mongoose } = require("mongoose");

// get all orders
exports.getAllOrders = async (req, res) => {
  try {
    // 1️⃣ Only fetch essential fields — avoid pulling everything from every model
    const orders = await Order.find(
      {},
      "status totalPrice createdAt userId shippingAddress products"
    )
      .populate({
        path: "products.productId",
        select: "name price image", // limit product fields
        options: { lean: true },
      })
      .populate({
        path: "products.additions",
        options: { lean: true },
      })
      .populate({
        path: "userId",
        select: "phone role",
        options: { lean: true },
      })
      .populate({
        path: "shippingAddress",
        select: "deliveryCost name",
        options: { lean: true },
      })
      .lean() // 2️⃣ Use lean() to skip Mongoose doc overhead and improve speed
      .limit(100) // 3️⃣ Prevent fetching thousands at once — use pagination
      .sort({ createdAt: -1 }); // 4️⃣ Sort newest first

    res.status(200).json({ success: true, count: orders.length, data: orders });
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
      .populate("products.additions")
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
      .populate("products.additions")
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

    // ✅ Validate user
    const foundUser = await User.findById(userId);
    if (!foundUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // ✅ Validate shipping address
    const location = await locationsModel.findById(shippingAddress);
    if (!location) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid shipping address" });
    }

    // ✅ Extract unique product IDs from cart/order
    const productIds = products.map((p) =>
      typeof p.productId === "object" ? p.productId._id : p.productId
    );
    const uniqueProductIds = [...new Set(productIds)];

    // ✅ Fetch products from DB
    const dbProducts = await productsModel.find({
      _id: { $in: uniqueProductIds },
    });
    const dbProductIds = dbProducts.map((p) => p._id.toString());

    // ✅ Check for missing products
    const missingProducts = uniqueProductIds.filter(
      (pid) => !dbProductIds.includes(pid)
    );
    if (missingProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Products not found: ${missingProducts.join(", ")}`,
      });
    }

    // ✅ Enrich each product item (handle duplicates with different additions/notes/spicy)
    const enrichedProducts = await Promise.all(
      products.map(async (p) => {
        const productId =
          typeof p.productId === "object" ? p.productId._id : p.productId;
        const matchedProduct = dbProducts.find(
          (dp) => dp._id.toString() === productId.toString()
        );

        const dbAdditions = await additionsModel.find({
          _id: { $in: p.additions || [] },
        });
        const additions = dbAdditions.map((a) => ({
          _id: a._id,
          name: a.name,
          price: a.price,
        }));

        return {
          productId,
          quantity: p.quantity,
          additions,
          priceAtPurchase: matchedProduct.price,
          isSpicy: p.isSpicy || false,
          notes: p.notes || "",
        };
      })
    );

    // ✅ Calculate total (products + additions + delivery)
    const productsTotal = enrichedProducts.reduce((sum, p) => {
      const additionsSum = p.additions.reduce(
        (aSum, add) => aSum + add.price,
        0
      );
      return sum + (p.priceAtPurchase + additionsSum) * p.quantity;
    }, 0);

    const totalPrice = productsTotal + location.deliveryCost;

    // ✅ Create the order
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

    // ✅ Populate for frontend
    const populatedOrder = await newOrder.populate([
      { path: "products.productId" },
      { path: "products.additions" },
      { path: "userId" },
      { path: "shippingAddress" },
    ]);

    // ✅ Notify admins (if socket.io enabled)
    const io = req.app.get("io");
    if (io) io.emit("newOrder", populatedOrder);

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error("❌ Error in createOrder:", error);
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
    const allowedUpdates = [
      "status",
      "shippingAddress",
      "payment",
      "products",
      "totalPrice",
    ];
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
      .populate("products.additions")
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

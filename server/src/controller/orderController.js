const Order = require("../models/orders");
const User = require("../models/user");
const Product = require("../models/products");
const Location = require("../models/locations");
const counterModel = require("../models/counter");
const mongoose = require("mongoose");

// Validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Fetch user
const findUser = async (userId) => User.findById(userId);

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
      paymentStatus,
      paymentMethod,
      transactionId,
      paidAt,
      orderType,
      userDetails,
    } = req.body;

    // basic validation
    if (
      !userId ||
      !Array.isArray(products) ||
      products.length === 0 ||
      !orderType ||
      (orderType === "delivery" && !shippingAddress) ||
      !userDetails?.name
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // validate user & location
    const foundUser = await User.findById(userId);
    if (!foundUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    let location = null;
    if (orderType === "delivery") {
      location = await Location.findById(shippingAddress);
      if (!location)
        return res
          .status(400)
          .json({ success: false, message: "Invalid shipping address" });
    }

    // collect product ids and fetch DB products
    const productIds = products.map((p) =>
      p.productId && p.productId._id ? p.productId._id : p.productId
    );
    const uniqueProductIds = [
      ...new Set(productIds.map((id) => id.toString())),
    ];
    const dbProducts = await Product.find({ _id: { $in: uniqueProductIds } });

    // check missing products
    const dbProductIds = dbProducts.map((p) => p._id.toString());
    const missing = uniqueProductIds.filter((id) => !dbProductIds.includes(id));
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Products not found: ${missing.join(", ")}`,
      });
    }

    // helper: get addition price from product by _id or by name if needed
    const getAdditionFromProduct = (matchedProduct, addRef) => {
      if (!matchedProduct || !Array.isArray(matchedProduct.additions))
        return null;

      // addRef might be {_id: "..."} or { _id: ObjectId } or { name: {en/ar}, price }
      if (addRef?._id) {
        const found = matchedProduct.additions.find(
          (a) => a._id.toString() === addRef._id.toString()
        );
        if (found)
          return {
            _id: found._id,
            name: found.name,
            price: Number(found.price || 0),
          };
      }

      // try matching by name (fallback)
      if (addRef?.name?.en) {
        const found = matchedProduct.additions.find(
          (a) => a.name?.en === addRef.name.en
        );
        if (found)
          return {
            _id: found._id,
            name: found.name,
            price: Number(found.price || 0),
          };
      }

      return null;
    };

    // normalize a single price lookup from product.prices supporting both formats
    const getVariationPrice = (
      matchedProduct,
      selectedProtein,
      selectedType
    ) => {
      if (!matchedProduct) return 0;
      // if nested (chicken.meal etc)
      if (
        selectedProtein &&
        selectedType &&
        matchedProduct.prices?.[selectedProtein]?.[selectedType] != null
      ) {
        return Number(matchedProduct.prices[selectedProtein][selectedType]);
      }
      // if flat (sandwich: x, meal: y)
      if (selectedType && matchedProduct.prices?.[selectedType] != null) {
        return Number(matchedProduct.prices[selectedType]);
      } else if (selectedProtein) {
        return Number(matchedProduct.prices[selectedProtein]);
      }
      // fallback to basePrice
      return Number(matchedProduct.basePrice || 0);
    };

    // Enrich products (normalize additions and compute priceAtPurchase)
    const enrichedProducts = products.map((p) => {
      const productId =
        p.productId && p.productId._id
          ? p.productId._id.toString()
          : p.productId.toString();
      const matchedProduct = dbProducts.find(
        (dp) => dp._id.toString() === productId
      );

      const quantity = Number(p.quantity || 1);

      // determine base price (supports nested or flat prices)
      const basePriceRaw = getVariationPrice(
        matchedProduct,
        p.selectedProtein,
        p.selectedType
      );

      // apply discount (only to base product price)
      const discountPct = Number(matchedProduct.discount || 0);
      const priceAtPurchase =
        discountPct > 0
          ? basePriceRaw - (basePriceRaw * discountPct) / 100
          : basePriceRaw;

      // normalize additions: each item should be { _id?, name?, price: Number, quantity: Number (optional) }
      const normalizedAdditions = (p.additions || []).map((add) => {
        // if frontend already sent full object with price -> use it
        if (
          add &&
          (add.price !== undefined || add.price !== null) &&
          (add.name || add._id)
        ) {
          return {
            _id: add._id ? add._id : undefined,
            name: add.name ? add.name : undefined,
            price: Number(add.price || 0),
            quantity: Number(add.quantity || 1),
          };
        }
        // else try to resolve from product additions by _id or name
        const resolved = getAdditionFromProduct(matchedProduct, add);
        if (resolved) {
          return {
            _id: resolved._id,
            name: resolved.name,
            price: Number(resolved.price || 0),
            quantity: 1,
          };
        }
        // fallback: ignore unknown addition (price 0)
        return {
          _id: add?._id,
          name: add?.name,
          price: 0,
          quantity: Number(add?.quantity || 1),
        };
      });

      return {
        productId,
        quantity,
        additions: normalizedAdditions,
        priceAtPurchase: Number(priceAtPurchase || 0),
        isSpicy: Boolean(p.isSpicy || false),
        notes: p.notes || "",
        selectedProtein: p.selectedProtein || null,
        selectedType: p.selectedType || null,
      };
    });

    // Calculate total price (additions accounted per item and multiplied by product quantity)
    const productsTotal = enrichedProducts.reduce((sum, item) => {
      const additionsSumPerUnit = (item.additions || []).reduce(
        (aSum, a) => aSum + Number(a.price || 0) * Number(a.quantity || 1),
        0
      );
      const unitTotal = Number(item.priceAtPurchase || 0) + additionsSumPerUnit;
      return sum + unitTotal * Number(item.quantity || 1);
    }, 0);

    const totalPrice =
      Number(productsTotal) + Number(location?.deliveryCost || 0);

    // create order
    const newOrder = await Order.create({
      userId,
      products: enrichedProducts,
      totalPrice,
      status: status || "Processing",
      shippingAddress: orderType === "delivery" ? shippingAddress : null,
      payment: {
        status: paymentStatus || "unpaid",
        method: paymentMethod || null,
        transactionId: transactionId || null,
        paidAt: paidAt || null,
      },
      orderType,
      userDetails,
      sequenceNumber: await getNextDailySequence(),
    });

    // populate for response
    const populatedOrder = await newOrder.populate([
      { path: "products.productId" },
      { path: "userId" },
      { path: "shippingAddress" },
    ]);

    // socket notify
    const io = req.app.get("io");
    if (io) io.emit("newOrder", populatedOrder);

    return res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
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

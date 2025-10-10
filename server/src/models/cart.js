const moongoose = require("mongoose");

const cartSchema = new moongoose.Schema(
  {
    userId: {
      type: moongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    products: [
      {
        productId: {
          type: moongoose.Schema.Types.ObjectId,
          ref: "Product",
          require: true,
        },
        quantity: { type: Number, default: 1 },
        additions: [
          { type: moongoose.Schema.Types.ObjectId, ref: "additions" },
        ],
        isSpicy: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);
const cart = moongoose.model("cart", cartSchema);
module.exports = cart;

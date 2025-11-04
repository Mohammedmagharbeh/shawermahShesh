const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // capitalized for consistency with model name
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: { type: Number, default: 1, min: 1 },

        additions: [
          {
            name: {
              ar: { type: String, required: true },
              en: { type: String, required: true },
            },
            price: { type: Number, required: true, min: 0 },
          },
        ],
        isSpicy: { type: Boolean, default: false },
        notes: { type: String, default: "" },

        selectedProtein: {
          type: String,
          enum: ["chicken", "meat", null],
        },
        selectedType: {
          type: String,
          enum: ["sandwich", "meal", null],
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);

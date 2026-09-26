const mongoose = require("mongoose");

const savedCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    recurring_init_trans_id: { type: String, required: true },
    recurring_token: { type: String, required: true },
    card_token: { type: String },
    card_brand: { type: String },
    card_last_4: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const SavedCard = mongoose.model("SavedCard", savedCardSchema);
module.exports = SavedCard;

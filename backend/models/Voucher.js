const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    brand: { type: String, required: true, trim: true },
    code: { type: String, trim: true, select: false },
    pin: { type: String, trim: true, select: false },
    value: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date },
    isRedeemed: { type: Boolean, default: false },
    redeemedAmount: { type: Number, default: 0 },
    notes: { type: String, trim: true },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);

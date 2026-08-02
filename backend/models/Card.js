const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bank: { type: String, required: true, trim: true },
    cardName: { type: String, trim: true },
    cardType: { type: String, enum: ["Credit", "Debit", "Prepaid"], required: true },
    network: { type: String, enum: ["Visa", "Mastercard", "RuPay", "Amex", "Other"], default: "Other" },
    last4: { type: String, required: true, minlength: 4, maxlength: 4 },
    cardNumber: { type: String, select: false },
    cvv: { type: String, select: false },
    cardHolder: { type: String, trim: true },
    expiryMonth: { type: Number, min: 1, max: 12 },
    expiryYear: { type: Number },
    nickname: { type: String, trim: true },
    color: { type: String, default: "#7c3aed" },
    notes: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

cardSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model("Card", cardSchema);

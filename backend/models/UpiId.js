const mongoose = require("mongoose");

const upiSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true, trim: true },
    upiId: { type: String, required: true, trim: true },
    accountName: { type: String, trim: true },
    bank: { type: String, trim: true },
    app: { type: String, enum: ["GPay", "PhonePe", "Paytm", "BHIM", "Other"], default: "Other" },
    notes: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UpiId", upiSchema);

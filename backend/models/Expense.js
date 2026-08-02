const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    merchant: { type: String, required: true, trim: true },
    merchantIcon: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, default: "Shopping" },
    note: { type: String, trim: true },
    isRecurring: { type: Boolean, default: false },
    recurrenceInterval: { type: String, enum: ["weekly", "monthly", "yearly", null], default: null },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);

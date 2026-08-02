const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    site: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
    username: { type: String, trim: true },
    password: { type: String, required: true },
    notes: { type: String, trim: true },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Password", passwordSchema);

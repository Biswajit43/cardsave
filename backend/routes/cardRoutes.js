const express = require("express");
const Card = require("../models/Card");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// Best-effort network detection from a card number's leading digits (IIN ranges).
function detectNetwork(cardNumber = "") {
  const n = cardNumber.replace(/\s+/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^(60|65|81|82|508)/.test(n)) return "RuPay";
  return "Other";
}

// GET /api/cards  ?type=Credit&search=hdfc
router.get("/", async (req, res, next) => {
  try {
    const { type, search } = req.query;
    const query = { user: req.user._id };
    if (type && type !== "All") query.cardType = type;
    if (search) {
      query.$or = [
        { bank: { $regex: search, $options: "i" } },
        { last4: { $regex: search, $options: "i" } },
        { nickname: { $regex: search, $options: "i" } },
      ];
    }
    const cards = await Card.find(query).sort({ createdAt: -1 });
    res.json({ cards, count: cards.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/cards
router.post("/", async (req, res, next) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    if (payload.cardNumber) {
      const digits = String(payload.cardNumber).replace(/\s+/g, "");
      payload.last4 = payload.last4 || digits.slice(-4);
      payload.network = payload.network && payload.network !== "Other" ? payload.network : detectNetwork(digits);
    }
    const card = await Card.create(payload);
    const safeCard = card.toObject();
    delete safeCard.cardNumber;
    delete safeCard.cvv;
    res.status(201).json({ card: safeCard });
  } catch (err) {
    next(err);
  }
});

// POST /api/cards/:id/reveal  { password } -> full card number, CVV, holder name
router.post("/:id/reveal", async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });
    const user = await User.findById(req.user._id).select("+password");
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Incorrect password" });

    const card = await Card.findOne({ _id: req.params.id, user: req.user._id }).select("+cardNumber +cvv");
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json({
      cardNumber: card.cardNumber || `•••• •••• •••• ${card.last4}`,
      cvv: card.cvv || null,
      cardHolder: card.cardHolder || "",
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/cards/:id
router.get("/:id", async (req, res, next) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json({ card });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cards/:id
router.put("/:id", async (req, res, next) => {
  try {
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json({ card });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cards/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json({ message: "Card deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

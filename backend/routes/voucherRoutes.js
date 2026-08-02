const express = require("express");
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// POST /api/vouchers/:id/reveal  { password } -> code, pin
router.post("/:id/reveal", async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });
    const user = await User.findById(req.user._id).select("+password");
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Incorrect password" });

    const voucher = await Voucher.findOne({ _id: req.params.id, user: req.user._id }).select("+code +pin");
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });
    res.json({ code: voucher.code || "", pin: voucher.pin || "" });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const vouchers = await Voucher.find({ user: req.user._id }).sort({ createdAt: -1 });
    const active = vouchers.filter((v) => !v.isRedeemed);
    const activeWorth = active.reduce((sum, v) => sum + v.balance, 0);
    const lifetimeRedeemed = vouchers.reduce((sum, v) => sum + (v.redeemedAmount || 0), 0);
    res.json({
      vouchers,
      count: vouchers.length,
      summary: {
        activeWorth,
        activeCount: active.length,
        lifetimeRedeemed,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    if (payload.balance === undefined) payload.balance = payload.value;
    const voucher = await Voucher.create(payload);
    res.status(201).json({ voucher });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const voucher = await Voucher.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });
    res.json({ voucher });
  } catch (err) {
    next(err);
  }
});

// POST /api/vouchers/:id/redeem  { amount }
router.post("/:id/redeem", async (req, res, next) => {
  try {
    const voucher = await Voucher.findOne({ _id: req.params.id, user: req.user._id });
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });
    const amount = Number(req.body.amount) || voucher.balance;
    voucher.balance = Math.max(0, voucher.balance - amount);
    voucher.redeemedAmount = (voucher.redeemedAmount || 0) + amount;
    if (voucher.balance === 0) voucher.isRedeemed = true;
    await voucher.save();
    res.json({ voucher });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const voucher = await Voucher.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });
    res.json({ message: "Voucher deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require("express");
const { protect } = require("../middleware/auth");
const Card = require("../models/Card");
const UpiId = require("../models/UpiId");
const Voucher = require("../models/Voucher");
const Password = require("../models/Password");

const router = express.Router();
router.use(protect);

// GET /api/dashboard/summary
router.get("/summary", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [cardCount, upiCount, voucherCount, passwordCount, cards, upiIds, vouchers, passwords] =
      await Promise.all([
        Card.countDocuments({ user: userId }),
        UpiId.countDocuments({ user: userId }),
        Voucher.countDocuments({ user: userId }),
        Password.countDocuments({ user: userId }),
        Card.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
        UpiId.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
        Voucher.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select("-code -pin"),
        Password.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select("-password"),
      ]);

    const recent = [
      ...cards.map((c) => ({ type: "card", id: c._id, label: `${c.bank} •••• ${c.last4}`, createdAt: c.createdAt })),
      ...upiIds.map((u) => ({ type: "upi", id: u._id, label: u.label, createdAt: u.createdAt })),
      ...vouchers.map((v) => ({ type: "voucher", id: v._id, label: v.brand, createdAt: v.createdAt })),
      ...passwords.map((p) => ({ type: "password", id: p._id, label: p.site, createdAt: p.createdAt })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    res.json({
      counts: { cards: cardCount, upiIds: upiCount, vouchers: voucherCount, passwords: passwordCount },
      recent,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

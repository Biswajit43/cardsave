const express = require("express");
const { protect } = require("../middleware/auth");
const Card = require("../models/Card");
const UpiId = require("../models/UpiId");
const Voucher = require("../models/Voucher");
const Expense = require("../models/Expense");
const Password = require("../models/Password");

const router = express.Router();
router.use(protect);

// GET /api/backup/export - full JSON backup of the user's vault
router.get("/export", async (req, res, next) => {
  try {
    const [cards, upiIds, vouchers, expenses, passwords] = await Promise.all([
      Card.find({ user: req.user._id }).select("+cardNumber +cvv"),
      UpiId.find({ user: req.user._id }),
      Voucher.find({ user: req.user._id }).select("+code +pin"),
      Expense.find({ user: req.user._id }),
      Password.find({ user: req.user._id }).select("+password"),
    ]);
    res.json({
      exportedAt: new Date().toISOString(),
      vaultName: req.user.vaultName,
      cards,
      upiIds,
      vouchers,
      expenses,
      passwords,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/backup/import - restore from a previously exported JSON backup
router.post("/import", async (req, res, next) => {
  try {
    const { cards = [], upiIds = [], vouchers = [], expenses = [], passwords = [] } = req.body;
    const strip = (doc) => {
      const { _id, user, __v, ...rest } = doc;
      return { ...rest, user: req.user._id };
    };
    const [c, u, v, e, p] = await Promise.all([
      cards.length ? Card.insertMany(cards.map(strip)) : [],
      upiIds.length ? UpiId.insertMany(upiIds.map(strip)) : [],
      vouchers.length ? Voucher.insertMany(vouchers.map(strip)) : [],
      expenses.length ? Expense.insertMany(expenses.map(strip)) : [],
      passwords.length ? Password.insertMany(passwords.map(strip)) : [],
    ]);
    res.json({
      message: "Backup restored successfully",
      restored: { cards: c.length, upiIds: u.length, vouchers: v.length, expenses: e.length, passwords: p.length },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

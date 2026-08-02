const express = require("express");
const Expense = require("../models/Expense");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

// GET /api/expenses  ?tab=recent|smart|recurring
router.get("/", async (req, res, next) => {
  try {
    const { tab } = req.query;
    const query = { user: req.user._id };
    if (tab === "recurring") query.isRecurring = true;
    const sort = { date: -1 };
    const limit = tab === "recent" ? 20 : 0;
    let cursor = Expense.find(query).sort(sort);
    if (limit) cursor = cursor.limit(limit);
    const expenses = await cursor;
    res.json({ expenses, count: expenses.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/summary
router.get("/summary", async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    const [todayExpenses, monthExpenses] = await Promise.all([
      Expense.find({ user: req.user._id, date: { $gte: todayStart } }),
      Expense.find({ user: req.user._id, date: { $gte: monthStart } }),
    ]);

    const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);
    const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

    const merchantTotals = {};
    todayExpenses.forEach((e) => {
      merchantTotals[e.merchant] = (merchantTotals[e.merchant] || 0) + e.amount;
    });
    let topMerchant = null;
    let topAmount = 0;
    Object.entries(merchantTotals).forEach(([merchant, amount]) => {
      if (amount > topAmount) {
        topMerchant = merchant;
        topAmount = amount;
      }
    });

    res.json({
      today: { total: todayTotal, count: todayExpenses.length },
      month: { total: monthTotal, count: monthExpenses.length },
      topToday: topMerchant ? { merchant: topMerchant, amount: topAmount } : null,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id });
    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ expense });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

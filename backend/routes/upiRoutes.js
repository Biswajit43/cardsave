const express = require("express");
const UpiId = require("../models/UpiId");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const HANDLE_MAP = [
  { re: /@(ok)?(hdfc|icici|sbi|axis|okaxis|okhdfcbank|okicici|oksbi)bank$/i, app: "GPay" },
  { re: /@(okhdfcbank|okicici|oksbi|okaxis|okbizaxis)$/i, app: "GPay" },
  { re: /@ybl$/i, app: "PhonePe" },
  { re: /@ibl$/i, app: "PhonePe" },
  { re: /@axl$/i, app: "PhonePe" },
  { re: /@paytm$/i, app: "Paytm" },
  { re: /@upi$/i, app: "BHIM" },
];

function detectApp(upiId = "") {
  for (const { re, app } of HANDLE_MAP) {
    if (re.test(upiId)) return app;
  }
  return "Other";
}

router.get("/", async (req, res, next) => {
  try {
    const { app } = req.query;
    const query = { user: req.user._id };
    if (app && app !== "All") query.app = app;
    const upiIds = await UpiId.find(query).sort({ createdAt: -1 });
    res.json({ upiIds, count: upiIds.length });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    if (!payload.app || payload.app === "Other") {
      payload.app = detectApp(payload.upiId);
    }
    const upi = await UpiId.create(payload);
    res.status(201).json({ upi });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const upi = await UpiId.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!upi) return res.status(404).json({ message: "UPI ID not found" });
    res.json({ upi });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const upi = await UpiId.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!upi) return res.status(404).json({ message: "UPI ID not found" });
    res.json({ message: "UPI ID deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require("express");
const Password = require("../models/Password");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// GET /api/passwords  ?search=
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { user: req.user._id };
    if (search) {
      query.$or = [
        { site: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
      ];
    }
    // Never send the stored password in the list view — reveal is a separate,
    // password-gated call.
    const passwords = await Password.find(query).select("-password").sort({ createdAt: -1 });
    res.json({ passwords, count: passwords.length });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const entry = await Password.create({ ...req.body, user: req.user._id });
    const safe = entry.toObject();
    delete safe.password;
    res.status(201).json({ password: safe });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const entry = await Password.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).select("-password");
    if (!entry) return res.status(404).json({ message: "Password entry not found" });
    res.json({ password: entry });
  } catch (err) {
    next(err);
  }
});

// POST /api/passwords/:id/reveal  { password: loginPassword }
router.post("/:id/reveal", async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });
    const user = await User.findById(req.user._id).select("+password");
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Incorrect password" });

    const entry = await Password.findOne({ _id: req.params.id, user: req.user._id }).select("+password");
    if (!entry) return res.status(404).json({ message: "Password entry not found" });
    res.json({ password: entry.password });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const entry = await Password.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: "Password entry not found" });
    res.json({ message: "Password entry deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

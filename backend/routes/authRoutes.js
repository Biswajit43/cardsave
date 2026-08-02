const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Card = require("../models/Card");
const { protect } = require("../middleware/auth");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  vaultName: user.vaultName,
  theme: user.theme,
  telegramChatId: user.telegramChatId,
  pushNotifications: user.pushNotifications,
  createdAt: user.createdAt,
});

// @route POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({
      token: signToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({
      token: signToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/auth/me
router.get("/me", protect, async (req, res, next) => {
  try {
    const cardCount = await Card.countDocuments({ user: req.user._id });
    res.json({ user: sanitizeUser(req.user), cardCount, members: 1 });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/auth/profile
router.put("/profile", protect, async (req, res, next) => {
  try {
    const { name, vaultName, theme, pushNotifications, telegramChatId } = req.body;
    if (name !== undefined) req.user.name = name;
    if (vaultName !== undefined) req.user.vaultName = vaultName;
    if (theme !== undefined) req.user.theme = theme;
    if (telegramChatId !== undefined) req.user.telegramChatId = telegramChatId;
    if (pushNotifications !== undefined) {
      req.user.pushNotifications = { ...req.user.pushNotifications, ...pushNotifications };
    }
    await req.user.save();
    res.json({ user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/auth/password
router.put("/password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/auth/verify-password
// Re-checks the account login password. Used to gate reveal of sensitive
// data (full card numbers, CVVs, voucher codes, saved passwords) without
// introducing a second password system.
router.post("/verify-password", protect, async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });
    const user = await User.findById(req.user._id).select("+password");
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ verified: false, message: "Incorrect password" });
    res.json({ verified: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

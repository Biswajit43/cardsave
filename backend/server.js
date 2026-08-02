require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const cardRoutes = require("./routes/cardRoutes");
const upiRoutes = require("./routes/upiRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const backupRoutes = require("./routes/backupRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Batua API", version: "2.0.0" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/upi", upiRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/passwords", passwordRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Batua] API server running on port ${PORT}`);
});

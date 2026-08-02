const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Batua";
    await mongoose.connect(uri);
    console.log("[Batua] MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("[Batua] MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

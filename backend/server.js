const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

// =======================
// ✅ CORS CONFIGURATION
// =======================
app.use(cors({
  origin: "*", // allow all during dev
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// =======================
// ✅ CONNECT TO MONGODB ATLAS
// =======================
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is required. Please set it in your .env file");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to MongoDB Atlas`);
    console.log(`📦 Database: ${dbName}`);
    console.log(`📋 Collection: users`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// =======================
// ✅ USER SCHEMA
// =======================
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

// =======================
// ✅ JWT HELPERS
// =======================
const createToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
};

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// =======================
// ✅ AUTH ROUTES
// =======================

// ✅ SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    console.log(`✅ New user created: ${newUser.email} (ID: ${newUser._id})`);
    const token = createToken(newUser);
    res.status(201).json({ token, user: newUser.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ✅ LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = createToken(user);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ GET CURRENT USER
app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ✅ LOGOUT
app.post("/api/auth/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Server Running" });
});

// =======================
// ✅ START SERVER (AFTER MONGODB CONNECTS)
// =======================
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};

startServer();

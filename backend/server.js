require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const roleMiddleware = require("./middleware/roleMiddleware");
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

// =======================
// ✅ CORS CONFIGURATION
// =======================
app.use(cors()); // Allow all origins by default for debugging

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

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
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient"
    }
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
// ✅ APPOINTMENT SCHEMA
// =======================
const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorName: { type: String, required: true },
    specialization: { type: String, default: "" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

// =======================
// ✅ JWT HELPERS
// =======================
const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log('❌ No token in authorization header');
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user with role from both token and database
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || decoded.role
    };
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// =======================
// ✅ AUTH ROUTES
// =======================

// ✅ SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Validate role if provided
    const allowedRoles = ["patient", "doctor", "admin"];
    const userRole = role && allowedRoles.includes(role) ? role : "patient";

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole
    });

    console.log(`✅ New user created: ${newUser.email} (ID: ${newUser._id}, Role: ${newUser.role})`);
    const token = createToken(newUser);
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
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
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ GET CURRENT USER
app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
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
// ✅ ROLE-BASED PROTECTED ROUTES
// =======================

// ✅ ADMIN-ONLY ROUTE
app.get("/api/admin/dashboard", authenticateToken, roleMiddleware(["admin"]), (req, res) => {
  res.json({
    message: "Welcome to Admin Dashboard",
    user: req.user,
    data: "Admin-only content here"
  });
});

// =======================
// ✅ ADMIN USER MANAGEMENT ROUTES
// =======================

// ✅ GET ALL USERS (Admin only)
app.get("/api/admin/users", authenticateToken, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ PROMOTE USER TO DOCTOR (Admin only)
app.put("/api/admin/make-doctor/:userId", authenticateToken, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow promoting patients to doctor
    if (user.role !== "patient") {
      return res.status(400).json({
        message: `Cannot promote user. Current role is "${user.role}". Only patients can be promoted to doctor.`
      });
    }

    user.role = "doctor";
    await user.save();

    console.log(`✅ User ${user.email} promoted to doctor by admin ${req.user.email}`);

    res.json({
      message: "User promoted to doctor successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error promoting user:", err);
    res.status(500).json({ message: "Failed to promote user" });
  }
});

// ✅ DOCTOR-ONLY ROUTE
app.get("/api/doctor/dashboard", authenticateToken, roleMiddleware(["doctor"]), (req, res) => {
  res.json({
    message: "Welcome to Doctor Dashboard",
    user: req.user,
    data: "Doctor-only content here"
  });
});

// ✅ PATIENT-ONLY ROUTE
app.get("/api/patient/dashboard", authenticateToken, roleMiddleware(["patient"]), (req, res) => {
  res.json({
    message: "Welcome to Patient Dashboard",
    user: req.user,
    data: "Patient-only content here"
  });
});

// ✅ DOCTOR & ADMIN ROUTE
app.get("/api/medical/records", authenticateToken, roleMiddleware(["doctor", "admin"]), (req, res) => {
  res.json({
    message: "Medical Records Access",
    user: req.user,
    data: "Doctors and Admins can access this"
  });
});

// =======================
// ✅ APPOINTMENT ROUTES
// =======================

// ✅ CREATE APPOINTMENT (Patient only)
app.post("/api/appointments", authenticateToken, roleMiddleware(["patient"]), async (req, res) => {
  try {
    console.log('📥 POST /api/appointments - Request received');
    console.log('📥 Request body:', req.body);
    console.log('📥 User:', req.user);

    const { doctor, doctorName, specialization, date, time, reason } = req.body;

    if ((!doctor && !doctorName) || !date || !time || !reason) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ message: "Doctor, date, time, and reason are required" });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorName: doctorName || doctor || "Unknown Doctor",
      specialization: specialization || "",
      date,
      time,
      reason,
      status: "pending"
    });

    console.log(`✅ Appointment created: ${appointment._id} by patient ${req.user.email}`);

    res.status(201).json({
      message: "Appointment created successfully",
      appointment
    });
  } catch (err) {
    console.error("❌ Error creating appointment:", err);
    res.status(500).json({ message: "Failed to create appointment", error: err.message });
  }
});

// ✅ GET PATIENT APPOINTMENTS (Patient only)
app.get("/api/appointments", authenticateToken, roleMiddleware(["patient"]), async (req, res) => {
  try {
    const url = require('url');
    const parsedUrl = url.parse(req.url, true);
    const page = parseInt(parsedUrl.query.page) || parseInt(req.query.page) || 1;
    const limit = parseInt(parsedUrl.query.limit) || parseInt(req.query.limit) || 5;
    const tab = parsedUrl.query.tab || req.query.tab || 'upcoming';
    const search = parsedUrl.query.search || req.query.search || '';
    const skip = (page - 1) * limit;

    console.log(`🔍 GET /api/appointments - Tab: ${tab}, Search: "${search}", Page: ${page}`);

    let query = { patientId: req.user.id };

    if (search) {
      query.doctorName = { $regex: search, $options: 'i' };
    }
    const today = new Date().toISOString().split('T')[0];

    if (tab === 'upcoming') {
      query.status = 'confirmed'; // Only confirmed for upcoming
      // Optional: Filter out past dates if strictly "upcoming"
      // query.date = { $gte: today }; 
    } else if (tab === 'pending') {
      query.status = 'pending'; // New pending tab
    } else if (tab === 'cancelled') {
      query.status = 'cancelled';
    } else if (tab === 'past') {
      // For past, we might want to include completed (confirmed + past date) or just past date
      // Let's stick to simple date logic for 'past' tab to match previous frontend logic
      query.date = { $lt: today };
    } else if (tab === 'all') {
      // No status filter, return everything
    }


    const totalAppointments = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(totalAppointments / limit);

    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 }) // Sort by appointment date (Earliest to Latest)
      .skip(skip)
      .limit(limit);

    res.json({
      appointments,
      currentPage: page,
      totalPages,
      totalAppointments
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// ✅ GET SINGLE APPOINTMENT (Patient only)
app.get("/api/appointments/:id", authenticateToken, roleMiddleware(["patient"]), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ appointment });
  } catch (err) {
    console.error("Error fetching appointment:", err);
    res.status(500).json({ message: "Failed to fetch appointment" });
  }
});

// ✅ DELETE APPOINTMENT (Patient only)
app.delete("/api/appointments/:id", authenticateToken, roleMiddleware(["patient"]), async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      patientId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or not authorized" });
    }

    console.log(`✅ Appointment ${req.params.id} deleted by patient ${req.user.email}`);
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
});

// ✅ CANCEL APPOINTMENT (Patient only)
app.put("/api/appointments/:id/cancel", authenticateToken, roleMiddleware(["patient"]), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    console.log(`✅ Appointment ${req.params.id} cancelled by patient ${req.user.email}`);
    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ message: "Failed to cancel appointment" });
  }
});

// ✅ GET DOCTOR APPOINTMENTS (Doctor only)
app.get("/api/doctor/appointments", authenticateToken, roleMiddleware(["doctor"]), async (req, res) => {
  try {
    // Filter by doctorName matches the logged-in user's name
    const appointments = await Appointment.find({
      doctorName: req.user.name
    }).sort({ createdAt: -1 });

    res.json({ appointments });
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// ✅ UPDATE APPOINTMENT STATUS (Doctor & Admin)
app.put("/api/appointments/:id/status", authenticateToken, roleMiddleware(["doctor", "admin"]), async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["pending", "confirmed", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    console.log(`✅ Appointment ${id} status updated to ${status} by ${req.user.email}`);
    res.json({ message: "Status updated successfully", appointment });
  } catch (err) {
    console.error("Error updating appointment status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// ✅ DEBUG: LIST ALL USERS (for testing)
app.get("/api/debug/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const count = await User.countDocuments();
    res.json({
      count,
      users,
      database: mongoose.connection.db.databaseName,
      collection: "users"
    });
  } catch (err) {
    console.error("Debug endpoint error:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
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

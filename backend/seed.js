require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

const User = mongoose.model("User", userSchema);

const seedUsers = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("❌ MONGODB_URI is required");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const users = [
            {
                name: "Dr. Sarah Johnson",
                email: "doctor@example.com",
                password: "password123",
                role: "doctor"
            },
            {
                name: "Admin User",
                email: "admin@example.com",
                password: "password123",
                role: "admin"
            }
        ];

        for (const user of users) {
            const existing = await User.findOne({ email: user.email });
            if (existing) {
                console.log(`⚠️ User ${user.email} already exists`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(user.password, 10);
            await User.create({ ...user, password: hashedPassword });
            console.log(`✅ Created user: ${user.email} (${user.role})`);
        }

        console.log("🎉 Seeding completed!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedUsers();

/**
 * seedUsers.js — Create demo test accounts for CaféSpot
 *
 * Run once from the backend folder:
 *   node seedUsers.js
 *
 * Creates (or re-uses if already present):
 *   - explorer@cafespot.dev  / explorer123  (role: visitor)
 *   - owner@cafespot.dev     / owner123     (role: owner)
 *   - admin@cafespot.dev     / admin123     (role: admin)
 */

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const User = require("./models/User");

const testUsers = [
  {
    name:     "Alex Explorer",
    email:    "explorer@cafespot.dev",
    password: "explorer123",
    role:     "visitor",
  },
  {
    name:     "Maya Owner",
    email:    "owner@cafespot.dev",
    password: "owner123",
    role:     "owner",
  },
  {
    name:     "CaféSpot Admin",
    email:    "admin@cafespot.dev",
    password: "admin123",
    role:     "admin",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    for (const u of testUsers) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`⚡ Already exists — skipping: ${u.email}`);
        continue;
      }
      await User.create(u); // pre-save hook hashes the password
      console.log(`✅ Created [${u.role.padEnd(7)}] ${u.name} <${u.email}>`);
    }

    console.log("\n──────────────────────────────────────────");
    console.log("  Demo credentials");
    console.log("──────────────────────────────────────────");
    console.log("  Explorer  explorer@cafespot.dev / explorer123");
    console.log("  Owner     owner@cafespot.dev    / owner123");
    console.log("  Admin     admin@cafespot.dev    / admin123");
    console.log("──────────────────────────────────────────\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seed();

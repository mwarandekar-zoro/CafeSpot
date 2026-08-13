/**
 * seed.js — Populate MongoDB with sample cafes for testing Phase 3.
 *
 * Run ONCE from the backend folder:
 *   node seed.js
 *
 * ⚠️  This will clear all existing cafes and add fresh sample data.
 *     Do NOT run in production.
 */

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const User = require("./models/User");
const Cafe = require("./models/Cafe");

const seedCafes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ── Find or create a seed user to be the cafe creator ──────
    let seedUser = await User.findOne({ email: "seed@cafespot.dev" });
    if (!seedUser) {
      seedUser = await User.create({
        name:     "CaféSpot Admin",
        email:    "seed@cafespot.dev",
        password: "seedpass123",
        role:     "admin",
      });
      console.log("👤 Seed user created:", seedUser.email);
    }

    // ── Clear existing cafes ────────────────────────────────────
    await Cafe.deleteMany({});
    console.log("🗑️  Cleared existing cafes");

    // ── Insert sample cafes ─────────────────────────────────────
    const sampleCafes = [
      {
        name: "Brew Theory",
        description:
          "A sleek, modern café known for its single-origin pour-overs and minimalist aesthetic. Perfect for deep work sessions with fast Wi-Fi and a whisper-quiet atmosphere.",
        location: "Bangalore",
        address:  "12, Lavelle Road, Bangalore - 560001",
        category: "Work",
        priceRange: "$$",
        images: [
          "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
        ],
        features: ["Wi-Fi", "Power Outlets", "Quiet Zone", "Parking"],
        averageRating: 4.7,
        reviewCount:   28,
        ratings: {
          coffee:    4.9,
          food:      4.1,
          ambience:  4.8,
          wifi:      4.9,
          quietness: 4.6,
          value:     4.2,
        },
        createdBy: seedUser._id,
      },
      {
        name: "The Bean House",
        description:
          "A cozy neighbourhood café with warm lighting, wooden interiors, and comfort food that pairs perfectly with their creamy lattes. The go-to spot for a relaxed evening.",
        location: "Mumbai",
        address:  "34, Hill Road, Bandra West, Mumbai - 400050",
        category: "Chill",
        priceRange: "$$",
        images: [
          "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
        ],
        features: ["Wi-Fi", "Outdoor Seating", "Pet Friendly"],
        averageRating: 4.4,
        reviewCount:   42,
        ratings: {
          coffee:    4.5,
          food:      4.6,
          ambience:  4.7,
          wifi:      4.0,
          quietness: 3.8,
          value:     4.5,
        },
        createdBy: seedUser._id,
      },
      {
        name: "Dark Roast Studio",
        description:
          "Industrial-chic space with exposed brick walls and jazz on the speakers. Best espresso in town. A popular date spot with couples and creative professionals alike.",
        location: "Pune",
        address:  "7, Koregaon Park, Pune - 411001",
        category: "Date",
        priceRange: "$$$",
        images: [
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
        ],
        features: ["No Wi-Fi", "Live Music", "Reservations Available"],
        averageRating: 4.6,
        reviewCount:   19,
        ratings: {
          coffee:    4.8,
          food:      4.7,
          ambience:  4.9,
          wifi:      1.0,
          quietness: 3.5,
          value:     3.9,
        },
        createdBy: seedUser._id,
      },
      {
        name: "Grind & Study",
        description:
          "A student favourite. Long opening hours, affordable prices, reliable Wi-Fi, and enough silence to actually get work done. Simple menu, great coffee.",
        location: "Delhi",
        address:  "5, Hauz Khas Village, New Delhi - 110016",
        category: "Study",
        priceRange: "$",
        images: [
          "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800",
        ],
        features: ["Wi-Fi", "Power Outlets", "24/7", "Affordable"],
        averageRating: 4.2,
        reviewCount:   67,
        ratings: {
          coffee:    4.0,
          food:      3.8,
          ambience:  4.0,
          wifi:      4.8,
          quietness: 4.5,
          value:     4.9,
        },
        createdBy: seedUser._id,
      },
      {
        name: "Roastery Republic",
        description:
          "Award-winning micro-roastery and café. Passionate baristas, exciting seasonal menus, and coffee flights for the true enthusiast. Slightly pricey but worth every sip.",
        location: "Hyderabad",
        address:  "21, Jubilee Hills, Hyderabad - 500033",
        category: "Coffee",
        priceRange: "$$$",
        images: [
          "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=800",
        ],
        features: ["Wi-Fi", "Coffee Workshops", "Specialty Beans"],
        averageRating: 4.9,
        reviewCount:   35,
        ratings: {
          coffee:    5.0,
          food:      4.5,
          ambience:  4.8,
          wifi:      4.2,
          quietness: 4.3,
          value:     3.7,
        },
        createdBy: seedUser._id,
      },
      {
        name: "Pocket Brew",
        description:
          "Great food, good coffee, and honest prices. No frills, no nonsense. The kind of café your wallet will thank you for.",
        location: "Chennai",
        address:  "88, Anna Nagar, Chennai - 600040",
        category: "Budget",
        priceRange: "$",
        images: [
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
        ],
        features: ["Wi-Fi", "Takeaway", "Parking"],
        averageRating: 4.0,
        reviewCount:   55,
        ratings: {
          coffee:    4.1,
          food:      4.3,
          ambience:  3.6,
          wifi:      3.9,
          quietness: 3.7,
          value:     5.0,
        },
        createdBy: seedUser._id,
      },
    ];

    const created = await Cafe.insertMany(sampleCafes);
    console.log(`☕ ${created.length} sample cafes inserted`);

    await mongoose.disconnect();
    console.log("✅ Seeding complete. MongoDB disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedCafes();

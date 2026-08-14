/**
 * seed.js — Populate MongoDB with Mumbai café data.
 *
 * Run from the backend folder:
 *   node seed.js
 *
 * ⚠️  Clears all existing cafes before inserting fresh data.
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

    // ── Find or create seed user ────────────────────────────────
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

    // ── 14 Mumbai cafes ─────────────────────────────────────────
    const sampleCafes = [

      // ── 1. Bandra West ─────────────────────────────────────────
      {
        name: "The Bean House",
        description:
          "A cosy neighbourhood café with warm Edison bulbs, reclaimed-wood tables, and creamy lattes that feel like a hug. Bandra's favourite evening hangout — lively yet relaxed.",
        location: "Mumbai",
        address:  "34, Hill Road, Bandra West, Mumbai – 400050",
        lat: 19.0596,
        lng: 72.8295,
        category: "Chill",
        priceRange: "$$",
        images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"],
        features: ["Wi-Fi", "Outdoor Seating", "Pet Friendly", "Parking"],
        averageRating: 4.4,
        reviewCount:   42,
        ratings: { coffee: 4.5, food: 4.6, ambience: 4.7, wifi: 4.0, quietness: 3.8, value: 4.5 },
        createdBy: seedUser._id,
      },

      // ── 2. Colaba ───────────────────────────────────────────────
      {
        name: "Brew Theory",
        description:
          "A sleek Colaba gem known for single-origin pour-overs and a minimalist aesthetic. The regulars are architects, writers, and laptop warriors who need fast Wi-Fi and zero distractions.",
        location: "Mumbai",
        address:  "8, Mandlik Road, Colaba, Mumbai – 400001",
        lat: 18.9067,
        lng: 72.8147,
        category: "Work",
        priceRange: "$$",
        images: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800"],
        features: ["Wi-Fi", "Power Outlets", "Quiet Zone", "AC"],
        averageRating: 4.7,
        reviewCount:   28,
        ratings: { coffee: 4.9, food: 4.1, ambience: 4.8, wifi: 4.9, quietness: 4.6, value: 4.2 },
        createdBy: seedUser._id,
      },

      // ── 3. Lower Parel ─────────────────────────────────────────
      {
        name: "Dark Roast Studio",
        description:
          "Industrial-chic space in Lower Parel's mill district — exposed brick, jazz on the speakers, and the best espresso south of Bandra. A go-to for dates and creative catch-ups.",
        location: "Mumbai",
        address:  "Kamala Mills Compound, Lower Parel, Mumbai – 400013",
        lat: 19.0178,
        lng: 72.8278,
        category: "Date",
        priceRange: "$$$",
        images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"],
        features: ["Live Music", "Reservations Available", "Craft Cocktails", "AC"],
        averageRating: 4.6,
        reviewCount:   19,
        ratings: { coffee: 4.8, food: 4.7, ambience: 4.9, wifi: 1.0, quietness: 3.5, value: 3.9 },
        createdBy: seedUser._id,
      },

      // ── 4. Andheri West ─────────────────────────────────────────
      {
        name: "Grind & Study",
        description:
          "Andheri's no-frills student hub — long hours, affordable prices, rock-solid Wi-Fi, and enough silence to actually finish your assignment. Nothing fancy; just what you need.",
        location: "Mumbai",
        address:  "Versova Road, Andheri West, Mumbai – 400053",
        lat: 19.1197,
        lng: 72.8264,
        category: "Study",
        priceRange: "$",
        images: ["https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800"],
        features: ["Wi-Fi", "Power Outlets", "24/7", "Affordable"],
        averageRating: 4.2,
        reviewCount:   67,
        ratings: { coffee: 4.0, food: 3.8, ambience: 4.0, wifi: 4.8, quietness: 4.5, value: 4.9 },
        createdBy: seedUser._id,
      },

      // ── 5. Juhu ─────────────────────────────────────────────────
      {
        name: "Roastery Republic",
        description:
          "Award-winning micro-roastery steps from Juhu Beach. Passionate baristas, seasonal coffee flights, and a view that makes every sip taste better. Slightly premium but absolutely worth it.",
        location: "Mumbai",
        address:  "14, JVPD Scheme, Juhu, Mumbai – 400049",
        lat: 19.1075,
        lng: 72.8263,
        category: "Coffee",
        priceRange: "$$$",
        images: ["https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=800"],
        features: ["Wi-Fi", "Coffee Workshops", "Specialty Beans", "Outdoor Seating"],
        averageRating: 4.9,
        reviewCount:   35,
        ratings: { coffee: 5.0, food: 4.5, ambience: 4.8, wifi: 4.2, quietness: 4.3, value: 3.7 },
        createdBy: seedUser._id,
      },

      // ── 6. Santacruz West ────────────────────────────────────────
      {
        name: "Pocket Brew",
        description:
          "Great food, honest coffee, and prices your wallet will thank you for. No frills, no nonsense — just a reliable Santacruz staple for students and young professionals.",
        location: "Mumbai",
        address:  "Linking Road, Santacruz West, Mumbai – 400054",
        lat: 19.0833,
        lng: 72.8426,
        category: "Budget",
        priceRange: "$",
        images: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"],
        features: ["Wi-Fi", "Takeaway", "Vegan Options", "AC"],
        averageRating: 4.0,
        reviewCount:   55,
        ratings: { coffee: 4.1, food: 4.3, ambience: 3.6, wifi: 3.9, quietness: 3.7, value: 5.0 },
        createdBy: seedUser._id,
      },

      // ── 7. Powai ─────────────────────────────────────────────────
      {
        name: "Lakeside Latte",
        description:
          "Perched on Powai's lakefront, Lakeside Latte offers stunning water views, quiet corners, and an excellent all-day breakfast menu. The perfect backdrop for deep work or a slow Sunday.",
        location: "Mumbai",
        address:  "Hiranandani Gardens, Powai, Mumbai – 400076",
        lat: 19.1176,
        lng: 72.9060,
        category: "Chill",
        priceRange: "$$",
        images: ["https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800"],
        features: ["Wi-Fi", "Lake View", "Outdoor Seating", "All-Day Breakfast"],
        averageRating: 4.5,
        reviewCount:   38,
        ratings: { coffee: 4.4, food: 4.7, ambience: 4.9, wifi: 4.1, quietness: 4.6, value: 4.0 },
        createdBy: seedUser._id,
      },

      // ── 8. Khar West ─────────────────────────────────────────────
      {
        name: "The Quiet Cup",
        description:
          "A hushed reading-room café in Khar that enforces a low-noise policy. No calls, no loud music — just great cold brew, books on the shelf, and a genuinely peaceful atmosphere.",
        location: "Mumbai",
        address:  "14th Road, Khar West, Mumbai – 400052",
        lat: 19.0728,
        lng: 72.8353,
        category: "Study",
        priceRange: "$$",
        images: ["https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800"],
        features: ["No-Phone Zone", "Cold Brew Bar", "Bookshelf", "AC"],
        averageRating: 4.8,
        reviewCount:   24,
        ratings: { coffee: 4.7, food: 3.9, ambience: 4.9, wifi: 4.5, quietness: 5.0, value: 4.2 },
        createdBy: seedUser._id,
      },

      // ── 9. Fort ──────────────────────────────────────────────────
      {
        name: "Heritage Brew",
        description:
          "Inside a restored colonial building in Fort, Heritage Brew blends old Bombay charm with specialty coffee. High ceilings, mosaic floors, and a menu that honours the city's history.",
        location: "Mumbai",
        address:  "Horniman Circle, Fort, Mumbai – 400001",
        lat: 18.9337,
        lng: 72.8347,
        category: "Coffee",
        priceRange: "$$",
        images: ["https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800"],
        features: ["Heritage Building", "Wi-Fi", "Specialty Coffee", "Book Corner"],
        averageRating: 4.6,
        reviewCount:   31,
        ratings: { coffee: 4.8, food: 4.2, ambience: 4.9, wifi: 3.8, quietness: 4.4, value: 4.1 },
        createdBy: seedUser._id,
      },

      // ── 10. Worli ────────────────────────────────────────────────
      {
        name: "Velvet Espresso",
        description:
          "Mumbai's most romantic café — velvet booths, candlelit tables, and a menu designed for sharing. A favourite for anniversary dinners and first dates alike. Book ahead on weekends.",
        location: "Mumbai",
        address:  "Dr. Annie Besant Road, Worli, Mumbai – 400018",
        lat: 19.0176,
        lng: 72.8169,
        category: "Date",
        priceRange: "$$$",
        images: ["https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800"],
        features: ["Candlelit", "Reservations Required", "Wine & Coffee", "AC"],
        averageRating: 4.7,
        reviewCount:   22,
        ratings: { coffee: 4.6, food: 4.8, ambience: 5.0, wifi: 2.5, quietness: 4.2, value: 3.8 },
        createdBy: seedUser._id,
      },

      // ── 11. Dadar West ───────────────────────────────────────────
      {
        name: "Chai & Code",
        description:
          "The go-to spot for Dadar's tech crowd — blazing fast fibre Wi-Fi, 24-hour power points, ergonomic chairs, and a focused work culture. Think of it as a co-working space that serves great chai.",
        location: "Mumbai",
        address:  "Gokhale Road, Dadar West, Mumbai – 400028",
        lat: 19.0178,
        lng: 72.8418,
        category: "Work",
        priceRange: "$$",
        images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
        features: ["Blazing Wi-Fi", "Power Outlets", "Standing Desks", "Printer"],
        averageRating: 4.5,
        reviewCount:   49,
        ratings: { coffee: 4.2, food: 4.0, ambience: 4.3, wifi: 5.0, quietness: 4.6, value: 4.7 },
        createdBy: seedUser._id,
      },

      // ── 12. Versova ──────────────────────────────────────────────
      {
        name: "Fisherman's Brew",
        description:
          "A beach-adjacent café in Versova with salty air, hammocks on the deck, and a cold-brew on tap. Come for the sunset, stay for the seafood bruschetta and the chill vibe.",
        location: "Mumbai",
        address:  "Versova Beach Road, Versova, Mumbai – 400061",
        lat: 19.1363,
        lng: 72.8196,
        category: "Chill",
        priceRange: "$$",
        images: ["https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800"],
        features: ["Beach View", "Outdoor Seating", "Cold Brew on Tap", "Pet Friendly"],
        averageRating: 4.3,
        reviewCount:   58,
        ratings: { coffee: 4.1, food: 4.6, ambience: 4.8, wifi: 3.2, quietness: 3.5, value: 4.4 },
        createdBy: seedUser._id,
      },

      // ── 13. Matunga ──────────────────────────────────────────────
      {
        name: "Filter Coffee House",
        description:
          "Authentic South Indian filter coffee meets Mumbai's fast pace. No frills but absolutely no compromises on flavour — the tumbler-and-davara service is an experience in itself.",
        location: "Mumbai",
        address:  "King's Circle, Matunga, Mumbai – 400019",
        lat: 19.0365,
        lng: 72.8644,
        category: "Budget",
        priceRange: "$",
        images: ["https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=800"],
        features: ["Filter Coffee", "Affordable", "Takeaway", "Veg Only"],
        averageRating: 4.3,
        reviewCount:   73,
        ratings: { coffee: 4.8, food: 4.5, ambience: 3.5, wifi: 2.0, quietness: 3.2, value: 5.0 },
        createdBy: seedUser._id,
      },

      // ── 14. Kurla ────────────────────────────────────────────────
      {
        name: "Urban Sip",
        description:
          "A rising favourite in Kurla, Urban Sip punches way above its budget — stylish interiors, solid espresso, and a kitchen that serves filling portions at very fair prices.",
        location: "Mumbai",
        address:  "LBS Marg, Kurla West, Mumbai – 400070",
        lat: 19.0728,
        lng: 72.8834,
        category: "Coffee",
        priceRange: "$",
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"],
        features: ["Wi-Fi", "Affordable", "Quick Service", "AC"],
        averageRating: 4.1,
        reviewCount:   44,
        ratings: { coffee: 4.3, food: 4.1, ambience: 3.9, wifi: 4.0, quietness: 3.8, value: 4.8 },
        createdBy: seedUser._id,
      },

    ];

    const created = await Cafe.insertMany(sampleCafes);
    console.log(`☕ ${created.length} Mumbai cafes inserted`);

    await mongoose.disconnect();
    console.log("✅ Seeding complete. MongoDB disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedCafes();

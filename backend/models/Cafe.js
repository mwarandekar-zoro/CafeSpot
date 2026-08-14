const mongoose = require("mongoose");

// ──────────────────────────────────────────────────────────────────
// Opening Hours sub-schema (one entry per day of the week)
// ──────────────────────────────────────────────────────────────────
const openingHoursSchema = new mongoose.Schema(
  {
    day: { type: String }, // e.g. "Monday"
    open: { type: String }, // e.g. "08:00"
    close: { type: String }, // e.g. "22:00"
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

// ──────────────────────────────────────────────────────────────────
// Main Cafe schema
// ──────────────────────────────────────────────────────────────────
const cafeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Cafe name is required"],
      trim: true,
      maxlength: [100, "Cafe name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    location: {
      type: String, // City or neighbourhood — used for search
      required: [true, "Location is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    // Geographic coordinates for map plotting
    lat: { type: Number },
    lng: { type: Number },

    category: {
      type: String,
      enum: ["Coffee", "Study", "Work", "Date", "Chill", "Budget"],
      default: "Coffee",
    },

    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$"],
      required: [true, "Price range is required"],
    },

    openingHours: [openingHoursSchema],

    images: {
      type: [String], // Array of image URLs
      default: [],
    },

    // Comma-separated feature tags, e.g. "Wi-Fi, Parking, Outdoor"
    features: {
      type: [String],
      default: [],
    },

    // ────────────────────────────────────────────
    // Aggregated rating fields — updated by ratingCalculator
    // whenever a review is added, edited, or deleted.
    // ────────────────────────────────────────────
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (v) => Math.round(v * 10) / 10, // round to 1 decimal
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    // Per-category averages — recalculated after every review change
    ratings: {
      coffee:    { type: Number, default: 0, min: 0, max: 5 },
      food:      { type: Number, default: 0, min: 0, max: 5 },
      ambience:  { type: Number, default: 0, min: 0, max: 5 },
      wifi:      { type: Number, default: 0, min: 0, max: 5 },
      quietness: { type: Number, default: 0, min: 0, max: 5 },
      value:     { type: Number, default: 0, min: 0, max: 5 },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },   // include virtuals when .toJSON() is called
    toObject: { virtuals: true }, // include virtuals when .toObject() is called
  }
);

// ──────────────────────────────────────────────────────────────────
// Mongoose Virtuals — Vibe Scores
// Calculated on-the-fly from stored per-category averages.
// No AI, no extra DB field — just simple math.
// ──────────────────────────────────────────────────────────────────

// 📚 Study Vibe: Wi-Fi + Quietness + Ambience
cafeSchema.virtual("vibes.study").get(function () {
  const { wifi, quietness, ambience } = this.ratings;
  if (!wifi && !quietness && !ambience) return 0;
  return Math.round(((wifi + quietness + ambience) / 3) * 10) / 10;
});

// 💻 Work Vibe: Wi-Fi + Quietness + Ambience (same pillars, shown separately)
cafeSchema.virtual("vibes.work").get(function () {
  const { wifi, quietness, ambience } = this.ratings;
  if (!wifi && !quietness && !ambience) return 0;
  return Math.round(((wifi + quietness + ambience) / 3) * 10) / 10;
});

// ❤️ Date Vibe: Ambience + Food + Quietness
cafeSchema.virtual("vibes.date").get(function () {
  const { ambience, food, quietness } = this.ratings;
  if (!ambience && !food && !quietness) return 0;
  return Math.round(((ambience + food + quietness) / 3) * 10) / 10;
});

// ☕ Coffee Vibe: Coffee + Value
cafeSchema.virtual("vibes.coffee").get(function () {
  const { coffee, value } = this.ratings;
  if (!coffee && !value) return 0;
  return Math.round(((coffee + value) / 2) * 10) / 10;
});

// 🌙 Chill Vibe: Ambience + Coffee + Quietness
cafeSchema.virtual("vibes.chill").get(function () {
  const { ambience, coffee, quietness } = this.ratings;
  if (!ambience && !coffee && !quietness) return 0;
  return Math.round(((ambience + coffee + quietness) / 3) * 10) / 10;
});

// 💰 Budget Vibe: Value + Food
cafeSchema.virtual("vibes.budget").get(function () {
  const { value, food } = this.ratings;
  if (!value && !food) return 0;
  return Math.round(((value + food) / 2) * 10) / 10;
});

// ────────────────────────────────────────────────────────
// Text index for search by name, location, and description
// ────────────────────────────────────────────────────────
cafeSchema.index({ name: "text", location: "text", description: "text" });

const Cafe = mongoose.model("Cafe", cafeSchema);
module.exports = Cafe;

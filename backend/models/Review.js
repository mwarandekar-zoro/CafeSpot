const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },

    cafe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: [true, "Review must belong to a cafe"],
    },

    // ─── Per-category ratings (1–5) ───────────────────────────
    coffeeRating: {
      type: Number,
      required: [true, "Coffee rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    foodRating: {
      type: Number,
      required: [true, "Food rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    ambienceRating: {
      type: Number,
      required: [true, "Ambience rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    wifiRating: {
      type: Number,
      required: [true, "Wi-Fi rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    quietnessRating: {
      type: Number,
      required: [true, "Quietness rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    valueRating: {
      type: Number,
      required: [true, "Value rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    // ─── Auto-calculated overall rating ───────────────────────
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: [true, "Comment is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
      trim: true,
    },

    image: {
      type: String, // Optional review image URL
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────────────────────────
// Compound index: one review per user per cafe.
// Using unique: true prevents duplicate reviews at DB level.
// ──────────────────────────────────────────────────────────────
reviewSchema.index({ user: 1, cafe: 1 }, { unique: true });

// ──────────────────────────────────────────────────────────────
// Pre-save: calculate overallRating as the average of all 6 categories
// ──────────────────────────────────────────────────────────────
reviewSchema.pre("save", function () {
  const {
    coffeeRating,
    foodRating,
    ambienceRating,
    wifiRating,
    quietnessRating,
    valueRating,
  } = this;

  const avg =
    (coffeeRating +
      foodRating +
      ambienceRating +
      wifiRating +
      quietnessRating +
      valueRating) /
    6;

  this.overallRating = Math.round(avg * 10) / 10; // 1 decimal place
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;

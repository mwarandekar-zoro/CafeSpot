/**
 * reviewController.js — Phase 4
 *
 * GET    /api/cafes/:id/reviews  — list all reviews for a cafe (public)
 * POST   /api/cafes/:id/reviews  — add a review (authenticated)
 * PUT    /api/reviews/:id        — edit own review (owner only)
 * DELETE /api/reviews/:id        — delete review (owner or admin)
 */

const mongoose = require("mongoose");
const Review   = require("../models/Review");
const Cafe     = require("../models/Cafe");
const { recalculateCafeRatings } = require("../utils/ratingCalculator");

// ─────────────────────────────────────────────────────────────────
// @desc    Get all reviews for a cafe
// @route   GET /api/cafes/:id/reviews
// @access  Public
// ─────────────────────────────────────────────────────────────────
const getCafeReviews = async (req, res) => {
  try {
    const { id: cafeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      return res.status(400).json({ success: false, message: "Invalid cafe ID" });
    }

    const cafeExists = await Cafe.exists({ _id: cafeId });
    if (!cafeExists) {
      return res.status(404).json({ success: false, message: "Cafe not found" });
    }

    const reviews = await Review.find({ cafe: cafeId })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Add a review to a cafe
// @route   POST /api/cafes/:id/reviews
// @access  Private (authenticated user)
// ─────────────────────────────────────────────────────────────────
const addReview = async (req, res) => {
  try {
    const { id: cafeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      return res.status(400).json({ success: false, message: "Invalid cafe ID" });
    }

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" });
    }

    // One review per user per cafe (enforced by compound index + this check)
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      cafe: cafeId,
    });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this cafe",
      });
    }

    const {
      coffeeRating,
      foodRating,
      ambienceRating,
      wifiRating,
      quietnessRating,
      valueRating,
      comment,
      image,
    } = req.body;

    const review = await Review.create({
      user:            req.user._id,
      cafe:            cafeId,
      coffeeRating,
      foodRating,
      ambienceRating,
      wifiRating,
      quietnessRating,
      valueRating,
      comment,
      image:           image || "",
    });

    // Recalculate and persist cafe aggregate ratings
    await recalculateCafeRatings(new mongoose.Types.ObjectId(cafeId));

    await review.populate("user", "name profileImage");

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    // Duplicate key (compound unique index fallback)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this cafe",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private — review owner only
// ─────────────────────────────────────────────────────────────────
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Only the review owner can edit (admins can delete, not edit others' words)
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this review",
      });
    }

    // Update only the allowed fields
    const allowed = [
      "coffeeRating",
      "foodRating",
      "ambienceRating",
      "wifiRating",
      "quietnessRating",
      "valueRating",
      "comment",
      "image",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });

    // .save() triggers the pre-save hook → recalculates overallRating
    await review.save();

    // Recalculate cafe aggregate ratings
    await recalculateCafeRatings(review.cafe);

    await review.populate("user", "name profileImage");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private — review owner or admin
// ─────────────────────────────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    const cafeId = review.cafe;
    await Review.findByIdAndDelete(id);

    // Recalculate cafe aggregate ratings (resets to 0 if no reviews remain)
    await recalculateCafeRatings(cafeId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCafeReviews, addReview, updateReview, deleteReview };

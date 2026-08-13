/**
 * userController.js — Phase 5
 *
 * GET /api/users/profile    — current user's profile
 * PUT /api/users/profile    — update name / profileImage (role blocked)
 * GET /api/users/reviews    — reviews written by current user
 * GET /api/users/cafes      — cafes created by current user
 * GET /api/users/favorites  — current user's favorited cafes
 */

const User     = require("../models/User");
const Review   = require("../models/Review");
const Cafe     = require("../models/Cafe");
const Favorite = require("../models/Favorite");

// ─────────────────────────────────────────────────────────────────
// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    // req.user is set by protect middleware (already excludes password)
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Whitelist — users may NOT change email, password, or role here
    const { name, profileImage } = req.body;

    if (name !== undefined)         user.name         = name;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    // Return safe fields only
    const updated = await User.findById(user._id).select("-password");
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user:    updated,
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
// @desc    Get reviews written by the current user
// @route   GET /api/users/reviews
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("cafe", "name location category priceRange images")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get cafes created by the current user
// @route   GET /api/users/cafes
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getMyCafes = async (req, res) => {
  try {
    const cafes = await Cafe.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: cafes.length, cafes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get current user's favorited cafes
// @route   GET /api/users/favorites
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path:   "cafe",
        select: "name location address category priceRange images averageRating reviewCount features",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: favorites.length, favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get Owner Dashboard analytics and cafes list
// @route   GET /api/users/owner-dashboard
// @access  Private (Owner/Admin)
// ─────────────────────────────────────────────────────────────────
const getOwnerDashboard = async (req, res) => {
  try {
    const cafes = await Cafe.find({ createdBy: req.user._id });
    
    const cafesWithStats = await Promise.all(
      cafes.map(async (cafe) => {
        const reviews = await Review.find({ cafe: cafe._id })
          .populate("user", "name profileImage")
          .sort({ createdAt: -1 })
          .limit(5);

        return {
          ...cafe.toObject({ virtuals: true }),
          recentReviews: reviews
        };
      })
    );

    const totalCafes = cafes.length;
    const totalReviews = cafes.reduce((sum, c) => sum + (c.reviewCount || 0), 0);
    const avgRating = totalCafes > 0 
      ? Math.round((cafes.reduce((sum, c) => sum + (c.averageRating || 0), 0) / totalCafes) * 10) / 10
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCafes,
        totalReviews,
        averageRating: avgRating
      },
      cafes: cafesWithStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile, getMyReviews, getMyCafes, getMyFavorites, getOwnerDashboard };

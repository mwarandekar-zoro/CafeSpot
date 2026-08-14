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
        // Fetch ALL reviews for trend + breakdown (no limit)
        const allReviews = await Review.find({ cafe: cafe._id })
          .populate("user", "name profileImage")
          .sort({ createdAt: -1 });

        // 5 most recent for the feed
        const recentReviews = allReviews.slice(0, 5);

        // Monthly trend: count reviews per YYYY-MM bucket
        const trendMap = {};
        allReviews.forEach((r) => {
          const key = r.createdAt.toISOString().slice(0, 7); // "2024-03"
          trendMap[key] = (trendMap[key] || 0) + 1;
        });

        // Build last 6 months array (including months with 0 reviews)
        const trend = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setDate(1);
          d.setMonth(d.getMonth() - i);
          const key = d.toISOString().slice(0, 7);
          trend.push({ month: key, count: trendMap[key] || 0 });
        }

        return {
          ...cafe.toObject({ virtuals: true }),
          recentReviews,
          allReviewCount: allReviews.length,
          trend,
        };
      })
    );

    const totalCafes   = cafes.length;
    const totalReviews = cafes.reduce((sum, c) => sum + (c.reviewCount || 0), 0);
    const avgRating    = totalCafes > 0
      ? Math.round((cafes.reduce((sum, c) => sum + (c.averageRating || 0), 0) / totalCafes) * 10) / 10
      : 0;

    // Best-performing cafe (highest averageRating)
    const bestCafe = cafes.length > 0
      ? cafes.reduce((best, c) => (c.averageRating > (best?.averageRating || 0) ? c : best), null)
      : null;

    res.status(200).json({
      success: true,
      stats: {
        totalCafes,
        totalReviews,
        averageRating: avgRating,
        bestCafeId: bestCafe?._id || null,
      },
      cafes: cafesWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = { getProfile, updateProfile, getMyReviews, getMyCafes, getMyFavorites, getOwnerDashboard };

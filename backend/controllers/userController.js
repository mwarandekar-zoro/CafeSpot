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

        // Monthly trend: count reviews and calculate average ratings per YYYY-MM bucket
        const trendMap = {};
        allReviews.forEach((r) => {
          const key = r.createdAt.toISOString().slice(0, 7); // "2024-03"
          if (!trendMap[key]) {
            trendMap[key] = { count: 0, ratingSum: 0 };
          }
          trendMap[key].count += 1;
          trendMap[key].ratingSum += r.overallRating;
        });

        // Build last 6 months array (including months with 0 reviews)
        const trend = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setDate(1);
          d.setMonth(d.getMonth() - i);
          const key = d.toISOString().slice(0, 7);
          const monthData = trendMap[key] || { count: 0, ratingSum: 0 };
          const avg = monthData.count > 0 ? Math.round((monthData.ratingSum / monthData.count) * 10) / 10 : 0;
          trend.push({ month: key, count: monthData.count, avgRating: avg });
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

// ─────────────────────────────────────────────────────────────────
// @desc    Get Admin Dashboard analytics, cafes list, and users count
// @route   GET /api/users/admin-dashboard
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────
const getAdminDashboard = async (req, res) => {
  try {
    const cafes = await Cafe.find({}).populate("createdBy", "name email role");
    const users = await User.find({});

    const cafesWithStats = await Promise.all(
      cafes.map(async (cafe) => {
        const allReviews = await Review.find({ cafe: cafe._id })
          .populate("user", "name profileImage")
          .sort({ createdAt: -1 });

        const recentReviews = allReviews.slice(0, 5);

        const trendMap = {};
        allReviews.forEach((r) => {
          const key = r.createdAt.toISOString().slice(0, 7);
          if (!trendMap[key]) {
            trendMap[key] = { count: 0, ratingSum: 0 };
          }
          trendMap[key].count += 1;
          trendMap[key].ratingSum += r.overallRating;
        });

        const trend = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setDate(1);
          d.setMonth(d.getMonth() - i);
          const key = d.toISOString().slice(0, 7);
          const monthData = trendMap[key] || { count: 0, ratingSum: 0 };
          const avg = monthData.count > 0 ? Math.round((monthData.ratingSum / monthData.count) * 10) / 10 : 0;
          trend.push({ month: key, count: monthData.count, avgRating: avg });
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

    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const ownerCount = users.filter((u) => u.role === "owner").length;
    const visitorCount = users.filter((u) => u.role === "visitor").length;

    // Best-performing cafe (highest averageRating)
    const bestCafe = cafes.length > 0
      ? cafes.reduce((best, c) => (c.averageRating > (best?.averageRating || 0) ? c : best), null)
      : null;

    // ── Aggregation 1: Most Reviewed Cafés (Lookup pipeline) ──
    const mostReviewed = await Review.aggregate([
      { $group: { _id: "$cafe", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "cafes",
          localField: "_id",
          foreignField: "_id",
          as: "cafeDetails"
        }
      },
      { $unwind: "$cafeDetails" },
      {
        $project: {
          _id: 1,
          count: 1,
          name: "$cafeDetails.name",
          location: "$cafeDetails.location",
          averageRating: "$cafeDetails.averageRating"
        }
      }
    ]);

    // ── Aggregation 2: User Sign-ups over time (10 days timeline) ──
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 9);
    tenDaysAgo.setHours(0, 0, 0, 0);

    const signupAggregate = await User.aggregate([
      { $match: { createdAt: { $gte: tenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const signupMap = {};
    signupAggregate.forEach(item => {
      signupMap[item._id] = item.count;
    });

    const signupsTrend = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      signupsTrend.push({
        date: key,
        count: signupMap[key] || 0
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalCafes,
        totalReviews,
        averageRating: avgRating,
        bestCafeId: bestCafe?._id || null,
        totalUsers,
        adminCount,
        ownerCount,
        visitorCount,
        mostReviewed,
        signupsTrend,
      },
      cafes: cafesWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get all registered users
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user's role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["visitor", "owner", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    // Admins cannot change their own role to prevent self-lockout
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ success: false, message: "You cannot change your own role." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: `User role updated to ${role} successfully.`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user status (deactivate/reactivate)
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    // Admins cannot deactivate their own account
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ success: false, message: "You cannot deactivate your own account." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? "activated" : "deactivated"} successfully.`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getProfile,
  updateProfile,
  getMyReviews,
  getMyCafes,
  getMyFavorites,
  getOwnerDashboard,
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
};

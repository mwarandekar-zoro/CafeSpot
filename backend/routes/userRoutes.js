const express  = require("express");
const router   = express.Router();
const {
  getProfile,
  updateProfile,
  getMyReviews,
  getMyCafes,
  getMyFavorites,
  getOwnerDashboard,
} = require("../controllers/userController");
const { protect, ownerOrAdminOnly } = require("../middleware/authMiddleware");

// GET /api/users/profile   — get current user's profile
// PUT /api/users/profile   — update name / profileImage
router.route("/profile").get(protect, getProfile).put(protect, updateProfile);

// GET /api/users/reviews   — reviews written by current user
router.get("/reviews", protect, getMyReviews);

// GET /api/users/cafes     — cafes created by current user
router.get("/cafes", protect, getMyCafes);

// GET /api/users/favorites — cafes saved by current user
router.get("/favorites", protect, getMyFavorites);

// GET /api/users/owner-dashboard - stats and cafes for café owners
router.get("/owner-dashboard", protect, ownerOrAdminOnly, getOwnerDashboard);

module.exports = router;

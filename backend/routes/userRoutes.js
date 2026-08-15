const express  = require("express");
const router   = express.Router();
const {
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
} = require("../controllers/userController");
const { protect, adminOnly, ownerOnly } = require("../middleware/authMiddleware");

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
router.get("/owner-dashboard", protect, ownerOnly, getOwnerDashboard);

// GET /api/users/admin-dashboard - stats, cafes and users count for admin
router.get("/admin-dashboard", protect, adminOnly, getAdminDashboard);

// ── Admin-Only User Management Routes ──
// GET /api/users - get all registered users
router.get("/", protect, adminOnly, getAllUsers);

// PUT /api/users/:id/role - update user role (admin only)
router.put("/:id/role", protect, adminOnly, updateUserRole);

// PUT /api/users/:id/status - toggle user active status (admin only)
router.put("/:id/status", protect, adminOnly, toggleUserStatus);

module.exports = router;

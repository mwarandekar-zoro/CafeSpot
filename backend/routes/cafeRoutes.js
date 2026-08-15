const express = require("express");
const router = express.Router();
const {
  getCafes,
  getCafeById,
  createCafe,
  updateCafe,
  deleteCafe,
  bulkUpdateCafes,
  getRecommendations,
} = require("../controllers/cafeController");

const {
  getCafeReviews,
  addReview,
} = require("../controllers/reviewController");

const { protect, ownerOrAdminOnly, optionalProtect } = require("../middleware/authMiddleware");

// ──────────────────────────────────────────────────────
//  Cafe Routes
// ──────────────────────────────────────────────────────

// GET  /api/cafes/recommendations — Private/Public (personalized recommendations)
router.route("/recommendations")
  .get(optionalProtect, getRecommendations);

// PUT  /api/cafes/bulk-update — Private (Owner/Admin)
router.route("/bulk-update")
  .put(protect, ownerOrAdminOnly, bulkUpdateCafes);

// GET  /api/cafes  — Public (search / filter / sort / paginate)
// POST /api/cafes  — Private (authenticated users only)
router.route("/")
  .get(getCafes)
  .post(protect, ownerOrAdminOnly, createCafe);

// GET    /api/cafes/:id  — Public
// PUT    /api/cafes/:id  — Private (owner or admin)
// DELETE /api/cafes/:id  — Private (owner or admin)
router.route("/:id")
  .get(getCafeById)
  .put(protect, ownerOrAdminOnly, updateCafe)
  .delete(protect, ownerOrAdminOnly, deleteCafe);

// ──────────────────────────────────────────────────────
//  Nested Review Routes  →  /api/cafes/:id/reviews
// ──────────────────────────────────────────────────────

// GET  /api/cafes/:id/reviews  — Public
// POST /api/cafes/:id/reviews  — Private (Phase 4)
router.route("/:id/reviews")
  .get(getCafeReviews)
  .post(protect, addReview);

module.exports = router;


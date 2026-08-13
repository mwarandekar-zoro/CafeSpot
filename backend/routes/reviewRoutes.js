const express = require("express");
const router  = express.Router();

const { updateReview, deleteReview } = require("../controllers/reviewController");
const { protect }                    = require("../middleware/authMiddleware");

// PUT    /api/reviews/:id  — edit a review   (owner only)
// DELETE /api/reviews/:id  — delete a review (owner or admin)
router.route("/:id")
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;

const express  = require("express");
const router   = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware");

// GET    /api/favorites          — list user's saved cafes
router.get("/", protect, getFavorites);

// POST   /api/favorites/:cafeId  — save a cafe
// DELETE /api/favorites/:cafeId  — unsave a cafe
router.route("/:cafeId")
  .post(protect, addFavorite)
  .delete(protect, removeFavorite);

module.exports = router;

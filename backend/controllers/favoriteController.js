/**
 * favoriteController.js — Phase 5
 *
 * GET    /api/favorites           — list the logged-in user's saved cafes
 * POST   /api/favorites/:cafeId   — save a cafe
 * DELETE /api/favorites/:cafeId   — unsave a cafe
 */

const mongoose = require("mongoose");
const Favorite  = require("../models/Favorite");
const Cafe      = require("../models/Cafe");

// ─────────────────────────────────────────────────────────────────
// @desc    Get all favorites for the logged-in user
// @route   GET /api/favorites
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path:    "cafe",
        select:  "name location address category priceRange images averageRating reviewCount features",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count:   favorites.length,
      favorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Add a cafe to favorites
// @route   POST /api/favorites/:cafeId
// @access  Private
// ─────────────────────────────────────────────────────────────────
const addFavorite = async (req, res) => {
  try {
    const { cafeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      return res.status(400).json({ success: false, message: "Invalid cafe ID" });
    }

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" });
    }

    // Compound unique index handles duplicates at DB level — also check first
    const existing = await Favorite.findOne({ user: req.user._id, cafe: cafeId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Cafe already in favorites" });
    }

    const favorite = await Favorite.create({ user: req.user._id, cafe: cafeId });
    await favorite.populate("cafe", "name location category priceRange images averageRating");

    res.status(201).json({
      success:  true,
      message:  "Cafe added to favorites",
      favorite,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Cafe already in favorites" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Remove a cafe from favorites
// @route   DELETE /api/favorites/:cafeId
// @access  Private
// ─────────────────────────────────────────────────────────────────
const removeFavorite = async (req, res) => {
  try {
    const { cafeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      return res.status(400).json({ success: false, message: "Invalid cafe ID" });
    }

    const favorite = await Favorite.findOneAndDelete({ user: req.user._id, cafe: cafeId });
    if (!favorite) {
      return res.status(404).json({ success: false, message: "Favorite not found" });
    }

    res.status(200).json({ success: true, message: "Cafe removed from favorites" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };

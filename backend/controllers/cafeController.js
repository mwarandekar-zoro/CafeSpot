const mongoose = require("mongoose");
const Cafe = require("../models/Cafe");

// ─────────────────────────────────────────────────────────────────
// @desc    Get all cafes — with search, filter, sort, pagination
// @route   GET /api/cafes
// @access  Public
// Query params:
//   search    — text search (name, location, description)
//   category  — Coffee | Study | Work | Date | Chill | Budget
//   price     — $ | $$ | $$$
//   minRating — minimum averageRating (0–5)
//   features  — comma-separated, e.g. "Wi-Fi,Parking"
//   sort      — rating | popular | newest  (default: newest)
//   page      — page number (default: 1)
//   limit     — results per page (default: 12)
// ─────────────────────────────────────────────────────────────────
const getCafes = async (req, res) => {
  try {
    const {
      search,
      category,
      price,
      minRating,
      features,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    // ── Build filter object ──────────────────────────────────────
    const filter = {};

    // Full-text search on name / location / description
    if (search) {
      filter.$text = { $search: search };
    }

    if (category) filter.category = category;
    if (price) filter.priceRange = price;

    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Features: all listed features must exist in the cafe's features array
    if (features) {
      const featureList = features.split(",").map((f) => f.trim());
      filter.features = { $all: featureList };
    }

    // ── Build sort object ────────────────────────────────────────
    let sortObj = {};
    switch (sort) {
      case "rating":
        sortObj = { averageRating: -1 };
        break;
      case "popular":
        sortObj = { reviewCount: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
    }

    // ── Pagination ───────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // cap at 50
    const skip     = (pageNum - 1) * limitNum;

    // ── Execute query ────────────────────────────────────────────
    const [cafeDocs, total] = await Promise.all([
      Cafe.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("createdBy", "name profileImage"),
      Cafe.countDocuments(filter),
    ]);

    // toObject({ virtuals: true }) correctly serialises nested vibe virtuals
    const cafes = cafeDocs.map((c) => c.toObject({ virtuals: true }));

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages,
      limit: limitNum,
      cafes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get a single cafe by ID
// @route   GET /api/cafes/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────
const getCafeById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid cafe ID" });
    }

    // Increment views counter
    const cafeDoc = await Cafe.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("createdBy", "name profileImage");

    if (!cafeDoc) {
      return res.status(404).json({ success: false, message: "Cafe not found" });
    }

    const cafe = cafeDoc.toObject({ virtuals: true });

    res.status(200).json({ success: true, cafe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Create a new cafe
// @route   POST /api/cafes
// @access  Private (authenticated user)
// ─────────────────────────────────────────────────────────────────
const createCafe = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      address,
      category,
      priceRange,
      openingHours,
      images,
      features,
    } = req.body;

    // Attach the logged-in user as creator
    const cafe = await Cafe.create({
      name,
      description,
      location,
      address,
      category,
      priceRange,
      openingHours: openingHours || [],
      images:       images       || [],
      features:     features     || [],
      createdBy:    req.user._id,
    });

    // Populate creator info before responding
    await cafe.populate("createdBy", "name profileImage");

    res.status(201).json({
      success: true,
      message: "Cafe created successfully",
      cafe,
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
// @desc    Update a cafe
// @route   PUT /api/cafes/:id
// @access  Private — owner or admin
// ─────────────────────────────────────────────────────────────────
const updateCafe = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid cafe ID" });
    }

    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" });
    }

    // Authorization: only owner or admin may update
    const isOwner = cafe.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this cafe",
      });
    }

    // Only allow updating safe fields (not ratings — those are system-managed)
    const allowedFields = [
      "name", "description", "location", "address",
      "category", "priceRange", "openingHours", "images", "features",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        cafe[field] = req.body[field];
      }
    });

    await cafe.save();
    await cafe.populate("createdBy", "name profileImage");

    res.status(200).json({
      success: true,
      message: "Cafe updated successfully",
      cafe,
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
// @desc    Delete a cafe
// @route   DELETE /api/cafes/:id
// @access  Private — owner or admin
// ─────────────────────────────────────────────────────────────────
const deleteCafe = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid cafe ID" });
    }

    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" });
    }

    // Authorization: only owner or admin may delete
    const isOwner = cafe.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this cafe",
      });
    }

    await Cafe.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Cafe deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Bulk update cafes (category, price range)
// @route   PUT /api/cafes/bulk-update
// @access  Private — owner or admin
// ─────────────────────────────────────────────────────────────────
const bulkUpdateCafes = async (req, res) => {
  try {
    const { ids, category, priceRange } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No café IDs provided." });
    }

    const updateFields = {};
    if (category) updateFields.category = category;
    if (priceRange) updateFields.priceRange = priceRange;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: "No fields provided to update." });
    }

    // Ownership verification: users must own all target cafes unless they are admin
    if (req.user.role !== "admin") {
      const count = await Cafe.countDocuments({ _id: { $in: ids }, createdBy: req.user._id });
      if (count !== ids.length) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not own all selected café listings."
        });
      }
    }

    await Cafe.updateMany({ _id: { $in: ids } }, { $set: updateFields });

    res.status(200).json({
      success: true,
      message: `Successfully updated ${ids.length} cafés.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get personalized recommendations for the logged-in user
// @route   GET /api/cafes/recommendations
// @access  Private/Public (graceful fallback if not logged in)
// ─────────────────────────────────────────────────────────────────
const getRecommendations = async (req, res) => {
  try {
    const Review = require("../models/Review");
    const Favorite = require("../models/Favorite");

    const userId = req.user ? req.user._id : null;
    if (!userId) {
      // Cold start / Guest: suggest 3 top rated cafes
      const defaultCafes = await Cafe.find({}).sort({ averageRating: -1 }).limit(3);
      return res.status(200).json({ success: true, cafes: defaultCafes });
    }

    // 1. Fetch user's favorites
    const favs = await Favorite.find({ user: userId });
    const favCafeIds = favs.map(f => f.cafe.toString());

    // 2. Fetch user's reviews
    const reviews = await Review.find({ user: userId });
    const reviewedCafeIds = reviews.map(r => r.cafe.toString());

    const interactedCafeIds = new Set([...favCafeIds, ...reviewedCafeIds]);

    // 3. Score categories based on user interactions
    const categoryScores = {};
    const interactedCafes = await Cafe.find({ _id: { $in: Array.from(interactedCafeIds) } });
    interactedCafes.forEach(c => {
      if (c.category) {
        categoryScores[c.category] = (categoryScores[c.category] || 0) + 1.0;
      }
    });

    // Find the category with maximum score
    let preferredCategory = null;
    let maxScore = 0;
    Object.entries(categoryScores).forEach(([cat, score]) => {
      if (score > maxScore) {
        maxScore = score;
        preferredCategory = cat;
      }
    });

    let query = {};
    if (preferredCategory) {
      query = {
        category: preferredCategory,
        _id: { $nin: Array.from(interactedCafeIds) }
      };
    } else {
      query = {
        _id: { $nin: Array.from(interactedCafeIds) }
      };
    }

    let recommended = await Cafe.find(query)
      .sort({ averageRating: -1 })
      .limit(3);

    // Fallback: fill recommendations if there are less than 3 matching items
    if (recommended.length < 3) {
      const extraCount = 3 - recommended.length;
      const excludedIds = new Set([...interactedCafeIds, ...recommended.map(c => c._id.toString())]);
      const fallbacks = await Cafe.find({ _id: { $nin: Array.from(excludedIds) } })
        .sort({ averageRating: -1 })
        .limit(extraCount);
      recommended = [...recommended, ...fallbacks];
    }

    res.status(200).json({ success: true, cafes: recommended, preferredCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = { getCafes, getCafeById, createCafe, updateCafe, deleteCafe, bulkUpdateCafes, getRecommendations };


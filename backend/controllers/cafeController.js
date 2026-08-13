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

    const cafeDoc = await Cafe.findById(req.params.id)
      .populate("createdBy", "name profileImage");

    // toObject({ virtuals: true }) correctly serialises nested vibe virtuals
    const cafe = cafeDoc ? cafeDoc.toObject({ virtuals: true }) : null;

    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" });
    }

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

module.exports = { getCafes, getCafeById, createCafe, updateCafe, deleteCafe };


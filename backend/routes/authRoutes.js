const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register  — Public
router.post("/register", register);

// POST /api/auth/login     — Public
router.post("/login", login);

// GET  /api/auth/me        — Private (JWT required)
router.get("/me", protect, getMe);

module.exports = router;


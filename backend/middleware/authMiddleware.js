const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────────────
// @desc  Protect routes — verifies the JWT in the Authorization header.
//        On success: attaches req.user = { id, name, email, role }
//        On failure: responds 401 Unauthorized
// ─────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // ── 1. Extract token from "Authorization: Bearer <token>" header ──
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // ── 2. Verify JWT signature and decode ──
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── 3. Confirm the user still exists in the database ──
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    // ── 4. Attach user to request object ──
    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws JsonWebTokenError / TokenExpiredError
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token has expired. Please log in again." });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc  Restrict access to admin users only.
//        Must be used AFTER the protect middleware.
// ─────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({
    success: false,
    message: "Access denied. Admin privileges required.",
  });
};

module.exports = { protect, adminOnly };


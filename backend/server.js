const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config({ quiet: true });

// Note: when the file is required as a module (for tests), we do NOT
// automatically connect or start listening. Tests will control the
// MongoDB lifecycle using an in-memory server.
// ─── Connect to MongoDB (only when run directly) ─────────────────
if (require.main === module) {
  connectDB();
}

const app = express();

// ─── Core Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Register Mongoose Models ───────────────────────────────────
// Importing the models here ensures Mongoose registers their schemas,
// indexes, and hooks on every server start. Required before any route
// tries to use them.
require("./models/User");
require("./models/Cafe");
require("./models/Review");
require("./models/Favorite");

// ─── Health Check ───────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CaféSpot API is running ☕",
    phase: "Phase 1 — Models & Routes registered",
    timestamp: new Date().toISOString(),
  });
});

// ─── Route Mounting ─────────────────────────────────────────────
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/cafes",     require("./routes/cafeRoutes"));
app.use("/api/reviews",   require("./routes/reviewRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/users",     require("./routes/userRoutes"));

// ─── Error Handling (must be last) ──────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server (only when run directly) ───────────────────────
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 CaféSpot server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;


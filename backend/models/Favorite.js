const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Favorite must belong to a user"],
    },

    cafe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: [true, "Favorite must reference a cafe"],
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────────
// Compound unique index: prevents a user from saving the same cafe twice
// ─────────────────────────────────────────────────────────────────
favoriteSchema.index({ user: 1, cafe: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);
module.exports = Favorite;

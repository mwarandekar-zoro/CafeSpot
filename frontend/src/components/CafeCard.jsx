import React from "react";
import { Link } from "react-router-dom";
import Rating from "./Rating";

export default function CafeCard({
  cafe,
  isFavorited = false,
  onFavoriteToggle,
}) {
  if (!cafe) return null;

  const {
    _id,
    name,
    location,
    images = [],
    averageRating = 0,
    reviewCount = 0,
    priceRange = "$$",
    category = "Coffee",
  } = cafe;

  const defaultImage = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800";
  const coverImage = images.length > 0 ? images[0] : defaultImage;

  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(_id);
    }
  };

  return (
    <div className="glass-flat cafe-card fade-in">
      {/* Card Image Wrapper */}
      <div className="cafe-card-image-wrap">
        <img src={coverImage} alt={name} className="cafe-card-image" />
        {/* Category Badge */}
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2 }}>
          <span className="badge badge-accent">{category}</span>
        </div>
        {/* Favorite Button */}
        <button
          onClick={handleFavClick}
          className="cafe-card-fav-btn"
          style={{ color: isFavorited ? "#e05252" : "var(--text-primary)" }}
        >
          {isFavorited ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Card Body */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1 }}>
        <div className="flex-between">
          <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
            {name}
          </h4>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", letterSpacing: 0 }}>{priceRange}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          <span>📍</span>
          <span>{location}</span>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Rating value={averageRating} count={reviewCount} showText={true} />

          <Link to={`/cafes/${_id}`} className="btn btn-ghost btn-sm btn-full text-accent" style={{ borderColor: "rgba(200, 134, 10, 0.3)" }}>
            Explore Vibe
          </Link>
        </div>
      </div>
    </div>
  );
}

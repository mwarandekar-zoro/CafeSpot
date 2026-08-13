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
    <div className="glass fade-in" style={{
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      transition: "transform var(--transition), box-shadow var(--transition)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "var(--shadow-glow), var(--shadow-md)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "var(--shadow-card)";
    }}
    >
      {/* Card Image Wrapper */}
      <div style={{ position: "relative", width: "100%", height: "200px", overflow: "hidden" }}>
        <img
          src={coverImage}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        />
        {/* Category Badge */}
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2 }}>
          <span className="badge badge-accent">{category}</span>
        </div>
        {/* Favorite Button */}
        <button
          onClick={handleFavClick}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 2,
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(10, 10, 12, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            color: isFavorited ? "#e05252" : "var(--text-primary)",
            transition: "transform var(--transition)",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
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
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}>{priceRange}</span>
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

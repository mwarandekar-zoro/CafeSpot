import React from "react";
import { Link } from "react-router-dom";

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

  const rupeePrice = priceRange.replace(/\$/g, "₹");

  const vibeLabels = {
    study: { icon: "📚", label: "Study" },
    work: { icon: "💻", label: "Work" },
    date: { icon: "❤️", label: "Date" },
    coffee: { icon: "☕", label: "Coffee" },
    chill: { icon: "🌙", label: "Chill" },
    budget: { icon: "💰", label: "Budget" }
  };

  const getTopVibes = () => {
    if (!cafe.vibes) return [];
    return Object.entries(cafe.vibes)
      .filter(([key, val]) => val > 0 && vibeLabels[key])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([key, _]) => vibeLabels[key]);
  };

  const topVibes = getTopVibes();
  if (topVibes.length === 0) {
    const key = category.toLowerCase();
    if (vibeLabels[key]) {
      topVibes.push(vibeLabels[key]);
    }
  }

  const getSnippet = (desc = "") => {
    const firstSentence = desc.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length < 75) {
      return `"${firstSentence}."`;
    }
    return `"${desc.slice(0, 55)}..."`;
  };
  const snippet = getSnippet(cafe.description);

  return (
    <div className="glass-flat cafe-card fade-in">
      {/* Card Image Wrapper */}
      <div className="cafe-card-image-wrap">
        <img src={coverImage} alt={name} className="cafe-card-image" />
        
        {/* Category Badge overlay on top left */}
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2 }}>
          <span className="badge badge-accent" style={{ fontSize: "0.7rem", padding: "3px 8px" }}>
            {category}
          </span>
        </div>

        {/* Rating and Favorite overlay at the bottom of image wrapper */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: "linear-gradient(to top, rgba(10,10,12,0.95), transparent)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 3
        }}>
          {/* Rating Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(0,0,0,0.55)", padding: "4px 8px", borderRadius: "var(--radius-sm)", backdropFilter: "blur(4px)" }}>
            <span style={{ color: "var(--star-filled)", fontSize: "0.9rem" }}>★</span>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#fff" }}>
              {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavClick}
            className="cafe-card-fav-btn-new"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.3rem",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease, filter 0.2s ease"
            }}
          >
            {isFavorited ? "❤️" : "🤍"}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1 }}>
        {/* Name & Location + Price */}
        <div>
          <h4 className="cafe-card-title" style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: "700", marginBottom: "4px", color: "var(--text-primary)" }}>
            {name}
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            <span>📍 {location}</span>
            <span>·</span>
            <span style={{ fontWeight: "700", color: "var(--accent-light)", letterSpacing: 0 }}>
              {rupeePrice}
            </span>
          </div>
        </div>

        {/* Vibe Tags Row */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "4px 0" }}>
          {topVibes.map((v, i) => (
            <span key={i} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.75rem",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              background: "var(--glass-md)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
              fontWeight: "600"
            }}>
              <span>{v.icon}</span>
              <span>{v.label}</span>
            </span>
          ))}
        </div>

        {/* Snippet Quote */}
        <p style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          fontStyle: "italic",
          lineHeight: "1.45",
          margin: "4px 0 8px 0"
        }}>
          {snippet}
        </p>

        {/* View spot button (bottom aligned) */}
        <div style={{ marginTop: "auto", paddingTop: "8px" }}>
          <Link to={`/cafes/${_id}`} className="cafe-card-link" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            fontWeight: "700",
            color: "var(--accent-light)",
            transition: "color 0.2s ease"
          }}>
            <span>View spot</span>
            <span className="arrow" style={{ transition: "transform 0.2s ease" }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

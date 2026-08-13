import React from "react";

export default function Rating({ value = 0, count, showText = true }) {
  const roundedValue = Math.round(value * 2) / 2; // round to nearest 0.5
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(<span key={i}>★</span>);
    } else if (value >= i - 0.5) {
      stars.push(<span key={i} style={{ position: "relative", display: "inline-block", color: "var(--star-filled)" }}>
        <span style={{ position: "absolute", overflow: "hidden", width: "50%" }}>★</span>
        <span style={{ color: "var(--star-empty)" }}>★</span>
      </span>);
    } else {
      stars.push(<span key={i} className="star-empty">★</span>);
    }
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <span className="stars" style={{ display: "inline-flex", alignItems: "center" }}>{stars}</span>
      {showText && (
        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
          {value > 0 ? value.toFixed(1) : "N/A"}
          {count !== undefined && (
            <span style={{ color: "var(--text-secondary)", fontWeight: "normal", marginLeft: "4px" }}>
              ({count} {count === 1 ? "review" : "reviews"})
            </span>
          )}
        </span>
      )}
    </div>
  );
}

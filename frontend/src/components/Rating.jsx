import React from "react";

export default function Rating({ value = 0, count = 0, showText = false }) {
  const display = isNaN(value) ? 0 : Number(value).toFixed(1);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
      <div style={{ color: "var(--star-filled)", fontWeight: 700 }}>★ {display}</div>
      {showText && <div style={{ color: "var(--text-secondary)" }}>{count ? `${count} reviews` : "No reviews"}</div>}
    </div>
  );
}

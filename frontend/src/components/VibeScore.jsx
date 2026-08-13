import React from "react";

// Small visualization of vibe scores (study, work, chill, etc.)
export default function VibeScore({ vibes = {}, compact = false }) {
  const entries = Object.entries(vibes || {});
  if (entries.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
      {entries.map(([key, val]) => (
        <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: compact ? 60 : 90 }}>
          <div style={{ fontSize: compact ? "0.85rem" : "0.95rem", fontWeight: 700, color: "var(--accent-light)" }}>{key}</div>
          <div style={{ fontSize: compact ? "0.85rem" : "0.95rem", color: "var(--text-secondary)" }}>{(val || 0).toFixed ? (Number(val).toFixed(1)) : val}</div>
        </div>
      ))}
    </div>
  );
}
